-- Initial schema with authentication and user isolation
-- Adds RLS policies requiring authentication and user_id ownership

-- Add user_id to track data ownership
ALTER TABLE weeks ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE kanban_tasks ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE wins ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for faster queries
CREATE INDEX idx_weeks_user_id ON weeks(user_id);
CREATE INDEX idx_kanban_tasks_user_id ON kanban_tasks(user_id);
CREATE INDEX idx_wins_user_id ON wins(user_id);

-- RLS Policies for weeks table - users can only see/modify their own data
CREATE POLICY "Users can read own weeks" ON weeks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weeks" ON weeks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weeks" ON weeks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weeks" ON weeks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for kanban_tasks table
CREATE POLICY "Users can read own tasks" ON kanban_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON kanban_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON kanban_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON kanban_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wins table
CREATE POLICY "Users can read own wins" ON wins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wins" ON wins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wins" ON wins FOR DELETE USING (auth.uid() = user_id);
