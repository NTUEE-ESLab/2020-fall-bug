use crate::actor::db::Database;
use crate::schema::*;
use actix::Handler;
use diesel::prelude::*;
use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use std::marker::PhantomData;
use uuid::Uuid;

type AllColumns = (devices::id, devices::name, devices::description);

pub const ALL_COLUMNS: AllColumns = (devices::id, devices::name, devices::description);

#[derive(Queryable, Identifiable, Serialize, Debug)]
#[table_name = "devices"]
pub struct Device {
    pub id: Uuid,
    pub name: String,
    pub description: String,
}

#[derive(Insertable, Deserialize, Debug)]
#[table_name = "devices"]
pub struct NewDevice {
    pub name: String,
    pub description: String,
}

impl Handler<super::InsertMsg<NewDevice, (Device, u64)>> for Database {
    type Result = super::Result<(Device, u64)>;

    fn handle(
        &mut self,
        msg: super::InsertMsg<NewDevice, (Device, u64)>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        connection.transaction(|| {
            let device = diesel::insert_into(devices::table)
                .values::<&NewDevice>(&msg.value)
                .returning(ALL_COLUMNS)
                .get_result::<Device>(&connection)?;

            let mut rng = thread_rng();
            let secret: u64 = rng.gen();

            diesel::insert_into(device_credentials::table)
                .values(super::device_credential::NewDeviceCredential {
                    secret: secret.to_be_bytes().to_vec(),
                    device_id: device.id,
                })
                .execute(&connection)?;

            Ok((device, secret))
        })
    }
}

impl Handler<super::SelectMsg<(), Vec<Device>>> for Database {
    type Result = super::Result<Vec<Device>>;

    fn handle(
        &mut self,
        _: super::SelectMsg<(), Vec<Device>>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        Ok(devices::table
            .select(ALL_COLUMNS)
            .get_results::<Device>(&connection)?)
    }
}

impl Handler<super::SelectMsg<u64, Device>> for Database {
    type Result = super::Result<Device>;

    fn handle(
        &mut self,
        msg: super::SelectMsg<u64, Device>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        Ok(devices::table
            .select(ALL_COLUMNS)
            .inner_join(device_credentials::table)
            .filter(device_credentials::secret.eq(msg.param.to_be_bytes().to_vec()))
            .get_result::<Device>(&connection)?)
    }
}

impl Handler<super::DeleteMsg<Uuid, Device>> for Database {
    type Result = super::Result<PhantomData<Device>>;

    fn handle(
        &mut self,
        msg: super::DeleteMsg<Uuid, Device>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        match diesel::delete(devices::table.filter(devices::id.eq(msg.param)))
            .execute(&connection)?
        {
            0 => Err(super::Error::not_found()),
            1 => Ok(PhantomData),
            num => Err(super::Error::unexpected(format!(
                "expect 1 device to be deleted, but got {}",
                num
            ))),
        }
    }
}
