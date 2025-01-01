CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view dashboards for their organization's websites"
ON dashboards FOR SELECT
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

CREATE POLICY "Users can create dashboards for their organization's websites"
ON dashboards FOR INSERT
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