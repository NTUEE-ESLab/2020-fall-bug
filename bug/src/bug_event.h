#ifndef __BUG_EVENT_H__
#define __BUG_EVENT_H__

#include "logger.h"
#include "mbed.h"
#include "variant"

struct TimeRange {
  uint64_t started_at;
  uint64_t ended_at;
  TimeRange() : started_at(0), ended_at(0) {}
};

template <class... Ts>
struct overload : Ts... {
  using Ts::operator()...;
};
template <class... Ts>
overload(Ts...) -> overload<Ts...>;

struct Position {
  const static int kind = 1;
  int32_t from[3];
  int32_t to[3];
  Position() : from{0}, to{0} {}
};

struct Luminosity {
  const static int kind = 2;
  int32_t from;
  int32_t to;
  Luminosity() : from(0), to(0) {}
};

using BugEventKind = variant<Luminosity*, Position*>;

#define encode_little_endian_4(buf, offset, data)     \
  *(buf + *offset + 3) = (data & 0xff000000UL) >> 24; \
  *(buf + *offset + 2) = (data & 0x00ff0000UL) >> 16; \
  *(buf + *offset + 1) = (data & 0x0000ff00) >> 8;    \
  *(buf + *offset) = (data & 0x000000ff);             \
  (*offset) += 4;

class BugEventCodec {
 public:
  BugEventCodec(uint64_t secret) : _secret(secret) {}

  uint encode(uint8_t* buf, BugEventKind kind, TimeRange& tr,
              int32_t ntp_secs) {
    uint64_t started_at_secs = ntp_secs + tr.started_at / 1000;
    uint32_t started_at_nsecs = (tr.started_at % 1000) * 1000000;
    uint64_t ended_at_secs = ntp_secs + tr.ended_at / 1000;
    uint32_t ended_at_nsecs = (tr.ended_at % 1000) * 1000000;

    uint offset = 0;
    encode_little_endian_4(buf, &offset, _secret);
    encode_little_endian_4(buf, &offset, _secret >> 32);
    encode_little_endian_4(buf, &offset, started_at_secs);
    encode_little_endian_4(buf, &offset, started_at_secs >> 32);
    encode_little_endian_4(buf, &offset, started_at_nsecs);
    encode_little_endian_4(buf, &offset, ended_at_secs);
    encode_little_endian_4(buf, &offset, ended_at_secs >> 32);
    encode_little_endian_4(buf, &offset, ended_at_nsecs);

    auto visitors = overload{
        [&](Position*& position) {
          encode_little_endian_4(buf, &offset, Position::kind);
          encode_little_endian_4(buf, &offset, position->from[0]);
          encode_little_endian_4(buf, &offset, position->from[1]);
          encode_little_endian_4(buf, &offset, position->from[2]);
          encode_little_endian_4(buf, &offset, position->to[0]);
          encode_little_endian_4(buf, &offset, position->to[1]);
          encode_little_endian_4(buf, &offset, position->to[2]);
        },
        [&](Luminosity*& luminosity) {
          encode_little_endian_4(buf, &offset, Luminosity::kind);
          encode_little_endian_4(buf, &offset, luminosity->from);
          encode_little_endian_4(buf, &offset, luminosity->to);
        },
    };

    visit(visitors, kind);

    return offset;
  }

 private:
  uint64_t _secret;
};

#endif
