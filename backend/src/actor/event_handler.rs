use crate::actor::db::{self, device::Device, Database, InsertMsg};
use actix::{
    fut::FutureWrap,
    io::{FramedWrite, WriteHandler},
    Actor, ActorContext, ActorFuture, Addr, Context, ContextFutureSpawner, MailboxError, Running,
    StreamHandler, WrapFuture,
};
use bytes::Bytes;
use db::SelectMsg;
use event::{self, Event};
use futures::Future;
use slog::Logger;
use tokio::io::WriteHalf;
use tokio::net::TcpStream;
use tokio_util::codec::BytesCodec;

pub struct EventHandler {
    write: FramedWrite<Bytes, WriteHalf<TcpStream>, BytesCodec>,
    logger: Logger,
    database_addr: Addr<Database>,
    device: Option<Device>,
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
            device: None,
        }
    }

    fn inner_handle(&mut self, event: Event) {
        if let Some(device) = self.device.as_ref() {
            let new_event: db::event::NewEvent = (event, device.id).into();
            debug!(self.logger, "new event arrived: {:?}", new_event);

            self.database_addr.do_send(InsertMsg::new(new_event));
            self.write.write(Self::MAGIC_RESPONSE);
        }
    }

    fn authenticate(
        device: Result<Result<Device, db::Error>, MailboxError>,
        actor: &mut EventHandler,
        ctx: &mut Context<EventHandler>,
    ) -> FutureWrap<impl Future<Output = ()>, EventHandler> {
        match device {
            Ok(device) => match device {
                Ok(device) => {
                    actor.device = Some(device);
                }
                Err(err) => {
                    error!(actor.logger, "{}", err);
                    ctx.stop();
                }
            },
            Err(err) => {
                error!(actor.logger, "{}", err);
            }
        };
        async {}.into_actor(actor)
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
    fn handle(&mut self, event: Result<Event, event::Error>, ctx: &mut Self::Context) {
        let event = match event {
            Ok(event) => event,
            Err(e) => {
                self.write.write(Self::MAGIC_RESPONSE);
                warn!(self.logger, "failed to decode event: {:?}", e);
                return;
            }
        };

        if self.device.is_none() {
            self.database_addr
                .send(SelectMsg::new(event.secret))
                .into_actor(self)
                .then(EventHandler::authenticate)
                .then(|_, actor, _| {
                    actor.inner_handle(event);
                    async {}.into_actor(actor)
                })
                .wait(ctx);
        } else {
            self.inner_handle(event);
        }
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
