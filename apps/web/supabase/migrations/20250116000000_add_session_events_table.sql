CREATE TYPE event_type AS ENUM (
  'rage_click',
  'refresh',
  'selection',
  'uturn',
  'window_resize',
  'click',
  'input',
  'page_view',
  'error'
);

CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_session_events_session_id ON session_events(session_id);
CREATE INDEX idx_session_events_type ON session_events(event_type);