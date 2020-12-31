CREATE TABLE IF NOT EXISTS device_credentials (
  -- base
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- data
  secret BYTEA NOT NULL,
  -- fk
  device_id UUID NOT NULL REFERENCES devices (id)
)
