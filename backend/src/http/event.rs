use crate::actor::db::{event::Event, label::Label, SelectMsg};
use actix_web::{web, HttpResponse};
use serde::Serialize;

#[derive(Serialize)]
struct EventRes {
    #[serde(flatten)]
    event: Event,
    labels: Vec<String>,
}

pub async fn list(data: web::Data<super::AppState>) -> Result<HttpResponse, super::Error> {
    let event_with_labels: Vec<(Event, Vec<Label>)> =
        data.database_addr.send(SelectMsg::new(())).await??;
    let response = event_with_labels
        .into_iter()
        .map(|(event, labels)| EventRes {
            event: event,
            labels: labels
                .into_iter()
                .map(|label| label.id.to_string())
                .collect(),
        })
        .collect::<Vec<EventRes>>();
    Ok(HttpResponse::Ok().json2(&super::Document::new(response)))
}

pub async fn read(
    data: web::Data<super::AppState>,
    path: web::Path<uuid::Uuid>,
) -> Result<HttpResponse, super::Error> {
    let (event, labels) = data.database_addr.send(SelectMsg::new(path.0)).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(EventRes {
        event: event,
        labels: labels
            .into_iter()
            .map(|label| label.id.to_string())
            .collect(),
    })))
}
