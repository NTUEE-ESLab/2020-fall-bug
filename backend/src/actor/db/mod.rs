use actix::{Actor, Addr, Message, SyncArbiter, SyncContext};
use anyhow;
use diesel::{
    pg::PgConnection,
    r2d2::{ConnectionManager, Pool},
};
use num_cpus;
use std::{marker::PhantomData, result};
use structopt::StructOpt;

pub mod composed_event;
pub mod device;
pub mod device_credential;
pub mod event;
pub mod event_label;
pub mod label;

#[derive(Debug, Clone, StructOpt)]
pub struct Config {
    #[structopt(
        long = "db-host",
        env = "DB_HOST",
        default_value = "localhost",
        help = "the host of postgres"
    )]
    db_host: String,
    #[structopt(
        long = "db-port",
        env = "DB_PORT",
        default_value = "5432",
        help = "the port of postgres"
    )]
    db_port: u16,
    #[structopt(
        long = "db-name",
        env = "DB_NAME",
        default_value = "bug",
        help = "the database name of postgres"
    )]
    db_name: String,
    #[structopt(
        long = "db-user",
        env = "DB_USER",
        default_value = "dev",
        help = "the user of postgres"
    )]
    db_user: String,
    #[structopt(
        long = "db-password",
        env = "DB_PASSWORD",
        default_value = "dev",
        help = "the password of postgres"
    )]
    db_password: String,
}

impl Config {
    pub fn build(&self) -> anyhow::Result<Addr<Database>> {
        let manager = ConnectionManager::<PgConnection>::new(self.build_dsn());
        let pg_pool = Pool::builder().build(manager)?;
        Ok(SyncArbiter::start(num_cpus::get(), move || {
            Database(pg_pool.clone())
        }))
    }

    fn build_dsn(&self) -> String {
        format!(
            "postgres://{user}:{password}@{host}:{port}/{name}",
            user = self.db_user,
            password = self.db_password,
            host = self.db_host,
            port = self.db_port,
            name = self.db_name,
        )
    }
}

pub struct Database(pub Pool<ConnectionManager<PgConnection>>);

impl Actor for Database {
    type Context = SyncContext<Self>;
}

#[derive(Message)]
#[rtype(result = "Result<R>")]
pub struct InsertMsg<I, R>
where
    R: 'static,
{
    value: I,
    _phantom: PhantomData<R>,
}

impl<I, R> InsertMsg<I, R>
where
    R: 'static,
{
    pub fn new(value: I) -> Self {
        Self {
            value,
            _phantom: PhantomData,
        }
    }
}

#[derive(Message)]
#[rtype(result = "Result<R>")]
pub struct SelectMsg<P, R>
where
    R: 'static,
{
    param: P,
    _phantom: PhantomData<R>,
}

impl<P, R> SelectMsg<P, R>
where
    R: 'static,
{
    pub fn new(param: P) -> Self {
        Self {
            param,
            _phantom: PhantomData,
        }
    }
}

#[derive(Message)]
#[rtype(result = "Result<PhantomData<R>>")]
pub struct DeleteMsg<P, R>
where
    R: 'static,
{
    param: P,
    _phantom: PhantomData<R>,
}

impl<P, R> DeleteMsg<P, R>
where
    R: 'static,
{
    pub fn new(param: P) -> Self {
        Self {
            param,
            _phantom: PhantomData,
        }
    }
}

pub type Result<T> = result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    Diesel(diesel::result::Error),
    PoolError(diesel::r2d2::PoolError),
    Unexpected(String),
}

impl Error {
    pub fn not_found() -> Self {
        Error::Diesel(diesel::NotFound)
    }

    pub fn unexpected(msg: String) -> Self {
        Error::Unexpected(msg)
    }

    pub fn is_not_found(&self) -> bool {
        use Error::*;

        match self {
            Diesel(diesel::NotFound) => true,
            _ => false,
        }
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use Error::*;

        match self {
            Diesel(e) => write!(f, "diesel: {}", e),
            PoolError(e) => write!(f, "r2d2 pool: {}", e),
            Unexpected(msg) => write!(f, "unexpected: {}", msg),
        }
    }
}

impl From<diesel::result::Error> for Error {
    fn from(error: diesel::result::Error) -> Self {
        Self::Diesel(error)
    }
}

impl From<diesel::r2d2::PoolError> for Error {
    fn from(error: diesel::r2d2::PoolError) -> Self {
        Self::PoolError(error)
    }
}

impl From<actix::MailboxError> for Error {
    fn from(error: actix::MailboxError) -> Self {
        Self::Unexpected(match error {
            actix::MailboxError::Closed => String::from("mailbox error: closed"),
            actix::MailboxError::Timeout => String::from("mailbox error: timeout"),
        })
    }
}
