-- First remove the foreign key constraint from user_profiles
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS fk_active_heatmap;

-- Remove the active_heatmap_id column from user_profiles
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS active_heatmap_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_heatmaps_selected_session_ids;
DROP INDEX IF EXISTS idx_heatmaps_snapshot_url;

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view heatmaps for their organization's websites" ON heatmaps;
DROP POLICY IF EXISTS "Users can create heatmaps for their organization's websites" ON heatmaps;
DROP POLICY IF EXISTS "Users can access snapshot URLs for their organization's heatmaps" ON heatmaps;

-- Finally drop the heatmaps table
DROP TABLE IF EXISTS heatmaps;  