-- Add activity_logs column to weeks table for gamification tracking
ALTER TABLE weeks
ADD COLUMN activity_logs JSONB DEFAULT '[]'::jsonb;
