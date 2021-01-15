use crate::{
    actor::{
        db::event::{EventPayload, NewEvent},
        event_processor::EventProcessor,
    },
    schema::EventKind,
};
use actix::{Actor, Addr, Context, Handler, Message, Running};
use anyhow::anyhow;
use audio::{Audio, Spec};
use bincode::deserialize;
use bytes::BytesMut;
use hound::{WavSpec, WavWriter};
use serde::de::Deserialize;
use slog::Logger;
use std::{
    collections::HashMap, convert::TryInto, fmt::Debug, fs::File, io::BufWriter, path::PathBuf,
};
use uuid::Uuid;

struct AudioWriter {
    inner: Option<WavWriter<BufWriter<File>>>,
    id: Uuid,
    seq: u32,
    started_at: chrono::DateTime<chrono::Utc>,
    device_id: Uuid,
}

impl AudioWriter {
    fn new(id: Uuid, filepath: PathBuf, spec: WavSpec, device_id: Uuid) -> anyhow::Result<Self> {
        Ok(Self {
            inner: Some(WavWriter::create(filepath, spec)?),
            id,
            seq: 0,
            started_at: chrono::Utc::now(),
            device_id,
        })
    }

    fn write<S, HS>(&mut self, wav_chunk: audio::WavChunk<S>) -> anyhow::Result<()>
    where
        S: Copy + Default + for<'de> Deserialize<'de> + TryInto<HS> + Debug,
        HS: hound::Sample,
    {
        match self.inner.as_mut() {
            Some(writer) => {
                if self.seq < wav_chunk.seq {
                    for &sample in &wav_chunk.payload.0[..] {
                        writer.write_sample(
                            sample
                                .try_into()
                                .map_err(|_| anyhow!("unexpected try_into error"))?,
                        )?
                    }
                    self.seq = wav_chunk.seq;
                }
                Ok(())
            }
            None => Err(anyhow::anyhow!("unexpected write after finalized")),
        }
    }

    fn finalize_as_new_event(mut self) -> anyhow::Result<NewEvent> {
        match self.inner.take() {
            Some(writer) => {
                writer.finalize()?;
                Ok(NewEvent {
                    kind: EventKind::Sound,
                    payload: EventPayload::Sound {
                        wav_file: std::format!("{}.wav", self.id),
                    },
                    started_at: self.started_at,
                    ended_at: chrono::Utc::now(),
                    device_id: self.device_id,
                })
            }
            None => Err(anyhow::anyhow!("unexpected write after finalized")),
        }
    }
}

pub struct AudioHandler {
    writers: HashMap<Uuid, AudioWriter>,
    wav_directory: PathBuf,
    spec: Spec,
    device_id: Uuid,
    logger: Logger,
    event_processor_addr: Addr<EventProcessor>,
}

impl AudioHandler {
    pub fn new(
        wav_directory: PathBuf,
        logger: Logger,
        event_processor_addr: Addr<EventProcessor>,
        spec: Spec,
        device_id: Uuid,
    ) -> Self {
        Self {
            writers: HashMap::new(),
            wav_directory,
            spec,
            device_id,
            logger,
            event_processor_addr,
        }
    }

    fn wav_path(&self, id: Uuid) -> PathBuf {
        let mut filepath = self.wav_directory.clone();
        filepath.push(id.to_string());
        filepath.set_extension("wav");
        filepath
    }

    fn write<S, HS>(&mut self, buf: BytesMut) -> anyhow::Result<()>
    where
        S: Copy + Default + for<'de> Deserialize<'de> + TryInto<HS> + Debug,
        HS: hound::Sample,
    {
        let audio = deserialize(&buf[..])?;
        match audio {
            Audio::WavChunk::<S>(wav_chunk) => {
                if !self.writers.contains_key(&wav_chunk.id) {
                    self.writers.insert(
                        wav_chunk.id,
                        AudioWriter::new(
                            wav_chunk.id,
                            self.wav_path(wav_chunk.id),
                            self.spec.into(),
                            self.device_id,
                        )?,
                    );
                    info!(self.logger, "new audio writer"; "id" => std::format!("{}", wav_chunk.id))
                }

                debug!(
                    self.logger,
                    "wav chunk received";
                    "id" => std::format!("{}", wav_chunk.id),
                    "seq" => wav_chunk.seq,
                );

                let writer = self.writers.get_mut(&wav_chunk.id).unwrap();
                writer.write(wav_chunk)?;
            }
            Audio::WavEnd { id } => match self.writers.remove(&id) {
                Some(writer) => {
                    self.finalize_writer(id, writer)?;
                }
                None => {
                    warn!(self.logger, "wav writer has already ended"; "id" => std::format!("{}", id));
                }
            },
            _ => {
                warn!(self.logger, "unexpected audio kind: {:?}", audio);
            }
        };
        Ok(())
    }

    fn finalize_writer(&self, id: Uuid, writer: AudioWriter) -> anyhow::Result<()> {
        self.event_processor_addr
            .do_send(writer.finalize_as_new_event()?);
        info!(self.logger, "finalize audio writer"; "id" => std::format!("{}", id));
        Ok(())
    }

    fn finalize_all(&mut self) {
        let event_processor_addr = self.event_processor_addr.clone();
        let logger = self.logger.clone();
        self.writers.drain().into_iter().for_each(|(id, writer)| {
            match writer.finalize_as_new_event() {
                Ok(new_event) => {
                    event_processor_addr.do_send(new_event);
                    info!(logger, "finalize audio writer"; "id" => std::format!("{}", id));
                }
                Err(error) => {
                    error!(logger, "failed to close wav writer, err: {}", error);
                }
            }
        });
    }
}

impl Actor for AudioHandler {
    type Context = Context<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        info!(self.logger, "audio handler started");
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        info!(self.logger, "audio handler is stopping");
        self.finalize_all();
        Running::Stop
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        info!(self.logger, "audio handler stopped");
    }
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct AudioBytes(pub BytesMut);

impl Handler<AudioBytes> for AudioHandler {
    type Result = ();

    fn handle(&mut self, buf: AudioBytes, _: &mut Self::Context) -> Self::Result {
        if let Err(error) = match self.spec.sample_format {
            audio::SampleFormat::U16 => self.write::<u16, i16>(buf.0),
            audio::SampleFormat::I16 => self.write::<i16, i16>(buf.0),
            audio::SampleFormat::F32 => self.write::<f32, f32>(buf.0),
        } {
            warn!(self.logger, "failed to write audio, err: {}", error);
        };
        ()
    }
}
