-- Add is_played column to sessions table
ALTER TABLE sessions
ADD COLUMN is_played boolean DEFAULT false;

-- Add an index to improve query performance
CREATE INDEX idx_sessions_is_played ON sessions(is_played);

-- Enable RLS on the new column (maintaining existing security)
COMMENT ON COLUMN sessions.is_played IS 'Indicates whether the session recording has been played by a user'; 