ALTER TABLE heatmaps 
ADD COLUMN selected_session_ids UUID[] DEFAULT '{}';

-- Add an index to improve query performance when filtering by session IDs
CREATE INDEX idx_heatmaps_selected_session_ids ON heatmaps USING GIN (selected_session_ids);

-- Update the type definition in the database
COMMENT ON COLUMN heatmaps.selected_session_ids IS 'Array of session IDs that match the heatmap filters'; 