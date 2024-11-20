-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow listing sessions" ON storage.objects;
DROP POLICY IF EXISTS "Allow reading sessions" ON storage.objects;
DROP POLICY IF EXISTS "Allow writing sessions" ON storage.objects;

-- Create policy for listing objects in sessions bucket
CREATE POLICY "Allow listing sessions"
ON storage.objects FOR SELECT
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

-- Create policy for reading session objects
CREATE POLICY "Allow reading sessions"
ON storage.objects FOR SELECT
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

-- Create policy for writing session objects
CREATE POLICY "Allow writing sessions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
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