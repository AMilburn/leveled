-- Leveled: Initial schema
-- Single-user per Supabase instance
-- Run this in Supabase SQL Editor or via `supabase db push`

-- Table: weeks
-- Stores weekly data: schedule, mode, progress counts, reflection notes
CREATE TABLE weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL UNIQUE,
  week_type text NOT NULL CHECK (week_type IN ('normal', 'travel', 'hard')),
  schedule jsonb NOT NULL, -- {Mon: [...], Tue: [...], ...}
  counts jsonb DEFAULT '{}', -- {leetcode: 3, depth: 2, ...}
  reflection text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: kanban_tasks
-- Stores all kanban cards (persist across weeks)
CREATE TABLE kanban_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tag text NOT NULL,
  note text DEFAULT '',
  col int NOT NULL CHECK (col BETWEEN 0 AND 3), -- 0=backlog, 1=up next, 2=in progress, 3=done
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: wins
-- Stores all logged wins
CREATE TABLE wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
