-- Add org_id column to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN org_id UUID REFERENCES organizations(id);

-- Create index for better query performance
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);

-- Update existing subscriptions with org_id from user_profiles
UPDATE subscriptions s
SET org_id = (
  SELECT org_id 
  FROM user_profiles up 
  WHERE up.user_id = s.user_id 
  LIMIT 1
)
WHERE s.org_id IS NULL;

-- Add NOT NULL constraint after populating existing records
ALTER TABLE subscriptions
ALTER COLUMN org_id SET NOT NULL;

-- Update RLS policies to include org_id check
DROP POLICY IF EXISTS "Allow users to read own subscriptions" ON subscriptions;

CREATE POLICY "Allow users to read organization subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id 
      FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  ); 