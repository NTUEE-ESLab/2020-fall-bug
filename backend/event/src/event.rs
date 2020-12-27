use diesel::{
    pg::{types::sql_types::Jsonb, Pg},
    serialize::Output,
    types::{FromSql, ToSql},
};
use serde::{Deserialize, Serialize};
use std::io::Write;

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, PartialEq)]
#[sql_type = "Jsonb"]
pub enum EventPayload {
    Sound {
        wav_file: String,
    },
    Luminosity {
        from: i32,
        to: i32,
    },
    Position {
        from: (i32, i32, i32),
        to: (i32, i32, i32),
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

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct Event {
    pub started_at_secs: i64,
    pub started_at_nsecs: u32,
    pub ended_at_secs: i64,
    pub ended_at_nsecs: u32,
    pub secret: u32,
    pub payload: EventPayload,
}

#[cfg(test)]
mod tests {
    use super::*;

    macro_rules! test_serialize {
        ($name:ident, $event:expr, $expected:expr) => {
            #[test]
            fn $name() {
                let bin = bincode::serialize(&$event).unwrap();
                assert_eq!(bin, $expected);
            }
        };
    }

    test_serialize!(
        luminosity,
        Event {
            started_at_secs: 1608119495,
            started_at_nsecs: 142_000_000,
            ended_at_secs: 1608123495,
            ended_at_nsecs: 532_000_000,
            secret: 12345678,
            payload: EventPayload::Luminosity { from: 10, to: 800 },
        },
        vec![
            199, 244, 217, 95, 0, 0, 0, 0, // started_at_secs
            128, 191, 118, 8, // started_at_nsecs
            103, 4, 218, 95, 0, 0, 0, 0, // ended_at_secs
            0, 173, 181, 31, // ended_at_nsecs
            78, 97, 188, 0, // secret
            1, 0, 0, 0, // payload kind
            10, 0, 0, 0, // from
            32, 3, 0, 0 // to
        ]
    );
    test_serialize!(
        position,
        Event {
            started_at_secs: 1608119495,
            started_at_nsecs: 142_000_000,
            ended_at_secs: 1608123495,
            ended_at_nsecs: 532_000_000,
            secret: 12345678,
            payload: EventPayload::Position {
                from: (0, 3, 12),
                to: (400, 600, 11)
            },
        },
        vec![
            199, 244, 217, 95, 0, 0, 0, 0, // started_at_secs
            128, 191, 118, 8, // started_at_nsecs
            103, 4, 218, 95, 0, 0, 0, 0, // ended_at_secs
            0, 173, 181, 31, // ended_at_nsecs
            78, 97, 188, 0, // secret
            2, 0, 0, 0, // payload kind
            0, 0, 0, 0, // from x
            3, 0, 0, 0, // from y
            12, 0, 0, 0, // from z
            144, 1, 0, 0, // to x
            88, 2, 0, 0, // to y
            11, 0, 0, 0 // to z
        ]
    );
}
