# Database Schema

All tables include `user_id` for multi-user isolation via Row Level Security (RLS) policies.

## Tables

### weeks
Stores weekly schedule data, mode (normal/travel/hard), activity logs, and reflections.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (auth.users) |
| week_number | int | Unique week identifier |
| week_type | text | 'normal' \| 'travel' \| 'hard' |
| schedule | jsonb | Hourly grid by day (e.g., {Mon: [...], Tue: [...]}) |
| counts | jsonb | Activity counts (e.g., {leetcode: 3, depth: 2}) |
| activity_logs | jsonb | Gamification logs for stat tracking |
| reflection | text | Weekly reflection notes |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### kanban_tasks
Persists across weeks. Status columns: 0=backlog, 1=up next, 2=in progress, 3=done.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (auth.users) |
| title | text | Task name |
| tag | text | Category tag |
| note | text | Optional notes |
| col | int | Status (0-3) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### wins
Logged accomplishments with timestamps.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (auth.users) |
| content | text | Win description |
| created_at | timestamptz | |

## Security

All tables enforce Row Level Security (RLS) policies:
- Users can only read/modify their own data
- Policies check `auth.uid() = user_id` for all operations
- Indexes on `user_id` for query performance

## Migrations

Apply all pending migrations:
```bash
supabase db push
```

Add new migrations to `supabase/migrations/` with format:
```
20260320120000_feature_description.sql
```

**Important:** Never edit existing migrations. If you need to change something, create a new migration.
