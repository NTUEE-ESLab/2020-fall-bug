use crate::actor::db::{
    label::{Label, NewLabel},
    DeleteMsg, InsertMsg, SelectMsg,
};
use actix_web::{web, HttpResponse};
use uuid::Uuid;

pub async fn create(
    data: web::Data<super::AppState>,
    body: web::Json<NewLabel>,
) -> Result<HttpResponse, super::Error> {
    let label = data.database_addr.send(InsertMsg::new(body.0)).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(label)))
}

pub async fn list(data: web::Data<super::AppState>) -> Result<HttpResponse, super::Error> {
    let labels: Vec<Label> = data.database_addr.send(SelectMsg::new(())).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(labels)))
}

pub async fn delete(
    data: web::Data<super::AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, super::Error> {
    data.database_addr
        .send(DeleteMsg::<Uuid, Label>::new(path.0))
        .await??;
    Ok(HttpResponse::Ok().finish())
}
