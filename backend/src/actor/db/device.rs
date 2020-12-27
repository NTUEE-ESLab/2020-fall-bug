use chrono::{DateTime, Utc};
use uuid::Uuid;

table! {
    use diesel::{sql_types::Text, pg::types::sql_types::{Uuid, Timestamptz}};

    devices (id) {
        id -> Uuid,
        name -> Text,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

#[derive(Queryable, Identifiable, PartialEq, Debug)]
#[table_name = "devices"]
pub struct Event {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
