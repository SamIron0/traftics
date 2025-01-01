-- Remove screenshot columns
ALTER TABLE sessions
DROP COLUMN has_screenshot;

-- Add location column
ALTER TABLE sessions
ADD COLUMN location VARCHAR(2);

-- Add index for faster location-based queries
CREATE INDEX sessions_location_idx ON sessions(location); 