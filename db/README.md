# Database Schema

## Tables

- **weeks** - Weekly schedules, mode, progress counts, reflections
- **kanban_tasks** - Kanban cards with status (backlog/up next/in progress/done)
- **wins** - Logged accomplishments with timestamps

All tables have `user_id` for Row Level Security isolation.

## Migrations

Apply migrations:
```bash
supabase db push
```

Add new migrations to `supabase/migrations/` with timestamp format:
```
20260320000000_add_new_feature.sql
```

Never edit existing migrations.
