-- Drop the individual week columns now that all data lives in the jsonb `data` column.
-- The backfill in the previous migration copied all values into `data` before this runs.

ALTER TABLE weeks
  DROP COLUMN IF EXISTS week_type,
  DROP COLUMN IF EXISTS schedule,
  DROP COLUMN IF EXISTS counts,
  DROP COLUMN IF EXISTS reflection,
  DROP COLUMN IF EXISTS activity_logs,
  DROP COLUMN IF EXISTS slot_notes;
