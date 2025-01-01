CREATE TABLE heatmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  url_protocol VARCHAR(10) NOT NULL,
  url_domain TEXT NOT NULL,
  url_match_type VARCHAR(20) NOT NULL,
  precision INTEGER NOT NULL,
  use_history_data BOOLEAN NOT NULL DEFAULT false,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE heatmaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view heatmaps for their organization's websites"
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

CREATE POLICY "Users can create heatmaps for their organization's websites"
ON heatmaps FOR INSERT
TO authenticated
WITH CHECK (
  website_id IN (
    SELECT id FROM websites 
    WHERE org_id IN (
      SELECT org_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);