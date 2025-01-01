ALTER TABLE websites
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- Update existing records
UPDATE websites 
SET verified = FALSE 
WHERE verified IS NULL;

-- Add NOT NULL constraint after setting default values
ALTER TABLE websites
ALTER COLUMN verified SET NOT NULL; 