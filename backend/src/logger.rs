use anyhow::anyhow;
use slog::{Drain, LevelFilter, Logger};
use slog_async::Async;
use slog_term::{FullFormat, TermDecorator};
use std::{io, str::FromStr};
use structopt::StructOpt;

#[derive(Debug, Clone, StructOpt)]
pub struct Config {
    #[structopt(
        long = "log-level",
        env = "LOG_LEVEL",
        default_value = "info",
        help = "the level logger to log"
    )]
    pub log_level: Level,
}

impl Config {
    pub fn build(&self) -> Logger {
        let decorator = TermDecorator::new().build();
        let drain = FullFormat::new(decorator)
            .use_custom_timestamp(timestamp_fn)
            .build()
            .fuse();
        let drain = LevelFilter::new(drain, self.log_level.into()).fuse();
        let drain = Async::new(drain).build().fuse();
        Logger::root(drain, o!())
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Level {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Critical,
}

impl FromStr for Level {
    type Err = anyhow::Error;

    fn from_str(level: &str) -> Result<Self, Self::Err> {
        match level.to_ascii_lowercase().as_str() {
            "trace" => Ok(Level::Trace),
            "debug" => Ok(Level::Debug),
            "info" => Ok(Level::Info),
            "warn" => Ok(Level::Warn),
            "error" => Ok(Level::Error),
            "critical" => Ok(Level::Error),
            _ => Err(anyhow!("log level {} is not supported", level)),
        }
    }
}

impl From<Level> for slog::Level {
    fn from(level: Level) -> Self {
        match level {
            Level::Trace => slog::Level::Trace,
            Level::Debug => slog::Level::Debug,
            Level::Info => slog::Level::Info,
            Level::Warn => slog::Level::Warning,
            Level::Error => slog::Level::Error,
            Level::Critical => slog::Level::Critical,
        }
    }
}

pub fn timestamp_fn(io: &mut dyn io::Write) -> io::Result<()> {
    write!(io, "{}", chrono::Local::now().format("%Y/%m/%d %T"))
}
