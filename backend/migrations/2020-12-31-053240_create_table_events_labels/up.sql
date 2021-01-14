CREATE TABLE IF NOT EXISTS events_labels (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- fk
  event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE,
  label_id UUID NOT NULL REFERENCES labels (id) ON DELETE CASCADE ON UPDATE CASCADE,
  -- constrain
  UNIQUE(event_id, label_id)
);
