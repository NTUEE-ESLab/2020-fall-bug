use crate::{
    actor::db::{label::Label, Database},
    schema::*,
};
use actix::{Handler, Message};
use chrono::{DateTime, NaiveDateTime, Timelike, Utc};
use diesel::{
    pg::{types::sql_types::Jsonb, Pg},
    prelude::*,
    serialize::Output,
    types::{FromSql, ToSql},
};
use serde::{Deserialize, Serialize};
use std::io::Write;
use uuid::Uuid;

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[sql_type = "Jsonb"]
#[serde(rename_all = "snake_case", tag = "kind")]
pub enum EventPayload {
    Sound {
        wav_file: String,
    },
    Position {
        from: (i32, i32, i32),
        to: (i32, i32, i32),
    },
    Luminosity {
        from: i32,
        to: i32,
    },
}

impl FromSql<Jsonb, Pg> for EventPayload {
    fn from_sql(bytes: Option<&[u8]>) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for EventPayload {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(&self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, out)
    }
}

#[derive(Queryable, Identifiable, Serialize, Clone, PartialEq, Debug)]
#[table_name = "events"]
pub struct Event {
    pub id: Uuid,
    pub kind: EventKind,
    pub payload: EventPayload,
    pub started_at: DateTime<Utc>,
    pub ended_at: DateTime<Utc>,
    pub device_id: Uuid,
}

type AllColumns = (
    events::id,
    events::kind,
    events::payload,
    events::started_at,
    events::ended_at,
    events::device_id,
);

pub const ALL_COLUMNS: AllColumns = (
    events::id,
    events::kind,
    events::payload,
    events::started_at,
    events::ended_at,
    events::device_id,
);

#[derive(Insertable, Debug, Message)]
#[table_name = "events"]
#[rtype(result = "super::Result<Event>")]
pub struct NewEvent {
    pub kind: EventKind,
    pub payload: EventPayload,
    pub started_at: DateTime<Utc>,
    pub ended_at: DateTime<Utc>,
    pub device_id: Uuid,
}

impl From<(event::Event, Uuid)> for NewEvent {
    fn from((event, device_id): (event::Event, Uuid)) -> Self {
        let (started_at_secs, ended_at_secs) =
            if event.started_at_secs == 0 || event.ended_at_secs == 0 {
                let now_secs = chrono::Local::now().second() as _;
                (now_secs, now_secs)
            } else {
                (event.started_at_secs, event.ended_at_secs)
            };

        Self {
            kind: match event.payload {
                event::EventPayload::Sound { .. } => EventKind::Sound,
                event::EventPayload::Position { .. } => EventKind::Position,
                event::EventPayload::Luminosity { .. } => EventKind::Luminosity,
            },
            payload: match event.payload {
                event::EventPayload::Sound { wav_file } => EventPayload::Sound { wav_file },
                event::EventPayload::Position { from, to } => EventPayload::Position { from, to },
                event::EventPayload::Luminosity { from, to } => {
                    EventPayload::Luminosity { from, to }
                }
            },
            started_at: chrono::DateTime::from_utc(
                NaiveDateTime::from_timestamp(started_at_secs, event.started_at_nsecs),
                Utc,
            ),
            ended_at: chrono::DateTime::from_utc(
                NaiveDateTime::from_timestamp(ended_at_secs, event.ended_at_nsecs),
                Utc,
            ),
            device_id,
        }
    }
}

impl Handler<super::InsertMsg<NewEvent, Event>> for Database {
    type Result = super::Result<Event>;

    fn handle(
        &mut self,
        msg: super::InsertMsg<NewEvent, Event>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        let id = diesel::insert_into(events::dsl::events)
            .values(&msg.value)
            .returning(events::id)
            .get_result::<Uuid>(&connection)?;

        Ok(Event {
            id,
            kind: msg.value.kind,
            payload: msg.value.payload,
            started_at: msg.value.started_at,
            ended_at: msg.value.ended_at,
            device_id: msg.value.device_id,
        })
    }
}

impl Handler<super::SelectMsg<(), Vec<(Event, Vec<Label>)>>> for Database {
    type Result = super::Result<Vec<(Event, Vec<Label>)>>;

    fn handle(
        &mut self,
        _: super::SelectMsg<(), Vec<(Event, Vec<Label>)>>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        let events = events::table
            .select(ALL_COLUMNS)
            .load::<Event>(&connection)?;
        let labels = super::event_label::EventLabel::belonging_to(&events[..])
            .inner_join(labels::table)
            .select((super::event_label::ALL_COLUMNS, super::label::ALL_COLUMNS))
            .load::<(super::event_label::EventLabel, Label)>(&connection)?
            .grouped_by(&events[..]);

        Ok(labels
            .into_iter()
            .zip(events)
            .map(|(labels, events)| {
                (
                    events,
                    labels.into_iter().map(|(_, labels)| labels).collect(),
                )
            })
            .collect())
    }
}

impl Handler<super::SelectMsg<Uuid, (Event, Vec<Label>)>> for Database {
    type Result = super::Result<(Event, Vec<Label>)>;

    fn handle(
        &mut self,
        msg: super::SelectMsg<Uuid, (Event, Vec<Label>)>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        let event = events::table
            .select(ALL_COLUMNS)
            .filter(events::id.eq(msg.param))
            .get_result::<Event>(&connection)?;
        let label = super::event_label::EventLabel::belonging_to(&event)
            .inner_join(labels::table)
            .select((super::event_label::ALL_COLUMNS, super::label::ALL_COLUMNS))
            .load::<(super::event_label::EventLabel, Label)>(&connection)?;
        Ok((event, label.into_iter().map(|(_, labels)| labels).collect()))
    }
}
