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

Your weekly schedule is defined declaratively in `src/config/goals.ts` using **ACTIVITY_DISTRIBUTION**. This declares which activities you do, which days, and for how long. The app then automatically expands this into an hourly grid.

### How It Works

1. **Edit `ACTIVITY_DISTRIBUTION`** in `src/config/goals.ts`:
   ```typescript
   export const ACTIVITY_DISTRIBUTION = {
     normal: [
       { activity: "coding", days: ["Mon", "Tue", "Wed", "Fri"], hours: 3 },
       { activity: "system", days: ["Mon", "Fri"], hours: 2 },
       { activity: "workout", days: ["Mon", "Tue", "Fri"], hours: 1 },
       // Add more activities...
     ],
     travel: [ /* reduced week */ ],
     hard: [ /* high-intensity week */ ],
   };
   ```

2. **How schedules are built:**
   - You define activities + days + hours in `ACTIVITY_DISTRIBUTION`
   - `WEEK_TEMPLATES` (in `schedule.ts`) calls `generateWeekTemplate()` to expand those into 15-hour daily grids
   - Time-of-day preferences (morning, afternoon, evening) are applied automatically

3. **Customize time-of-day preferences** in `src/config/schedule.ts`:
   ```typescript
   const preferences: Record<string, number> = {
     workout: TIME_SLOTS.morning,      // 8am
     coding: TIME_SLOTS.morning,       // 8am
     system: TIME_SLOTS.afternoon,     // 1pm
     retrieval: TIME_SLOTS.evening,    // 8pm
   };
   ```

### Available Activities

`coding`, `depth`, `project`, `stories`, `workout`, `applications`, `system`, `networking`, `retrieval`, `review`, `blocked`, `free`. Stretch variants: `stretch-coding`, `stretch-depth`, etc.

### Tips for Customization

- Start with your real-world constraints (meetings, family time, off days)
- Group similar activities on the same day to minimize context switching
- Remember: activities respect time-of-day preferences (e.g., all workouts go in morning slots)
- Each day can hold max 15 hours — the app fills slots sequentially per activity
- Test each week type for 2–3 weeks before tweaking

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
