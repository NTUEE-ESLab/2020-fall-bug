use super::Database;
use actix::{Handler, Message};
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::prelude::*;
use event::EventPayload;
use uuid::Uuid;

table! {
    use super::EventKindMapping;
    use diesel::pg::types::sql_types::{Uuid, Jsonb, Timestamptz};

    events (id) {
        id -> Uuid,
        kind -> EventKindMapping,
        payload -> Jsonb,
        started_at -> Timestamptz,
        ended_at -> Timestamptz,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

#[derive(DbEnum, PartialEq, Debug)]
pub enum EventKind {
    Sound,
    Position,
    Luminosity,
}

#[derive(Queryable, Identifiable, PartialEq, Debug)]
#[table_name = "events"]
pub struct Event {
    pub id: Uuid,
    pub kind: EventKind,
    pub payload: EventPayload,
    pub started_at: DateTime<Utc>,
    pub ended_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Insertable, Debug, Message)]
#[table_name = "events"]
#[rtype(result = "anyhow::Result<Event>")]
pub struct NewEvent {
    pub kind: EventKind,
    pub payload: EventPayload,
    pub started_at: DateTime<Utc>,
    pub ended_at: DateTime<Utc>,
}

impl From<event::Event> for NewEvent {
    fn from(event: event::Event) -> Self {
        Self {
            kind: match event.payload {
                event::EventPayload::Sound { .. } => EventKind::Sound,
                event::EventPayload::Position { .. } => EventKind::Position,
                event::EventPayload::Luminosity { .. } => EventKind::Luminosity,
            },
            payload: event.payload,
            started_at: chrono::DateTime::from_utc(
                NaiveDateTime::from_timestamp(event.started_at_secs, event.started_at_nsecs),
                Utc,
            ),
            ended_at: chrono::DateTime::from_utc(
                NaiveDateTime::from_timestamp(event.ended_at_secs, event.ended_at_nsecs),
                Utc,
            ),
        }
    }
}

impl Handler<NewEvent> for Database {
    type Result = anyhow::Result<Event>;

    fn handle(&mut self, new_event: NewEvent, _: &mut Self::Context) -> Self::Result {
        use super::event::events::dsl::*;

        let connection = self.0.get()?;
        Ok(diesel::insert_into(events)
            .values(&new_event)
            .get_result::<Event>(&connection)?)
    }
}
