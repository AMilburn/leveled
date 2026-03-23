# 📈 Leveled

> **Plan. Track. Level Up.**

Leveled is a personal weekly planner and progress tracker designed specifically for developers. It transforms your professional growth into a gamified progression system. Stop guessing your progress, start leveling your career.

<div align="center">
  <img src="/src/assets/leveled-schedule.png" width="75%" />
</div>

---

## 🚀 Key Features

- **Smart Weekly Schedule** — Define core and stretch targets. The app auto-generates your 15-hour daily grids based on your personal preferences.
- **The Engineer Tier System** — Earn XP across four core competencies to move from Junior to Staff Engineer.
- **Dual-Mode Storage** — Use it instantly with `localStorage` or sync across devices with Supabase.
- **Integrated Kanban** — Move tasks from backlog to done.
- **Wins Journal** — A dedicated space to log small victories and combat imposter syndrome.

---

## 📊 The Engineer Tier System

Your growth is tracked across four core competencies, each mapping to real-world engineering impact:

| Stat    | Competency   | Activities                                              |
| ------- | ------------ | ------------------------------------------------------- |
| **INT** | Intelligence | LeetCode, Pattern Recognition, Mock Technical Interview |
| **WIS** | Wisdom       | System Design, Deep Dive, Research Trade-offs           |
| **DEX** | Dexterity    | Implementation, Bug Fixes, PRs, DevOps, Refactoring     |
| **CHA** | Charisma     | Submit application, Develop STAR Stories, Networking    |

> **Note:** Your overall Engineer Tier (Junior → Mid → Senior → Staff) is calculated based on cumulative XP across all four stats.

<div align="center">
  <img src="/src/assets/leveled-stats.png" width="75%" />
</div>

---

## 🛠️ Tech Stack

| Layer                          | Technology                 |
| ------------------------------ | -------------------------- |
| Frontend                       | React 18, TypeScript, Vite |
| Storage (local, offline-first) | `localStorage`             |
| Backend (optional)             | Supabase (Auth + Postgres) |
| Deployment                     | Cloudflare Pages           |

---

## ⚡ Quick Start

### Option 1: Local-Only (Zero Config)

Data is saved locally to your browser.

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Option 2: Cloud Sync (Supabase)

1. **Supabase Setup** — Create a project at [supabase.com](https://supabase.com) using your **GitHub account email**. In your dashboard, go to **Authentication → Providers → GitHub**, create an OAuth app at [github.com/settings/developers](https://github.com/settings/developers), and copy the Client ID and Secret into Supabase.

2. **Environment** — Copy `.env.example` to `.env`:

```bash
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_ALLOWED_USER_EMAIL=your_github_email@example.com
```

⚠️ `VITE_ALLOWED_USER_EMAIL` must match your GitHub email exactly.

3. **Database** — Link and push migrations:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

---

## ⚙️ Customizing Your Schedule

Schedules are defined declaratively in `src/config/`. The app uses a **Distribution → Preference → Grid** pipeline.

### 1. Define Activities

Edit `src/config/goals.ts`. You can create different modes (e.g., `normal`, `travel`, `hard`):

```typescript
export const ACTIVITY_DISTRIBUTION = {
  normal: [
    { activity: "coding", days: ["Mon", "Tue", "Wed", "Fri"], hours: 3 },
    { activity: "system", days: ["Mon", "Fri"], hours: 2 },
  ],
};
```

> Group similar activities on the same day to minimize context switching.

### 2. Set Time Preferences

Control when activities appear in your grid in `src/config/schedule.ts`:

```typescript
const preferences: Record<string, number> = {
  coding: TIME_SLOTS.morning, // Starts at 8am
  system: TIME_SLOTS.afternoon, // Starts at 1pm
};
```

---

## 🌐 Deployment

1. **Build:** `npm run build`
2. **Platform:** Connect your GitHub repo to Cloudflare Pages.
3. **Build Settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment Variables:** Add your `VITE_` keys in the Cloudflare Pages settings if using Supabase.

See `supabase/README.md` for database schema and migration details.
