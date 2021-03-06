use crate::{
    actor::{db::Database, event_handler::EventHandler, event_processor::EventProcessor},
    signal::{Signal, SignalStream},
};
use actix::{
    io::FramedWrite, Actor, ActorContext, Addr, AsyncContext, Context, Handler, Message, Running,
    StreamHandler,
};
use anyhow;
use event::EventCodec;
use futures::stream::StreamExt;
use slog::Logger;
use std::net::{Ipv4Addr, SocketAddr};
use structopt::StructOpt;
use tokio::net::{self as net, TcpListener};
use tokio_util::codec::{BytesCodec, FramedRead};

#[derive(Debug, Clone, StructOpt)]
pub struct Config {
    #[structopt(
        long = "event-server-port",
        env = "EVENT_SERVER_PORT",
        default_value = "3002",
        help = "the port for event server to listen to"
    )]
    pub event_server_port: u16,
}

impl Config {
    pub fn build(
        &self,
        logger: Logger,
        database_addr: Addr<Database>,
        event_processor_addr: Addr<EventProcessor>,
    ) -> anyhow::Result<Addr<EventServer>> {
        let listener = Box::new(bind_tcp_listener(self.event_server_port)?);

        Ok(EventServer::create(move |ctx| {
            ctx.add_message_stream(SignalStream::new());
            ctx.add_message_stream(
                Box::leak(listener)
                    .incoming()
                    .filter_map(|stream| async { stream.map(|stream| TcpStream(stream)).ok() }),
            );
            EventServer {
                port: self.event_server_port,
                logger,
                database_addr,
                event_processor_addr,
            }
        }))
    }
}

pub struct EventServer {
    port: u16,
    logger: Logger,
    database_addr: Addr<Database>,
    event_processor_addr: Addr<EventProcessor>,
}

impl Actor for EventServer {
    type Context = Context<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        info!(self.logger, "event server listen on port {}", self.port);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        info!(self.logger, "event server is stopping");
        Running::Stop
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        info!(self.logger, "event server stopped");
    }
}

#[derive(Message)]
#[rtype(result = "()")]
struct TcpStream(net::TcpStream);

impl Handler<TcpStream> for EventServer {
    type Result = ();

    fn handle(&mut self, stream: TcpStream, _: &mut Self::Context) -> Self::Result {
        EventHandler::create(move |ctx| {
            let (read, write) = tokio::io::split(stream.0);
            EventHandler::add_stream(FramedRead::new(read, EventCodec), ctx);
            EventHandler::new(
                FramedWrite::new(write, BytesCodec::new(), ctx),
                self.logger.clone(),
                self.database_addr.clone(),
                self.event_processor_addr.clone(),
            )
        });
        ()
    }
}

impl Handler<Signal> for EventServer {
    type Result = ();

    fn handle(&mut self, _: Signal, ctx: &mut Self::Context) -> Self::Result {
        ctx.stop();
        ()
    }
}

fn bind_tcp_listener(port: u16) -> anyhow::Result<TcpListener> {
    let addr = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), port);
    let sock = std::net::TcpListener::bind(addr)?;
    Ok(TcpListener::from_std(sock)?)
}
