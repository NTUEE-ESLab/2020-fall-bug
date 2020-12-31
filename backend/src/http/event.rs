use crate::actor::db::{event::Event, SelectMsg};
use actix_web::{web, HttpResponse};

pub async fn list(data: web::Data<super::AppState>) -> Result<HttpResponse, super::Error> {
    let events: Vec<Event> = data.database_addr.send(SelectMsg::new(())).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(events)))
}

pub async fn read(
    data: web::Data<super::AppState>,
    path: web::Path<uuid::Uuid>,
) -> Result<HttpResponse, super::Error> {
    let event: Event = data.database_addr.send(SelectMsg::new(path.0)).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(event)))
}
