use crate::actor::{audio_server, db::Database, ws_manager::WsManager};
use actix::{Actor, Addr};
use actix_cors::Cors;
use actix_files as fs;
use actix_web::{
    dev::{Server, Service},
    http::header,
    web, App, HttpServer,
};
use futures::FutureExt;
use slog::Logger;
use std::net::{Ipv4Addr, SocketAddr};
use structopt::StructOpt;

#[derive(StructOpt, Clone, Debug)]
pub struct Config {
    #[structopt(
        long = "server-port",
        env = "SERVER_PORT",
        default_value = "3001",
        help = "the port for server to listen to"
    )]
    pub server_port: u16,
}

impl Config {
    pub fn build(
        &self,
        audio_server_config: audio_server::Config,
        root: Logger,
        database_addr: Addr<Database>,
    ) -> anyhow::Result<(Server, WsManager)> {
        let logger = root.clone();
        let addr = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), self.server_port);

        // create actor WsManager
        let ws_manager = WsManager::new(logger.clone());
        let ws_manager_ret = ws_manager.clone();
        ws_manager.clone().start();

        let server = HttpServer::new(move || {
            let logger = root.clone();

            let cors = Cors::default()
                .allowed_origin("http://localhost:3000")
                .allow_any_method()
                .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT, header::CONTENT_TYPE])
                .supports_credentials()
                .max_age(3600);

            App::new()
                .data(AppState{
                    logger: logger.clone(),
                    database_addr: database_addr.clone(),
                    ws_manager: ws_manager.clone()
                })
                .wrap_fn(move |req, srv| {
                    let logger = logger.clone();
                    let path = req.path().to_owned();
                    let method = req.method().to_string();
                    srv.call(req).map(move |res| {
                        let res = match res {
                            Ok(res) => res,
                            Err(e) => return Err(e),
                        };
                        info!(logger, ""; "method" => method, "path" => path, "status" => res.response().head().status.as_u16());
                        Ok(res)
                    })
                })
                .wrap(cors)
                .configure(|app| {
                    routes(app, audio_server_config.clone().audio_wav_directory);
                })
            })
        .bind(addr)?
        .run();

        info!(logger, "http server listen on port {}", self.server_port);
        Ok((server, ws_manager_ret))
    }
}

pub struct AppState {
    pub logger: Logger,
    pub database_addr: Addr<Database>,
    pub ws_manager: WsManager,
}

fn routes(app: &mut web::ServiceConfig, audio_wav_directory: String) {
    app.service(fs::Files::new("/static/wav", audio_wav_directory).show_files_listing())
        .service(
            web::scope("/ws")
                .service(web::resource("/event").route(web::get().to(super::ws::event))),
        )
        .service(
            web::scope("/v1")
                .service(
                    web::resource("/devices")
                        .route(web::get().to(super::device::list))
                        .route(web::post().to(super::device::create)),
                )
                .service(
                    web::resource("/devices/{id}").route(web::delete().to(super::device::delete)),
                )
                .service(web::resource("/events").route(web::get().to(super::event::list)))
                .service(web::resource("/events/{id}").route(web::get().to(super::event::read)))
                .service(
                    web::resource("/labels")
                        .route(web::get().to(super::label::list))
                        .route(web::post().to(super::label::create)),
                )
                .service(
                    web::resource("/labels/{id}").route(web::delete().to(super::label::delete)),
                ),
        );
}
