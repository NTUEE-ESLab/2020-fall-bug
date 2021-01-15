use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, PartialEq)]
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

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct Event {
    pub secret: u64,
    pub started_at_secs: i64,
    pub started_at_nsecs: u32,
    pub ended_at_secs: i64,
    pub ended_at_nsecs: u32,
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
        sound,
        Event {
            secret: 12345678,
            started_at_secs: 1608119495,
            started_at_nsecs: 142_000_000,
            ended_at_secs: 1608123495,
            ended_at_nsecs: 532_000_000,
            payload: EventPayload::Sound {
                wav_file: "3eeea9d6-3672-435c-9927-9463e72330cc.wav".to_owned(),
            }
        },
        vec![
            78, 97, 188, 0, 0, 0, 0, 0, // secret
            199, 244, 217, 95, 0, 0, 0, 0, // started_at_secs
            128, 191, 118, 8, // started_at_nsecs
            103, 4, 218, 95, 0, 0, 0, 0, // ended_at_secs
            0, 173, 181, 31, // ended_at_nsecs
            0, 0, 0, 0, // kind
            40, 0, 0, 0, 0, 0, 0, 0, 51, 101, 101, 101, 97, 57, 100, 54, 45, 51, 54, 55, 50, 45,
            52, 51, 53, 99, 45, 57, 57, 50, 55, 45, 57, 52, 54, 51, 101, 55, 50, 51, 51, 48, 99,
            99, 46, 119, 97, 118, // wav_file
        ]
    );
    test_serialize!(
        position,
        Event {
            secret: 12345678,
            started_at_secs: 1608119495,
            started_at_nsecs: 142_000_000,
            ended_at_secs: 1608123495,
            ended_at_nsecs: 532_000_000,
            payload: EventPayload::Position {
                from: (0, 3, 12),
                to: (400, 600, 11)
            },
        },
        vec![
            78, 97, 188, 0, 0, 0, 0, 0, // secret
            199, 244, 217, 95, 0, 0, 0, 0, // started_at_secs
            128, 191, 118, 8, // started_at_nsecs
            103, 4, 218, 95, 0, 0, 0, 0, // ended_at_secs
            0, 173, 181, 31, // ended_at_nsecs
            1, 0, 0, 0, // kind
            0, 0, 0, 0, // from x
            3, 0, 0, 0, // from y
            12, 0, 0, 0, // from z
            144, 1, 0, 0, // to x
            88, 2, 0, 0, // to y
            11, 0, 0, 0 // to z
        ]
    );
    test_serialize!(
        luminosity,
        Event {
            secret: 12345678,
            started_at_secs: 1608119495,
            started_at_nsecs: 142_000_000,
            ended_at_secs: 1608123495,
            ended_at_nsecs: 532_000_000,
            payload: EventPayload::Luminosity { from: 10, to: 800 },
        },
        vec![
            78, 97, 188, 0, 0, 0, 0, 0, // secret
            199, 244, 217, 95, 0, 0, 0, 0, // started_at_secs
            128, 191, 118, 8, // started_at_nsecs
            103, 4, 218, 95, 0, 0, 0, 0, // ended_at_secs
            0, 173, 181, 31, // ended_at_nsecs
            2, 0, 0, 0, // kind
            10, 0, 0, 0, // from
            32, 3, 0, 0 // to
        ]
    );
}
