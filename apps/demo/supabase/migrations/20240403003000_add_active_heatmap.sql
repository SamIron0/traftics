ALTER TABLE user_profiles
ADD COLUMN active_heatmap_id UUID REFERENCES heatmaps(id) ON DELETE SET NULL;

-- Add a foreign key constraint
ALTER TABLE user_profiles
ADD CONSTRAINT fk_active_heatmap
FOREIGN KEY (active_heatmap_id)
REFERENCES heatmaps(id)
ON DELETE SET NULL; 