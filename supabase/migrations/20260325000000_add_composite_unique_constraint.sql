-- Add composite unique constraint for user-scoped weeks
-- Enables future multi-user support while maintaining data integrity

ALTER TABLE weeks DROP CONSTRAINT IF EXISTS weeks_week_number_key;
ALTER TABLE weeks ADD CONSTRAINT unique_user_week UNIQUE(user_id, week_number);