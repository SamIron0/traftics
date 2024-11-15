ALTER TABLE user_profiles
ADD COLUMN active_project_id UUID REFERENCES websites(id);

-- Add a foreign key constraint
ALTER TABLE user_profiles
ADD CONSTRAINT fk_active_project
FOREIGN KEY (active_project_id)
REFERENCES websites(id)
ON DELETE SET NULL; 