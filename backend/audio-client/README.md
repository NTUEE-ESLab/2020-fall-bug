# BUG - Audio Client

Audio client to send sound event to Backend through UDP.

## Usage

```text
audio-client 0.1.0

USAGE:
    audio-client [OPTIONS] --server-secret <server-secret>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
        --threshold <open-threshold>         the noise gate open threshold [default: 0.1]
        --release-time <release-time>        the noise gate release time in second [default: 0.5]
        --server-address <server-address>    the audio server address to send collected audio to in ipv4 [default:
                                             127.0.0.1:3003]
        --server-secret <server-secret>      the secret to have audio server authenticate
```

## Troubleshooting

### Dependencies Compiling Error

When encountering error `Pkg-config failed - usually this is because alsa development headers are not installed` at compile time

- For Debian/Ubuntu users

  ```bash
  apt-get install libasound2-dev
  ```

- For Fedora users

  ```bash
  dnf install alsa-lib-devel
  ```
