-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow updates on sessions
CREATE POLICY "Allow updates on sessions for organization members" ON sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM websites w
    JOIN user_profiles up ON up.org_id = w.org_id
    WHERE w.id = sessions.site_id
    AND up.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM websites w
    JOIN user_profiles up ON up.org_id = w.org_id
    WHERE w.id = sessions.site_id
    AND up.user_id = auth.uid()
  )
);
