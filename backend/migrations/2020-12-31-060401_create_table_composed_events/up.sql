CREATE TABLE IF NOT EXISTS composed_events (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- data
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  rule JSONB NOT NULL
);
