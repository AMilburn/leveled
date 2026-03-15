-- Leveled: Supabase migration for job prep tracker
-- Users must run this in their own Supabase instance

-- Table: weeks
CREATE TABLE weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_date date NOT NULL,
  week_type text NOT NULL CHECK (week_type IN ('normal', 'travel', 'hard')),
  created_at timestamptz DEFAULT now()
);

-- Table: schedule_blocks
CREATE TABLE schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid REFERENCES weeks(id) ON DELETE CASCADE,
  block_type text NOT NULL CHECK (block_type IN ('core', 'stretch')),
  label text NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL
);

-- Table: kanban_tasks
CREATE TABLE kanban_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: progress
CREATE TABLE progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid REFERENCES weeks(id) ON DELETE CASCADE,
  applications_sent int DEFAULT 0,
  interviews int DEFAULT 0,
  offers int DEFAULT 0,
  reflection text,
  created_at timestamptz DEFAULT now()
);

-- Table: wins
CREATE TABLE wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_id uuid REFERENCES weeks(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
