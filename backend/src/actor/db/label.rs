use crate::{actor::db::Database, schema::*};
use actix::Handler;
use diesel::{
    pg::{types::sql_types::Jsonb, Pg},
    prelude::*,
    serialize::Output,
    types::{FromSql, ToSql},
};
use serde::{Deserialize, Serialize};
use serde_json;
use std::{io::Write, marker::PhantomData};
use uuid::Uuid;

type AllColumns = (
    labels::id,
    labels::event_kind,
    labels::name,
    labels::description,
    labels::rule,
    labels::device_id,
);

pub const ALL_COLUMNS: AllColumns = (
    labels::id,
    labels::event_kind,
    labels::name,
    labels::description,
    labels::rule,
    labels::device_id,
);

#[derive(Queryable, Identifiable, Associations, Serialize, Debug)]
#[table_name = "labels"]
pub struct Label {
    pub id: Uuid,
    pub event_kind: EventKind,
    pub name: String,
    pub description: String,
    pub rule: LabelRule,
    pub device_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NumberOperator<T> {
    Eq(T),
    Gt(T),
    Lt(T),
    Gte(T),
    Lte(T),
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug)]
#[sql_type = "Jsonb"]
#[serde(rename_all = "snake_case", tag = "kind", content = "payload")]
pub enum LabelRule {
    SoundSimilarity {
        wav_file: String,
        operator: NumberOperator<u16>,
    },
    PositionDifference {
        #[serde(skip_serializing_if = "Option::is_none")]
        x: Option<NumberOperator<i64>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        y: Option<NumberOperator<i64>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        z: Option<NumberOperator<i64>>,
    },
    LuminosityDifference {
        operator: NumberOperator<i64>,
    },
}

impl FromSql<Jsonb, Pg> for LabelRule {
    fn from_sql(bytes: Option<&[u8]>) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for LabelRule {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(&self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, out)
    }
}

#[derive(Insertable, Deserialize, Debug)]
#[table_name = "labels"]
pub struct NewLabel {
    pub event_kind: EventKind,
    pub name: String,
    pub description: String,
    pub rule: LabelRule,
    pub device_id: Uuid,
}

impl Handler<super::SelectMsg<(), Vec<Label>>> for Database {
    type Result = super::Result<Vec<Label>>;

    fn handle(
        &mut self,
        _: super::SelectMsg<(), Vec<Label>>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        Ok(labels::table
            .select(ALL_COLUMNS)
            .get_results::<Label>(&connection)?)
    }
}

impl Handler<super::InsertMsg<NewLabel, Label>> for Database {
    type Result = super::Result<Label>;

    fn handle(
        &mut self,
        msg: super::InsertMsg<NewLabel, Label>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        let id = diesel::insert_into(labels::dsl::labels)
            .values(&msg.value)
            .returning(labels::id)
            .get_result::<Uuid>(&connection)?;

        Ok(Label {
            id,
            event_kind: msg.value.event_kind,
            name: msg.value.name,
            description: msg.value.description,
            rule: msg.value.rule,
            device_id: msg.value.device_id,
        })
    }
}

impl Handler<super::DeleteMsg<Uuid, Label>> for Database {
    type Result = super::Result<PhantomData<Label>>;

    fn handle(
        &mut self,
        msg: super::DeleteMsg<Uuid, Label>,
        _: &mut Self::Context,
    ) -> Self::Result {
        let connection = self.0.get()?;
        match diesel::delete(labels::table.filter(labels::id.eq(msg.param))).execute(&connection)? {
            0 => Err(super::Error::not_found()),
            1 => Ok(PhantomData),
            num => Err(super::Error::unexpected(format!(
                "expect 1 device to be deleted, but got {}",
                num
            ))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    macro_rules! test_label_rule_serialize {
        ($name:ident, $event:expr, $expected:expr) => {
            #[test]
            fn $name() {
                let json = serde_json::to_string(&$event).unwrap();
                assert_eq!(json, $expected);
            }
        };
    }

    test_label_rule_serialize!(
        sound_similarity,
        LabelRule::SoundSimilarity {
            wav_file: String::from("e15f9c78-595d-4654-b0a0-8d745acc997b.wav"),
            operator: NumberOperator::Gt(75)
        },
        r#"{"kind":"sound_similarity","payload":{"wav_file":"e15f9c78-595d-4654-b0a0-8d745acc997b.wav","operator":{"gt":75}}}"#.to_owned()
    );
    test_label_rule_serialize!(
        position_difference,
        LabelRule::PositionDifference {
            x: Some(NumberOperator::Gt(20)),
            y: Some(NumberOperator::Gt(50)),
            z: None,
        },
        r#"{"kind":"position_difference","payload":{"x":{"gt":20},"y":{"gt":50}}}"#.to_owned()
    );
    test_label_rule_serialize!(
        luminosity_difference,
        LabelRule::LuminosityDifference {
            operator: NumberOperator::Gt(100)
        },
        r#"{"kind":"luminosity_difference","payload":{"operator":{"gt":100}}}"#.to_owned()
    );
}
