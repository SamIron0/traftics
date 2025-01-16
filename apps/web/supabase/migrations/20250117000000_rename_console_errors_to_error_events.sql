-- Rename the table
ALTER TABLE console_errors RENAME TO error_events;

-- Rename the primary key constraint
ALTER TABLE error_events 
RENAME CONSTRAINT console_errors_pkey TO error_events_pkey;

-- Rename the foreign key constraint
ALTER TABLE error_events
RENAME CONSTRAINT console_errors_session_id_fkey TO error_events_session_id_fkey;

-- Rename the indexes
ALTER INDEX idx_console_errors_session_id RENAME TO idx_error_events_session_id;
ALTER INDEX idx_console_errors_error_type RENAME TO idx_error_events_error_type;

-- Drop old policy
DROP POLICY IF EXISTS "Users can view console errors for their organization's websites" ON error_events;

-- Create new policy with updated name
CREATE POLICY "Users can view error events for their organization's websites"
ON error_events FOR SELECT
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