#![allow(unused_imports)]
use serde::{Deserialize, Serialize};

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};

    composed_events (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        name -> Text,
        description -> Text,
        rule -> Jsonb,
    }
}

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};

    composed_events_events (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        judgement_id -> Uuid,
        composed_event_id -> Uuid,
        event_id -> Uuid,
    }
}

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
        description -> Text,
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

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};

    events_labels (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        event_id -> Uuid,
        label_id -> Uuid,
    }
}

table! {
    use diesel::sql_types::*;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz, Bytea};
    use super::EventKindMapping;

    labels (id) {
        id -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        event_kind -> EventKindMapping,
        name -> Text,
        description -> Text,
        rule -> Jsonb,
        device_id -> Uuid,
    }
}

joinable!(composed_events_events -> composed_events (composed_event_id));
joinable!(composed_events_events -> events (event_id));
joinable!(device_credentials -> devices (device_id));
joinable!(events -> devices (device_id));
joinable!(events_labels -> events (event_id));
joinable!(events_labels -> labels (label_id));
joinable!(labels -> devices (device_id));

allow_tables_to_appear_in_same_query!(
    composed_events,
    composed_events_events,
    device_credentials,
    devices,
    events,
    events_labels,
    labels,
);

#[derive(DbEnum, Deserialize, Serialize, Clone, PartialEq, Debug)]
#[serde(rename_all = "snake_case")]
pub enum EventKind {
    Sound,
    Position,
    Luminosity,
}
