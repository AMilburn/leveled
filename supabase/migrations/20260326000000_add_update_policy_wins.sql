-- Add UPDATE policy for wins table

CREATE POLICY "Users can update own wins" ON wins FOR UPDATE USING (auth.uid() = user_id);
