# Leveled

A personal productivity app for developers. Schedule your week, set goals, track skills, and gamify the grind of self-improvement.

## Features

- **Weekly schedule** with core/stretch blocks and week types (normal, travel, hard)
- **Kanban board** for prep tasks (backlog → done)
- **Progress tracker** with weekly counts and reflections
- **Wins journal** to log every win
- **Customizable templates** for your own schedule

## Stack

- React 18 + Vite
- Supabase Auth (GitHub OAuth or email/password)
- Supabase Postgres
- Cloudflare Pages

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5174. Data auto-saves to localStorage.

## Setup

1. **Create Supabase project** at https://supabase.com

2. **Configure authentication:**
   - **GitHub OAuth (optional):** Create OAuth App at https://github.com/settings/developers, add credentials to Supabase Authentication → Providers → GitHub
   - **Email/password:** Enabled by default in Supabase

3. **Set environment variables:**

   ```bash
   cp .env.example .env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   VITE_ALLOWED_USER_EMAIL=your-email@example.com
   ```

   Only this email can access the app.

4. **Run migrations:**
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## Customizing Your Schedule

Edit `src/config.js` to customize weekly templates:

```javascript
export const WEEK_TEMPLATES = {
  normal: {
    Mon: ['workout', 'coding', 'depth', ...],
  },
}
```

**Activity types:** `coding`, `depth`, `project`, `stories`, `workout`, `applications`, `system-design`, `networking`, `retrieval`, `review`, `blocked`, `free`, plus `stretch-*` variants.

## Deployment

1. Build: `npm run build`
2. Create Cloudflare Pages project connected to your GitHub repo
3. Set build command: `npm run build`, output directory: `dist`
4. Add environment variables in Pages settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_ALLOWED_USER_EMAIL`
5. Deploy on push to main

See `db/README.md` for database schema and migration details.
