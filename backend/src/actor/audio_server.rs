use crate::{
    actor::{
        audio_handler::{AudioBytes, AudioHandler},
        db::{self, device::Device, Database},
        event_processor::EventProcessor,
    },
    signal::{Signal, SignalStream},
};
use actix::{
    fut::FutureWrap,
    io::{SinkWrite, WriteHandler},
    Actor, ActorContext, ActorFuture, Addr, AsyncContext, Context, ContextFutureSpawner, Handler,
    MailboxError, Message, Running, StreamHandler, WrapFuture,
};
use anyhow::anyhow;
use audio::Audio;
use bincode::deserialize;
use bytes::{Bytes, BytesMut};
use db::SelectMsg;
use futures::{
    stream::{SplitSink, StreamExt},
    Future,
};
use slog::Logger;
use std::{
    collections::HashMap,
    fs::create_dir_all,
    io,
    net::{Ipv4Addr, SocketAddr},
    path::{Path, PathBuf},
};
use structopt::StructOpt;
use tokio::net::UdpSocket;
use tokio_util::{codec::BytesCodec, udp::UdpFramed};

#[derive(StructOpt, Clone, Debug)]
pub struct Config {
    #[structopt(
        long = "audio-server-port",
        env = "AUDIO_SERVER_PORT",
        default_value = "3003",
        help = "the port for audio server to listen to"
    )]
    pub audio_server_port: u16,
    #[structopt(
        long = "audio-wav-directory",
        env = "AUDIO_WAV_DIRECTORY",
        default_value = "./wav",
        help = "the directory to store collected wav file"
    )]
    pub audio_wav_directory: String,
}

impl Config {
    pub fn build(
        &self,
        logger: Logger,
        database_addr: Addr<Database>,
        event_processor_addr: Addr<EventProcessor>,
    ) -> anyhow::Result<Addr<AudioServer>> {
        let wav_directory = ensure_directory(&self.audio_wav_directory)?;

        let socket = bind_udp_socket(self.audio_server_port)?;
        let (sink, stream) = UdpFramed::new(socket, BytesCodec::new()).split();

        Ok(AudioServer::create(|ctx| {
            ctx.add_message_stream(SignalStream::new());
            ctx.add_stream(stream.filter_map(
                |item: std::io::Result<(BytesMut, SocketAddr)>| async {
                    item.map(move |(data, addr)| UdpStream(data, addr)).ok()
                },
            ));
            AudioServer {
                port: self.audio_server_port,
                wav_directory,
                logger,
                database_addr,
                event_processor_addr,
                sink: SinkWrite::new(sink, ctx),
                writers: HashMap::new(),
            }
        }))
    }
}

type UdpSinkItem = (Bytes, SocketAddr);
type UdpSink = SplitSink<UdpFramed<BytesCodec>, UdpSinkItem>;

pub struct AudioServer {
    port: u16,
    wav_directory: PathBuf,
    logger: Logger,
    database_addr: Addr<Database>,
    event_processor_addr: Addr<EventProcessor>,
    sink: SinkWrite<UdpSinkItem, UdpSink>,
    writers: HashMap<SocketAddr, Addr<AudioHandler>>,
}

impl AudioServer {
    fn new_handler(
        (client_addr, spec, device): (
            SocketAddr,
            audio::Spec,
            Result<Result<Device, db::Error>, MailboxError>,
        ),
        actor: &mut AudioServer,
        _: &mut Context<AudioServer>,
    ) -> FutureWrap<impl Future<Output = ()>, AudioServer> {
        match device {
            Ok(device) => match device {
                Ok(device) => {
                    let writer = AudioHandler::new(
                        actor.wav_directory.clone(),
                        actor.logger.clone(),
                        actor.event_processor_addr.clone(),
                        spec,
                        device.id,
                    )
                    .start();
                    actor.writers.insert(client_addr, writer);
                }
                Err(err) => {
                    if err.is_not_found() {
                        warn!(actor.logger, "device not found");
                    } else {
                        error!(actor.logger, "{}", err);
                    }
                }
            },
            Err(err) => {
                error!(actor.logger, "{}", err);
            }
        };
        async {}.into_actor(actor)
    }
}

impl Actor for AudioServer {
    type Context = Context<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        info!(self.logger, "audio server listen on port {}", self.port);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        info!(self.logger, "audio server is stopping");
        Running::Stop
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        info!(self.logger, "audio server stopped");
    }
}

#[derive(Message)]
#[rtype(result = "()")]
struct UdpStream(BytesMut, SocketAddr);

impl StreamHandler<UdpStream> for AudioServer {
    fn handle(&mut self, udp_packet: UdpStream, ctx: &mut Self::Context) {
        let UdpStream(buf, client_addr) = udp_packet;
        match self.writers.get_mut(&client_addr) {
            Some(writer) => writer.do_send(AudioBytes(buf)),
            None => match deserialize(&buf[..]) {
                Ok(Audio::<f32>::Spec { secret, spec }) => {
                    self.database_addr
                        .send(SelectMsg::<u64, Device>::new(secret))
                        .into_actor(self)
                        .then(move |device, actor, _| {
                            async move { (client_addr, spec, device) }.into_actor(actor)
                        })
                        .then(AudioServer::new_handler)
                        .wait(ctx);
                }
                Ok(_) => {
                    // Send handshake to request spec of client
                    self.sink.write((
                        bincode::serialize(&audio::Audio::<f32>::Handshake)
                            .unwrap()
                            .into(),
                        client_addr,
                    ));
                }
                Err(error) => {
                    warn!(self.logger, "failed to deserialize audio, error: {}", error);
                }
            },
        }
    }
}

impl WriteHandler<io::Error> for AudioServer {
    fn error(&mut self, error: io::Error, _: &mut Self::Context) -> Running {
        error!(
            self.logger,
            "failed to write audio response, error: {:?}", error
        );
        Running::Continue
    }
}

impl Handler<Signal> for AudioServer {
    type Result = ();

    fn handle(&mut self, _: Signal, ctx: &mut Self::Context) -> Self::Result {
        ctx.stop();
        ()
    }
}

fn ensure_directory(path_str: &String) -> anyhow::Result<PathBuf> {
    let path = PathBuf::from(&path_str);
    if Path::exists(&path) {
        if !Path::is_dir(&path) {
            return Err(anyhow!("file with same name `{}` already exists", path_str));
        }
    } else {
        create_dir_all(&path)?;
    }
    Ok(path)
}

fn bind_udp_socket(port: u16) -> anyhow::Result<UdpSocket> {
    let addr = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), port);
    let sock = std::net::UdpSocket::bind(addr)?;
    Ok(UdpSocket::from_std(sock)?)
}
