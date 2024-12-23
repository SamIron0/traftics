-- Add new columns to sessions table
ALTER TABLE sessions
-- Device Information
ADD COLUMN device_type text,
ADD COLUMN os text,
ADD COLUMN os_version text,
ADD COLUMN browser text,
ADD COLUMN browser_version text,

-- Geolocation
ADD COLUMN city text,
ADD COLUMN region text,
ADD COLUMN timezone text,

-- User Interaction Metrics
ADD COLUMN total_clicks integer DEFAULT 0,
ADD COLUMN total_scroll_distance integer DEFAULT 0,
ADD COLUMN total_inputs integer DEFAULT 0,
ADD COLUMN session_error_count integer DEFAULT 0,

-- Network Information
ADD COLUMN network_speed text,
ADD COLUMN isp text,

-- Session Status
ADD COLUMN is_active boolean DEFAULT true,
ADD COLUMN end_reason text;

-- Add new columns to page_events table
ALTER TABLE page_events
ADD COLUMN referrer text,
ADD COLUMN page_load_time integer,
ADD COLUMN time_spent integer,
ADD COLUMN scroll_depth integer,
ADD COLUMN error_count integer DEFAULT 0;

-- Create user_events table
CREATE TABLE public.user_events (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  element_selector text,
  event_data jsonb,
  CONSTRAINT user_events_pkey PRIMARY KEY (id)
);

-- Create network_events table
CREATE TABLE public.network_events (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  request_url text NOT NULL,
  status_code integer NOT NULL,
  method text NOT NULL,
  response_time integer NOT NULL,
  is_successful boolean NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  CONSTRAINT network_events_pkey PRIMARY KEY (id)
);

-- Create console_errors table
CREATE TABLE public.console_errors (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  error_message text NOT NULL,
  stack_trace text,
  error_type text NOT NULL,
  file_name text,
  line_number integer,
  column_number integer,
  timestamp timestamp with time zone NOT NULL,
  CONSTRAINT console_errors_pkey PRIMARY KEY (id)
);

-- Add indexes for better query performance
CREATE INDEX idx_sessions_device_type ON sessions(device_type);
CREATE INDEX idx_sessions_browser ON sessions(browser);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);
CREATE INDEX idx_user_events_session_id ON user_events(session_id);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);
CREATE INDEX idx_network_events_session_id ON network_events(session_id);
CREATE INDEX idx_network_events_status_code ON network_events(status_code);
CREATE INDEX idx_console_errors_session_id ON console_errors(session_id);
CREATE INDEX idx_console_errors_error_type ON console_errors(error_type);

-- Enable Row Level Security
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE console_errors ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view events for their organization's websites"
ON user_events FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT s.id FROM sessions s
    JOIN websites w ON s.site_id = w.id
    WHERE w.org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view network events for their organization's websites"
ON network_events FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT s.id FROM sessions s
    JOIN websites w ON s.site_id = w.id
    WHERE w.org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view console errors for their organization's websites"
ON console_errors FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT s.id FROM sessions s
    JOIN websites w ON s.site_id = w.id
    WHERE w.org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);