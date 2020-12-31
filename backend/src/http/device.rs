use crate::actor::db::{
    device::{Device, NewDevice},
    InsertMsg, SelectMsg,
};
use actix_web::{web, HttpResponse};
use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct DeviceWithSecret {
    pub id: Uuid,
    pub name: String,
    pub secret: u64,
}

pub async fn create(
    data: web::Data<super::AppState>,
    body: web::Json<NewDevice>,
) -> Result<HttpResponse, super::Error> {
    let (device, secret) = data.database_addr.send(InsertMsg::new(body.0)).await??;
    Ok(
        HttpResponse::Ok().json2(&super::Document::new(DeviceWithSecret {
            id: device.id,
            name: device.name,
            secret,
        })),
    )
}

pub async fn list(data: web::Data<super::AppState>) -> Result<HttpResponse, super::Error> {
    let devices: Vec<Device> = data.database_addr.send(SelectMsg::new(())).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(devices)))
}
