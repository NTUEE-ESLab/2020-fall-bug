CREATE TABLE IF NOT EXISTS events (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- data
  kind EVENT_KIND NOT NULL,
  payload JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  -- fk
  device_id UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE ON UPDATE CASCADE
);
