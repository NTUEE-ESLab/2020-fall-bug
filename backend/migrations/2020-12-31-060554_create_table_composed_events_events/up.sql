CREATE TABLE IF NOT EXISTS composed_events_events (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- data
  judgement_id UUID NOT NULL,
  -- fk
  composed_event_id UUID NOT NULL REFERENCES composed_events (id) ON DELETE CASCADE ON UPDATE CASCADE,
  event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE
);
