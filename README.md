# Leveled

A job search and interview prep tracker for senior engineers.

## Features

- **Weekly schedule** with core/stretch blocks and week types (normal, travel, hard)
- **Kanban board** for prep tasks (backlog → done)
- **Progress tracker** with weekly counts and reflections
- **Wins journal** to log every win
- **Customizable templates** for your own schedule

## Stack

- Vite for local development
- Vanilla JS (no framework dependencies)
- localStorage for data persistence
- Supabase (Postgres) for optional backend
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

- **Week schedules, kanban cards, and wins** are saved to browser localStorage
- Changes are saved automatically when you click an activity type
- Data is **per-origin**: local dev and production builds have separate storage
- Changing `src/config.js` only affects available templates, not saved data

## Setup with Supabase (Optional)

For backend persistence:

1. Set up your own Supabase project (see db/README.md)
2. Configure environment variables in `.env`
3. Run migrations in Supabase SQL editor

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
   - Add environment variables:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Deploy** - Cloudflare will auto-deploy on every push to main

That's it! Your app is live.

## Backend (Optional - Supabase)

For multi-device sync, see `db/README.md` for Supabase setup. Currently the app uses browser localStorage.
