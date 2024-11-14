ALTER TABLE websites
ADD COLUMN tracking_id UUID NOT NULL DEFAULT uuid_generate_v4();

-- Add a unique constraint to ensure tracking_id is unique
ALTER TABLE websites
ADD CONSTRAINT websites_tracking_id_key UNIQUE (tracking_id);

-- Update existing records with new UUIDs
UPDATE websites 
SET tracking_id = uuid_generate_v4() 
WHERE tracking_id IS NULL; 
