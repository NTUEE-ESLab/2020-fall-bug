#![allow(unused_imports)]
use serde::Serialize;

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};

    device_credentials (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        secret -> Bytea,
        device_id -> Uuid,
    }
}

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};

    devices (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        name -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};
    use super::EventKindMapping;

    events (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        kind -> EventKindMapping,
        payload -> Jsonb,
        started_at -> Timestamptz,
        ended_at -> Timestamptz,
        device_id -> Uuid,
    }
}

joinable!(device_credentials -> devices (device_id));
joinable!(events -> devices (device_id));

allow_tables_to_appear_in_same_query!(
    device_credentials,
    devices,
    events,
);

#[derive(DbEnum, Serialize, PartialEq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum EventKind {
    Sound,
    Position,
    Luminosity,
}
