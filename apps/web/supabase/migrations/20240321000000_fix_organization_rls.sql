-- Disable RLS temporarily to modify policies
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view organizations" ON organizations;
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;


-- Create new policies
CREATE POLICY "Users can view organizations"
ON organizations FOR SELECT
TO authenticated
USING (
  -- Allow viewing if user is the one who just created the org (during onboarding)
  id IN (
    SELECT org_id 
    FROM user_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert organizations"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
