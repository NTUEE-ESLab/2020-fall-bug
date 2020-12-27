use crate::actor::db::Database;
use actix::Addr;
use actix_web::{
    dev::{Server, Service},
    web, App, HttpRequest, HttpServer, Responder,
};
use futures::FutureExt;
use slog::Logger;
use std::net::{Ipv4Addr, SocketAddr};
use structopt::StructOpt;

#[derive(Debug, Clone, StructOpt)]
pub struct Config {
    #[structopt(
        long = "server-port",
        env = "SERVER_PORT",
        default_value = "3001",
        help = "the port for server to listen to"
    )]
    pub server_port: u16,
    #[structopt(
        long = "server-enable-graphiql",
        env = "SERVER_ENABLE_GRAPHIQL",
        help = "whether to enable gql playgrond"
    )]
    pub server_enable_graphiql: bool,
}

struct AppState {
    database_addr: Addr<Database>,
}

impl Config {
    pub fn build(&self, logger: Logger, database_addr: Addr<Database>) -> anyhow::Result<Server> {
        let logger2 = logger.clone();
        let addr = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), self.server_port);

        let server = HttpServer::new(move || {
            let logger = logger.clone();
            App::new()
                .data(AppState{ database_addr: database_addr.clone() })
                .wrap_fn(move |req, srv| {
                    let logger = logger.clone();
                    let path = req.path().to_owned();
                    srv.call(req).map(move |res| {
                        let res = match res {
                            Ok(res) => res,
                            Err(e) => return Err(e),
                        };
                        info!(logger.clone(), ""; "status" => res.response().head().status.as_u16(), "path" => path);
                        Ok(res)
                    })
                })
                .configure(routes)
            })
        .bind(addr)?
        .run();

        info!(logger2, "http server listen on port {}", self.server_port);
        Ok(server)
    }
}

fn routes(_: &mut web::ServiceConfig) {}
