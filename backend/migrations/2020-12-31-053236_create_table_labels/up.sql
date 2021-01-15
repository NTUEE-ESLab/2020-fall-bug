CREATE TABLE IF NOT EXISTS labels (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- data
  event_kind EVENT_KIND NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rule JSONB NOT NULL,
  -- fk
  device_id UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE ON UPDATE CASCADE,
  -- constrain
  UNIQUE(event_kind, name, device_id)
);
