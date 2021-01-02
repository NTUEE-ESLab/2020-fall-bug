CREATE TABLE IF NOT EXISTS devices (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- data
  name TEXT NOT NULL,
  description TEXT NOT NULL
);
