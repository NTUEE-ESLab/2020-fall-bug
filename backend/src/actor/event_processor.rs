use crate::actor::{
    db::{
        self,
        event::{Event, NewEvent},
        event_label::EventLabel,
        label::Label,
        Database, InsertMsg,
    },
    ws_manager::WsManager,
};
use actix::{Actor, Addr, Context, Handler, ResponseFuture, Running};
use db::SelectMsg;
use slog::Logger;

pub struct EventProcessor {
    logger: Logger,
    database_addr: Addr<Database>,
    ws_manager: WsManager,
}

impl EventProcessor {
    pub fn new(logger: Logger, database_addr: Addr<Database>, ws_manager: WsManager) -> Self {
        Self {
            logger,
            database_addr,
            ws_manager,
        }
    }

    pub fn start(
        logger: Logger,
        database_addr: Addr<Database>,
        ws_manager: WsManager,
    ) -> Addr<Self> {
        Self::new(logger, database_addr, ws_manager).start()
    }
}

impl Actor for EventProcessor {
    type Context = Context<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        info!(self.logger, "event processor started");
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        info!(self.logger, "event processor is stopping");
        Running::Stop
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        info!(self.logger, "event processor stopped");
    }
}

impl Handler<NewEvent> for EventProcessor {
    type Result = ResponseFuture<db::Result<Event>>;

    fn handle(&mut self, msg: NewEvent, _: &mut Self::Context) -> Self::Result {
        let database_addr = self.database_addr.clone();
        let ws_manager = self.ws_manager.clone();
        Box::pin(async move {
            let labels: Vec<Label> = database_addr.send(SelectMsg::new(())).await??;
            let event = database_addr.send(InsertMsg::new(msg)).await??;
            // TODO: create event_label to link label to event
            let _event_labels = match_event_labels(&event, labels);
            ws_manager.send_event(event.clone());
            Ok(event)
        })
    }
}

// TODO: match event by label rule
fn match_event_labels(_event: &Event, _labels: Vec<Label>) -> Vec<EventLabel> {
    Vec::new()
}
