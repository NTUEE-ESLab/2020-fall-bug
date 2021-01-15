#ifndef __TRACKER_POSITION_H__
#define __TRACKER_POSITION_H__

#include "accelero.h"
#include "bug_event.h"
#include "client_bug_event.h"
#include "logger.h"
#include "mbed.h"
#include "noise_gate.h"

#define SAMPLE_RATE 30ms
#define SAMPLE_NOISE_2 3
// TODO: tune the down scale
#define SAMPLE_POSITION_DOWN_SCALE 100000
#define NOISE_GATE_THRESHOULD 10
#define NOISE_GATE_RELEASE_COUNT 0.3s / SAMPLE_RATE

class Acceleration {
 public:
  int16_t bias[3];
  int16_t last[3];
  int16_t curr[3];
  int64_t ts_last;
  int64_t ts_curr;

  Acceleration() : curr{0}, ts_curr(0) {
    BSP_ACCELERO_AccGetXYZ(bias);
    sample();
  }

  inline bool operator>(int64_t rhs) {
    return std::abs(curr[0]) > rhs || std::abs(curr[1]) > rhs ||
           std::abs(curr[2]) > rhs;
  }

  void sample() {
    ts_last = ts_curr;
    ts_curr = rtos::Kernel::get_ms_count();
    std::memcpy(last, curr, sizeof(curr));
    BSP_ACCELERO_AccGetXYZ(curr);
    log_traceln("acceleration x: %ld, y: %ld, z: %ld", curr[0], curr[1],
                curr[2]);
    // TODO: filter vibration peak
    curr[0] -= bias[0];
    curr[1] -= bias[1];
    curr[2] -= bias[2];
  }

  void apply_velocify_and_position(int32_t* velocity, int32_t* position) {
    int64_t duration = ts_curr - ts_last;
    int16_t sum[3] = {
        curr[0] + last[0],
        curr[1] + last[1],
        curr[2] + last[2],
    };

    *velocity +=
        (std::abs(sum[0]) > SAMPLE_NOISE_2 ? sum[0] : 0) * duration / 2;
    *(velocity + 1) +=
        (std::abs(sum[1]) > SAMPLE_NOISE_2 ? sum[1] : 0) * duration / 2;
    *(velocity + 2) +=
        (std::abs(sum[2]) > SAMPLE_NOISE_2 ? sum[2] : 0) * duration / 2;

    *position += *velocity * duration / SAMPLE_POSITION_DOWN_SCALE;
    *(position + 1) += *(velocity + 1) * duration / SAMPLE_POSITION_DOWN_SCALE;
    *(position + 2) += *(velocity + 2) * duration / SAMPLE_POSITION_DOWN_SCALE;
  }
};

class PositionTracker : Sink<Acceleration> {
  typedef PositionTracker Self;

 public:
  PositionTracker(BugEventClient* client)
      : _client(client),
        _noise_gate(new NoiseGate<Acceleration, int64_t>(
            NOISE_GATE_THRESHOULD, NOISE_GATE_RELEASE_COUNT, this)),
        _thread(new rtos::Thread),
        _event_queue(new events::EventQueue),
        _acceleration(NULL),
        _velocity{0},
        _position{0},
        _event_time_range(TimeRange()),
        _event_position(NULL) {
    _event_queue->call(this, &Self::init_callback);
  }

 protected:
  void start() {
    _event_queue->call_every(SAMPLE_RATE, this, &Self::sample_callback);
    _thread->start(
        mbed::callback(_event_queue, &events::EventQueue::dispatch_forever));
  }

  void join() { _thread->join(); }

 private:
  void init_callback() {
    auto accelero_ret = BSP_ACCELERO_Init();
    if (accelero_ret != ACCELERO_StatusTypeDef::ACCELERO_OK) {
      log_errorln("failed to init accelero, error: %d", accelero_ret);
    }
    _acceleration = new Acceleration;
  }

  void sample_callback() {
    _acceleration->sample();
    _noise_gate->process(*_acceleration);
  }

  // give access for NoiseGate for sink implementation
  friend class NoiseGate<Acceleration, int64_t>;

  // implement Sink
  virtual void record(Acceleration& _) {
    if (_event_position == NULL) {
      _event_time_range.started_at = _acceleration->ts_curr;
      _event_position = new Position();
      std::memset(_velocity, 0, sizeof(_velocity));
      std::memcpy(_event_position->from, _position, sizeof(_position));
    }
    _acceleration->apply_velocify_and_position(_velocity, _position);
  }

  // implement Sink
  virtual void end_of_record() {
    if (_event_position == NULL) {
      log_errorln("unexpected call before record something");
      return;
    }

    // send position event
    std::memcpy(_event_position->to, _position, sizeof(_position));
    _event_time_range.ended_at = _acceleration->ts_curr;
    if (std::memcmp(_event_position->from, _event_position->to,
                    sizeof(_event_position->from)) != 0) {
      _client->send(_event_position, _event_time_range);
    }

    // cleanup
    delete _event_position;
    _event_position = NULL;
  }

 private:
  BugEventClient* _client;
  NoiseGate<Acceleration, int64_t>* _noise_gate;
  rtos::Thread* _thread;
  events::EventQueue* _event_queue;
  Acceleration* _acceleration;
  int32_t _velocity[3];
  int32_t _position[3];
  TimeRange _event_time_range;
  Position* _event_position;
};

#endif
