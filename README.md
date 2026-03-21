# Leveled

A personal tracker for developers who are building toward something. Weekly scheduling, goal tracking, and visualised progress. For developers who work better with a plan. Small wins compound. Start tracking them.

## Features

- **Weekly schedule** with core and stretch targets across every area of your practice
- **Kanban board** to move tasks from backlog to done
- **Progress tracker** with weekly and cumulative counts, plus space to reflect
- **Wins journal** to capture every small victory
- **Customisable templates** for your own goals and routine

## Stack

- React 18 + TypeScript + Vite
- Supabase Auth (GitHub OAuth or email/password)
- Supabase Postgres database
- Cloudflare Pages deployment

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5174. Data auto-saves to localStorage.

## Setup

1. **Create your own Supabase project** at https://supabase.com

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

Edit `src/config.ts` to customize weekly templates:

```typescript
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

See `supabase/README.md` for database schema and migration details.
