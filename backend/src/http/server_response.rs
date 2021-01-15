use crate::actor::db;
use actix::MailboxError;
use actix_web::{error::ResponseError, http::StatusCode};
use serde::{ser::SerializeStruct, Serialize, Serializer};
use serde_json;
use std::fmt::{self, Display, Formatter};

const UNEXPECTED_INTERNAL_SERVER_ERROR: &str =
    r#"{ "code": 500, "message": "Internal Server Error" }"#;

#[derive(Serialize, Debug)]
pub struct Pagination {}

#[derive(Serialize, Debug)]
pub struct Document<T>
where
    T: Serialize,
{
    data: T,
    #[serde(skip_serializing_if = "Option::is_none")]
    pagination: Option<Pagination>,
}

impl<T> Document<T>
where
    T: Serialize,
{
    pub fn new(data: T) -> Self {
        Document {
            data,
            pagination: None,
        }
    }
}

#[derive(Serialize, Debug)]
pub struct Error {
    #[serde(serialize_with = "serialize_status_code", flatten)]
    code: StatusCode,
    #[serde(skip_serializing_if = "ErrorDetail::is_private")]
    detail: ErrorDetail,
}

impl Display for Error {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match serde_json::to_string(self) {
            Ok(serialized) => f.write_str(serialized.as_str()),
            Err(_) => f.write_str(UNEXPECTED_INTERNAL_SERVER_ERROR),
        }
    }
}

impl ResponseError for Error {
    fn status_code(&self) -> StatusCode {
        self.code
    }
}

impl From<MailboxError> for Error {
    fn from(error: MailboxError) -> Self {
        Self {
            code: StatusCode::INTERNAL_SERVER_ERROR,
            detail: ErrorDetail::new_private(ErrorKind::Actix, error.to_string()),
        }
    }
}

impl From<db::Error> for Error {
    fn from(error: db::Error) -> Self {
        let detail = match error {
            db::Error::Diesel(error) => match error {
                diesel::result::Error::NotFound => {
                    ErrorDetail::new(ErrorKind::NotFound, String::from("resource not found"))
                }
                _ => ErrorDetail::new_private(ErrorKind::DB, error.to_string()),
            },
            db::Error::PoolError(error) => {
                ErrorDetail::new_private(ErrorKind::DB, error.to_string())
            }
            db::Error::Unexpected(msg) => ErrorDetail::new_private(ErrorKind::DB, msg),
        };
        Self {
            code: match detail.kind {
                ErrorKind::NotFound => StatusCode::NOT_FOUND,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            },
            detail,
        }
    }
}

#[derive(Serialize, Debug)]
pub enum ErrorKind {
    Actix,
    DB,
    NotFound,
}

#[derive(Serialize, Debug)]
pub struct ErrorDetail {
    kind: ErrorKind,
    message: String,
    private: bool,
}

impl ErrorDetail {
    pub fn new(kind: ErrorKind, message: String) -> Self {
        Self {
            kind,
            message,
            private: false,
        }
    }

    pub fn new_private(kind: ErrorKind, message: String) -> Self {
        Self {
            kind,
            message,
            private: true,
        }
    }

    fn is_private(msg: &ErrorDetail) -> bool {
        msg.private
    }
}

fn serialize_status_code<S>(code: &StatusCode, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let mut state = serializer.serialize_struct("StatusCode", 2)?;
    state.serialize_field("code", &code.as_u16())?;
    state.serialize_field("message", code.canonical_reason().unwrap())?;
    state.end()
}
