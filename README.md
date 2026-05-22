# Jackaroo Tournament Manager

Mobile-friendly tournament app for **league** and **knockout** formats. Data is stored per user in **Supabase** (auth + database).

## Features

- Email sign up / sign in
- Multiple tournaments per account
- League fixtures, live standings, knockout brackets
- Auto-save to cloud
- Screenshot export
- Mobile bottom navigation and slide-out team editor

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql), then [`supabase/saved-teams.sql`](supabase/saved-teams.sql).  
   If you see **permission denied**, run [`supabase/fix-permissions.sql`](supabase/fix-permissions.sql) as well.
3. Under **Authentication → Providers → Email**, enable **Email** and turn **OFF** “Confirm email” so sign-up does not require inbox verification. See [`supabase/AUTH_SETUP.md`](supabase/AUTH_SETUP.md).
4. Copy **Project URL** and **anon public** key from **Settings → API**.

### 2. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy on Vercel

Create React App reads `REACT_APP_*` variables **at build time**, not from `.env.local` on the server (that file is not deployed).

This repo includes [`.env.production`](.env.production) so Vercel builds pick up Supabase automatically. After you push, trigger a **new deployment** (or redeploy from the Vercel dashboard) so the build runs again.

Alternatively, in Vercel → **Project → Settings → Environment Variables**, add:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

Apply to **Production** (and Preview if you use preview URLs), then redeploy.

## App flow

1. **Sign up** or **Sign in**
2. **Dashboard** — create or open a tournament
3. **Teams** — add/rename teams, name your tournament
4. **Mode** — League or Knockout
5. **Game** — enter scores or pick winners (auto-saved)

## Tech stack

- React (Create React App)
- Supabase Auth + PostgreSQL (JSON columns for teams/matches)
- React Router

## Scripts

| Command       | Description        |
|---------------|--------------------|
| `npm start`   | Development server |
| `npm run build` | Production build |
| `npm test`    | Run tests          |
