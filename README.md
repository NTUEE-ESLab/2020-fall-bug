# BUG - Be Ur Guard

## Table of Contents

- [BUG - Be Ur Guard](#bug---be-ur-guard)
  - [Table of Contents](#table-of-contents)
  - [Why Making BUG](#why-making-bug)
  - [How BUG Works](#how-bug-works)
    - [BUG - Bug](#bug---bug)
    - [BUG - Backend](#bug---backend)
    - [BUG - Frontend](#bug---frontend)
  - [Proof of Concept](#proof-of-concept)
  - [Challenge](#challenge)
    - [Keep TCP Connection Alive](#keep-tcp-connection-alive)
    - [Data Filtering](#data-filtering)
  - [To Improve](#to-improve)
  - [Credits](#credits)

## Why Making BUG

When it comes to home safety, security camera is always the top choice because for human it is easy to read the abnormal, however the recorded videos are hard for resource constrained devices to store or analyze at realtime. So BUG makes use of other sensor-able materials such as sound, position and luminosity to record signals from environment as events.

Most time a meaningful event for human is composed by multiple single-material events. For example, opening a door might be accompanied with:

- Specific Sound
- Different Position
- Different Luminosity

So BUG provides user an interface to define rule about how to label single-material events and how to compose the labelled events to be human readable ones as **composed events**.

## How BUG Works

BUG consists of 3 parts: Bug, Backend, Frontend.

![What Composes BUG](./img/what-composes-bug.png)

### BUG - Bug

Bug represents the devices recording events. For this proof of concept, we have two MCU serving as Bug:

- STM32L475

  - Use acceleration sensor on it to detect whether self position has difference
  - Use photoresistor sensor to detect whether luminosity has difference (not yet implemented).
  - Send position, luminosity event to Backend through TCP

- RPi3

  - Use USB microphone to sense sound around it
  - Send sound event to Backend through UDP

### BUG - Backend

Backend serves as a TCP/UDP server for devices to report events. Backend also serves as a RESTful API server for user at browser to interact with:

- Create/Read/Delete on devices
- Read/Subscription on events
- Create/Read/Delete on labels

After label created, the following events will be checked whether match the rule, if matched, it will be labelled automatically. (not implemented for all events yet)

### BUG - Frontend

Frontend serves web assets for browser to render. Users can browser the event history day by day, make label rules, composed events rules, and manage devices on it.

## Proof of Concept

![Proof of Concept](./img/proof-of-concept.gif)

## Challenge

### Keep TCP Connection Alive

When integrated with wifi module wifi-ism43362, it has no way to know whether MCU is connected to remote socket. After digging into the source code, I found there is a private member `connected` recording the state of it. So I try to inherit the class `TCPSocket` and utilize the struct layout to peek the state to ensure the connection is alive. For example:

```c++
#include "TCPSocket.h"

// Copy from ISM43362Interface.cpp. Reference: https://github.com/ARMmbed/wifi-ism43362/blob/3813a4bb8623cc9b0525978748581f60d47142fa/ISM43362Interface.cpp#L301-L308
struct ISM43362_socket {
  int _;
  nsapi_protocol_t __;
  volatile bool connected;
};

class TCPClient : protected TCPSocket {
  bool connected() {
    return ((struct ISM43362_socket*)_socket)->connected;
  }
};
```

Another challenge I found that I haven't found a way to reconnect to wifi after access point restarts. After digging into the source, I found there is an api to reset the ISM43362 module, after reset and reconnecting works! So I forked the repository to expose the function `reset` of `ISM43362` on class `ISM43362Interface`. Here is the [patch commit](https://github.com/han0110/wifi-ism43362/commit/907dbf0f63a4105dfa250db8919d5f821fcf16ab).

### Data Filtering

For data filtering, I use noise gate algorithm to filter noise. It is implemented as a finite state machine with 3 state `Opened`, `Closing`, `Closed`. With the `Closing` state design, it can effectively prevent signal from split into too much fragment. Here is the pseudo code for next state:

```python
enum State { Opened, Closing, Closed }

def next_state(value):
  over_threshold = value > threshold

  if state is Opened and not over_threshold:
    state = Closing
    remaining_release_count = release_count
  elif state is Closing:
    if over_threshold:
      state = Opened
    else:
      if remaining_release_count == 0:
        state = Closed
      else:
        remaining_release_count -= 1
  elif state is Closed and over_threshold:
    state = Opened
```

## To Improve

- Implement luminosity tracker
- Implement auto event labelling
- Implement composed event composing
- Implement email notification and push notification
- Use TLS/DTLS between Bug and Backend
- Offline mode for Bug

## Credits

These awesome blogs help a lot.

- [Audio Processing for Dummies](https://adventures.michaelfbryan.com/posts/audio-processing-for-dummies)
