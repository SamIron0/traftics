-- Drop existing delete policies if any
DROP POLICY IF EXISTS "Allow deleting sessions" ON storage.objects;
DROP POLICY IF EXISTS "Allow deleting sessions" ON sessions;
DROP POLICY IF EXISTS "Allow deleting page events" ON page_events;

-- Add DELETE policy for storage bucket
CREATE POLICY "Allow deleting sessions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'sessions' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM websites 
    WHERE org_id IN (
      SELECT org_id 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Add DELETE policy for sessions table
CREATE POLICY "Allow deleting sessions"
ON sessions FOR DELETE 
TO authenticated
USING (
  site_id IN (
    SELECT id 
    FROM websites 
    WHERE org_id IN (
      SELECT org_id 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Add DELETE policy for page_events table (cascade delete)
CREATE POLICY "Allow deleting page events"
ON page_events FOR DELETE 
TO authenticated
USING (
  session_id IN (
    SELECT s.id 
    FROM sessions s
    JOIN websites w ON s.site_id = w.id
    WHERE w.org_id IN (
      SELECT org_id 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);
