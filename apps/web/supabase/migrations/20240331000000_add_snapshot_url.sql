ALTER TABLE heatmaps
ADD COLUMN snapshot_url TEXT;

-- Add an index to improve query performance
CREATE INDEX idx_heatmaps_snapshot_url ON heatmaps (snapshot_url);

-- Update the type definition in the database
COMMENT ON COLUMN heatmaps.snapshot_url IS 'URL of the stored snapshot image for the heatmap';

-- Add RLS policy for accessing snapshot URLs
CREATE POLICY "Users can access snapshot URLs for their organization's heatmaps"
ON heatmaps FOR SELECT
TO authenticated
USING (
  website_id IN (
    SELECT id FROM websites 
    WHERE org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
); 