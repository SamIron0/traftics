-- Create screenshots table
CREATE TABLE screenshots (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  site_id uuid REFERENCES websites(id) ON DELETE CASCADE,
  image_url text,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add indexes
CREATE INDEX idx_screenshots_session_id ON screenshots(session_id);
CREATE INDEX idx_screenshots_site_id ON screenshots(site_id);
CREATE INDEX idx_screenshots_status ON screenshots(status);

-- Add RLS policies
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- Policy for selecting screenshots
CREATE POLICY "Users can view screenshots for their organization's websites"
ON screenshots FOR SELECT
TO authenticated
USING (
  site_id IN (
    SELECT id FROM websites 
    WHERE org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy for inserting screenshots (service role only)
CREATE POLICY "Service role can insert screenshots"
ON screenshots FOR INSERT
TO service_role
WITH CHECK (true);

-- Add storage bucket and policies for screenshots
INSERT INTO storage.buckets (id, name)
VALUES ('screenshots', 'screenshots')
ON CONFLICT DO NOTHING;

-- Storage policies for screenshots bucket
CREATE POLICY "Allow reading screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots' 
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

CREATE POLICY "Service role can write screenshots"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'screenshots');
