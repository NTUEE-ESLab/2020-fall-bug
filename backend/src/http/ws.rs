use crate::actor::ws_manager::{WsSession, WsSessionTarget};
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;

pub async fn event(
    data: web::Data<super::AppState>,
    req: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    let (ws_session_addr, resp) =
        ws::start_with_addr(WsSession::new(data.logger.clone()), &req, stream)?;
    data.ws_manager
        .register(WsSessionTarget::Event, ws_session_addr);
    Ok(resp)
}
