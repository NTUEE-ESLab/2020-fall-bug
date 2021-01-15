use crate::actor::db::Database;
use crate::schema::*;
use actix::Handler;
use diesel::prelude::*;
use uuid::Uuid;

type AllColumns = (
    events_labels::id,
    events_labels::event_id,
    events_labels::label_id,
);

pub const ALL_COLUMNS: AllColumns = (
    events_labels::id,
    events_labels::event_id,
    events_labels::label_id,
);

#[derive(Queryable, Associations, Identifiable, Debug, Clone, Copy)]
#[belongs_to(super::event::Event, foreign_key = "event_id")]
#[belongs_to(super::label::Label, foreign_key = "label_id")]
#[table_name = "events_labels"]
pub struct EventLabel {
    pub id: Uuid,
    pub event_id: Uuid,
    pub label_id: Uuid,
}

#[derive(Insertable, Debug)]
#[table_name = "events_labels"]
pub struct NewEventLabel {
    pub event_id: Uuid,
    pub label_id: Uuid,
}

impl Handler<super::InsertMsg<(super::event::Event, &[super::label::Label]), ()>> for Database {
    type Result = super::Result<()>;

    fn handle(
        &mut self,
        msg: super::InsertMsg<(super::event::Event, &[super::label::Label]), ()>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        diesel::insert_into(events_labels::dsl::events_labels)
            .values(
                msg.value
                    .1
                    .iter()
                    .map(|label| NewEventLabel {
                        event_id: msg.value.0.id,
                        label_id: label.id,
                    })
                    .collect::<Vec<NewEventLabel>>(),
            )
            .execute(&connection)?;

        Ok(())
    }
}
