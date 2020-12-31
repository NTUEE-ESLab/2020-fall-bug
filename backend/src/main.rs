#[macro_use]
extern crate slog;

use actix_web::rt::{self as actix_rt};
use backend::{
    actor::{audio_server, db, event_server},
    http, logger,
};
use structopt::StructOpt;

#[derive(StructOpt, Clone, Debug)]
pub struct Config {
    #[structopt(flatten)]
    logger: logger::Config,
    #[structopt(flatten)]
    db: db::Config,
    #[structopt(flatten)]
    audio_server: audio_server::Config,
    #[structopt(flatten)]
    event_server: event_server::Config,
    #[structopt(flatten)]
    http: http::Config,
}

#[actix_rt::main]
async fn main() -> anyhow::Result<()> {
    let config = Config::from_args();

    // create logger
    let logger = config.logger.build();

    // create actor Database
    let database_addr = config.db.build()?;

    // create actor AudioServer
    config.audio_server.build(
        logger.new(o!("service" => "audio-server")),
        database_addr.clone(),
    )?;

    // create actor EventServer
    config.event_server.build(
        logger.new(o!("service" => "event-server")),
        database_addr.clone(),
    )?;

    // create Server
    let http_server = config.http.build(
        config.audio_server,
        logger.new(o!("service" => "http-server")),
        database_addr.clone(),
    )?;

    // wait for stop signal and graceful shutdown
    http_server.await?;
    actix_rt::System::current().stop();

    Ok(())
}
