ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;

-- Update existing records
UPDATE user_profiles SET setup_completed = FALSE WHERE setup_completed IS NULL; 