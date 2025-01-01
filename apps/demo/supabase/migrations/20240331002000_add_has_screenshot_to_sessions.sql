-- Add has_screenshot column to sessions table
ALTER TABLE sessions
ADD COLUMN has_screenshot boolean DEFAULT false;

-- Update existing sessions to have has_screenshot = true if they have an entry in screenshots table
UPDATE sessions
SET has_screenshot = true
WHERE id IN (
  SELECT session_id 
  FROM screenshots 
  WHERE status = 'completed'
);

-- Add an index to improve query performance
CREATE INDEX idx_sessions_has_screenshot ON sessions(has_screenshot);