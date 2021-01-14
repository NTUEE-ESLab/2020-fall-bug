use crate::actor::db::{
    device::{Device, NewDevice},
    DeleteMsg, InsertMsg, SelectMsg,
};
use actix_web::{web, HttpResponse};
use serde::Serialize;
use serde_hex::{CompactPfx, SerHex};
use uuid::Uuid;

#[derive(Serialize)]
pub struct NewDeviceRes {
    #[serde(flatten)]
    device: Device,
    #[serde(with = "SerHex::<CompactPfx>")]
    pub secret: u64,
}

pub async fn create(
    data: web::Data<super::AppState>,
    body: web::Json<NewDevice>,
) -> Result<HttpResponse, super::Error> {
    let (device, secret) = data.database_addr.send(InsertMsg::new(body.0)).await??;
    let response = NewDeviceRes {
        device: device,
        secret,
    };
    Ok(HttpResponse::Ok().json2(&super::Document::new(response)))
}

pub async fn list(data: web::Data<super::AppState>) -> Result<HttpResponse, super::Error> {
    let devices: Vec<Device> = data.database_addr.send(SelectMsg::new(())).await??;
    Ok(HttpResponse::Ok().json2(&super::Document::new(devices)))
}

pub async fn delete(
    data: web::Data<super::AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, super::Error> {
    data.database_addr
        .send(DeleteMsg::<Uuid, Device>::new(path.0))
        .await??;
    Ok(HttpResponse::Ok().finish())
}
