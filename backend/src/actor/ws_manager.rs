use crate::actor::db::event::Event;
use actix::{Actor, Addr, Context, Handler, Message, Running, StreamHandler};
use actix_web_actors::ws::{self, WebsocketContext};
use slog::Logger;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, PartialEq, Eq, Hash)]
pub enum WsSessionTarget {
    Event,
}

#[derive(Message)]
#[rtype(result = "()")]
pub enum WsMessage {
    Text(Box<String>),
}

#[derive(Debug)]
pub struct WsSession {
    logger: Logger,
}

impl WsSession {
    pub fn new(logger: Logger) -> Self {
        Self { logger }
    }
}

impl Actor for WsSession {
    type Context = WebsocketContext<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        info!(self.logger, "ws session started");
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        info!(self.logger, "ws session is stopping");
        Running::Stop
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        info!(self.logger, "ws session stopped");
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsSession {
    fn handle(&mut self, _: Result<ws::Message, ws::ProtocolError>, _: &mut Self::Context) {}
}

impl Handler<WsMessage> for WsSession {
    type Result = ();

    fn handle(&mut self, msg: WsMessage, ctx: &mut Self::Context) -> Self::Result {
        match msg {
            WsMessage::Text(text) => ctx.text(text.as_str()),
        }
    }
}

#[derive(Debug, Clone)]
pub struct WsManager {
    sessions: Arc<Mutex<HashMap<WsSessionTarget, Vec<Addr<WsSession>>>>>,
    logger: Logger,
}

impl WsManager {
    pub fn new(logger: Logger) -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            logger,
        }
    }

    pub fn register(&self, target: WsSessionTarget, ws_session_addr: Addr<WsSession>) {
        self.sessions
            .lock()
            .unwrap()
            .entry(target)
            .or_insert(Vec::new())
            .push(ws_session_addr);
    }

    pub fn send_event(&self, event: Event) {
        let text = Box::new(serde_json::to_string(&event).unwrap());
        if let Some(sessions) = self.sessions.lock().unwrap().get(&WsSessionTarget::Event) {
            sessions
                .iter()
                .for_each(|ws_session_addr| ws_session_addr.do_send(WsMessage::Text(text.clone())));
        }
    }
}

impl Actor for WsManager {
    type Context = Context<Self>;
}
