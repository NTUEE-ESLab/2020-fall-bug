# BUG - Backend

Backend serves as a TCP/UDP server for devices to report events, and as a RESTful API server for user at browser to interact.

## Usage

```text
backend 0.1.0

USAGE:
    backend [OPTIONS]

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
        --log-level <log-level>                        the level logger to log [env: LOG_LEVEL=]  [default: info]
        --db-host <db-host>                            the host of postgres [env: DB_HOST=]  [default: localhost]
        --db-name <db-name>                            the database name of postgres [env: DB_NAME=]  [default: bug]
        --db-password <db-password>                    the password of postgres [env: DB_PASSWORD=]  [default: dev]
        --db-port <db-port>                            the port of postgres [env: DB_PORT=]  [default: 5432]
        --db-user <db-user>                            the user of postgres [env: DB_USER=]  [default: dev]
        --server-port <server-port>
            the port for server to listen to [env: SERVER_PORT=]  [default: 3001]
        --event-server-port <event-server-port>
            the port for event server to listen to [env: EVENT_SERVER_PORT=]  [default: 3002]
        --audio-server-port <audio-server-port>
            the port for audio server to listen to [env: AUDIO_SERVER_PORT=]  [default: 3003]
        --audio-wav-directory <audio-wav-directory>
            the directory to store collected wav file [env: AUDIO_WAV_DIRECTORY=]  [default: ./wav]
```

## Build

```bash
cargo build --release
```

## Run

```bash
./target/release/backend
```
