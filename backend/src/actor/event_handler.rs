use crate::actor::db::{self, Database};
use actix::{
    io::{FramedWrite, WriteHandler},
    Actor, Addr, Context, Running, StreamHandler,
};
use bytes::Bytes;
use event::{self, Event};
use slog::Logger;
use tokio::io::WriteHalf;
use tokio::net::TcpStream;
use tokio_util::codec::BytesCodec;

pub struct EventHandler {
    write: FramedWrite<Bytes, WriteHalf<TcpStream>, BytesCodec>,
    logger: Logger,
    database_addr: Addr<Database>,
}

impl EventHandler {
    const MAGIC_RESPONSE: Bytes = Bytes::from_static(&[1]);

    pub fn new(
        write: FramedWrite<Bytes, WriteHalf<TcpStream>, BytesCodec>,
        logger: Logger,
        database_addr: Addr<Database>,
    ) -> Self {
        Self {
            write,
            logger,
            database_addr,
        }
    }
}

impl Actor for EventHandler {
    type Context = Context<Self>;

    fn started(&mut self, _: &mut Context<Self>) {
        info!(self.logger, "event handler started");
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        info!(self.logger, "event handler is stopping");
        Running::Stop
    }

    fn stopped(&mut self, _: &mut Context<Self>) {
        info!(self.logger, "event handler stopped");
    }
}

impl StreamHandler<Result<Event, event::Error>> for EventHandler {
    fn handle(&mut self, event: Result<Event, event::Error>, _: &mut Self::Context) {
        let event = match event {
            Ok(event) => event,
            Err(e) => {
                self.write.write(Self::MAGIC_RESPONSE);
                warn!(self.logger, "failed to decode event: {:?}", e);
                return;
            }
        };

        // TODO: check whether is authorized

        let new_event: db::event::NewEvent = event.into();
        debug!(self.logger, "new event requested: {:?}", new_event);

        self.database_addr.do_send(new_event);
        self.write.write(Self::MAGIC_RESPONSE);
    }
}

impl WriteHandler<std::io::Error> for EventHandler {
    fn error(&mut self, error: std::io::Error, _: &mut Self::Context) -> Running {
        error!(
            self.logger,
            "failed to write event response, error: {:?}", error
        );
        Running::Continue
    }
}
