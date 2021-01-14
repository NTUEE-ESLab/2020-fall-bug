use diesel::pg::types::sql_types::Jsonb;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(AsExpression, Serialize, Deserialize, Debug)]
#[sql_type = "Jsonb"]
pub enum ComposedEventRule {
    AllOf(Box<ComposedEventRule>),
    AnyOf(Box<ComposedEventRule>),
    DeviceId(Uuid),
}
