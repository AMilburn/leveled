# Leveled

A personal productivity app for developers. Schedule your week, set goals, track skills, and gamify the grind of self-improvement.

## Features

- **Weekly schedule** with core/stretch blocks and week types (normal, travel, hard)
- **Kanban board** for prep tasks (backlog → done)
- **Progress tracker** with weekly counts and reflections
- **Wins journal** to log every win
- **Customizable templates** for your own schedule

## Stack

- React 18 + Vite for development
- Supabase Auth (GitHub OAuth or email/password)
- Supabase Postgres for data persistence
- localStorage as fallback
- Cloudflare Pages for hosting

## Quick Start

```bash
npm install
npm run dev
```

Browser will open to http://localhost:5174. Data is auto-saved to localStorage.

## Customizing Your Schedule Templates

Edit `src/config.js` to customize your weekly schedule templates:

```javascript
export const WEEK_TEMPLATES = {
  normal: {
    Mon: ['workout', 'depth', 'coding', ...],
    // ... rest of week
  },
  // Add your own modes here
}
```

**Available activity types:**

- `coding`, `depth`, `project`, `stories`, `workout`, `flex`, `review`
- `stretch-*` (dotted goals) - same types with `stretch-` prefix
- `blocked` (unavailable slots)
- `free` (empty)

Each day has 14 time slots (8am-9pm). Copy `src/config.default.js` as a reference.

## Data Persistence

- **Production:** Data syncs to Supabase (Postgres) automatically
- **Local dev:** Data saved to browser localStorage (for testing)
- **Offline:** If connection drops, data saves to localStorage and syncs when back online
- **Multi-device:** All your data syncs across devices (same Supabase project)
- Changes are saved automatically

## Authentication & Setup

This app requires Supabase for authentication and data persistence. Every user needs their own Supabase project.

### For Original Developer (you):

1. **Create Supabase project** at https://supabase.com
2. **Enable GitHub OAuth** (optional, recommended):
   - Create a GitHub OAuth App: https://github.com/settings/developers → New OAuth App
   - Copy the Client ID and Client Secret
   - In Supabase, go to Authentication → Providers → GitHub
   - Paste your Client ID and Client Secret
   - Set the Authorization callback URL to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   VITE_ALLOWED_USER_EMAIL=your-email@example.com
   ```
   Only this email address can access the app.
4. **Run migrations:**
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

### For Forkers:

If you fork this repo, you'll need your own Supabase project. Only YOUR configured email can access the app.

1. **Create your own Supabase project** at https://supabase.com
2. **Set up authentication** (choose one or both):
   - **GitHub OAuth:**
     - Create a GitHub OAuth App: https://github.com/settings/developers → New OAuth App
     - Copy the Client ID and Client Secret
     - In Supabase, go to Authentication → Providers → GitHub and paste the credentials
     - Set Authorization callback URL to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - **Email/password:** Enabled by default. You'll sign up through the app's login form with your email.
3. **Copy `.env.example` to `.env`** and fill in:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   VITE_ALLOWED_USER_EMAIL=your-email@example.com
   ```
   **Important:** The `VITE_ALLOWED_USER_EMAIL` must match the email you authenticate with in Supabase. Only that email address can access the app.
4. **Run migrations:**
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
5. **Deploy to Cloudflare Pages** with your own credentials
6. Add the same environment variables to Cloudflare Pages settings

Your data is private to your Supabase project — only you can access it.

## Deployment to Cloudflare Pages

1. **Build your app:**

   ```bash
   npm run build
   ```

2. **Create Cloudflare account** (free tier available at https://dash.cloudflare.com/)

3. **Create a new Pages project:**
   - Go to Pages → Create project
   - Connect your GitHub repo (fork this repo first)
   - Build settings:
     - Framework: None
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Add **environment variables** (Settings → Environment variables):
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key (starts with `sb_publishable_`)
     - These must be set for authentication and data sync to work

4. **Deploy** - Cloudflare will auto-deploy on every push to main

That's it! Your app is live.

## Database Schema

See `db/README.md` for the Supabase schema and migration guide.

The app stores:

- **weeks** - Weekly schedules, mode, progress counts, reflections
- **kanban_tasks** - Kanban cards with status (backlog/up next/in progress/done)
- **wins** - Logged accomplishments with timestamps
