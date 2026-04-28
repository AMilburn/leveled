-- Migrate weeks table to store the full Week object as a single jsonb column.
-- This eliminates field-mapping drift: new fields added to the app type are
-- automatically persisted without requiring changes to the sync layer or schema.

ALTER TABLE weeks ADD COLUMN IF NOT EXISTS data jsonb;

UPDATE weeks
SET data = jsonb_build_object(
  'mode',         week_type,
  'slots',        schedule,
  'counts',       COALESCE(counts, '{}'),
  'reflection',   COALESCE(reflection, ''),
  'activityLogs', COALESCE(activity_logs, '[]'),
  'slotNotes',    '{}'::jsonb
)
WHERE data IS NULL;

ALTER TABLE weeks ALTER COLUMN data SET NOT NULL;
ALTER TABLE weeks ALTER COLUMN data SET DEFAULT '{}';
