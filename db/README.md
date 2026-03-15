# Supabase Setup for Leveled

1. Create a new Supabase project at https://app.supabase.com
2. Run the migration.sql file in the SQL editor to create the required tables
3. Get your Supabase URL and anon/public API key from your project settings
4. Create a `.env` file in the project root (copy from `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. (Optional) Set up Row Level Security (RLS) for privacy
6. Done! Your app is ready to connect to your Supabase instance

**Note:** Never commit `.env` to git—it's in `.gitignore` for security.
