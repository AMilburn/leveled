# Supabase Setup for Leveled

## Initialize Supabase

1. Create a Supabase project at https://app.supabase.com
2. Install Supabase CLI: `npm install -g supabase`
3. Create `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Run Migrations

```bash
supabase db push
```

This applies all migrations in `supabase/migrations/` to your database.

## Schema

Three tables:
- **weeks** - Weekly schedules, mode, progress counts, reflections
- **kanban_tasks** - Kanban cards with status (backlog/up next/in progress/done)
- **wins** - Logged accomplishments

## Future Changes

New migrations go in `supabase/migrations/` with timestamp format:
```
20260320000000_add_new_feature.sql
```

Never edit existing migrations.
