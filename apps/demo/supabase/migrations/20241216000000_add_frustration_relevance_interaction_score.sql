-- Add scoring columns to sessions table
ALTER TABLE sessions
ADD COLUMN frustration_score INT DEFAULT NULL,
ADD COLUMN engagement_score INT DEFAULT NULL,
ADD COLUMN relevance_score INT DEFAULT NULL;