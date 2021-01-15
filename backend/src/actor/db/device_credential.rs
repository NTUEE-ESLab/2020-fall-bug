use crate::schema::*;
use uuid::Uuid;

type AllColumns = (device_credentials::id, device_credentials::secret);

pub const ALL_COLUMNS: AllColumns = (device_credentials::id, device_credentials::secret);

#[derive(Insertable, Debug)]
#[table_name = "device_credentials"]
pub struct NewDeviceCredential {
    pub secret: Vec<u8>,
    pub device_id: Uuid,
}
