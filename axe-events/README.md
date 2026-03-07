# AXÉ Events — Capoeira Calendar

Find capoeira events near you — rodas, workshops, batizados, and festivals worldwide.

## Features

- **Public event calendar** with monthly view and color-coded event types
- **Search & filter** by city, country, event type, and date
- **RSVP** to events (going / interested)
- **Submit events** for community review
- **Admin dashboard** with moderation queue, stats, and featured events
- **i18n** — English, Portuguese, German, French
- **PWA** — installable, works offline
- **Privacy-first** — no tracking, no ads, no third-party analytics

## Tech Stack

- React 19 + Vite
- Supabase (Auth, PostgreSQL, Row Level Security)
- react-i18next
- Deployed on Vercel

## Getting Started

### 1. Clone and install

```bash
cd axe-events
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env` in this folder:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Go to **SQL Editor** in Supabase and run the migration:

```bash
# Paste the contents of supabase/migrations/001_initial.sql
```

5. To make yourself admin:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel dashboard.

## Event Types

| Type | Color |
|------|-------|
| Roda | Orange |
| Workshop | Teal |
| Batizado | Purple |
| Festival | Gold |
| Other | Muted |

## Project Structure

```
axe-events/
├── src/
│   ├── components/    # Layout, CalendarView, EventCard, LoginModal, InstallPrompt
│   ├── context/       # AuthContext (Supabase auth)
│   ├── i18n/          # i18next config + EN/PT/DE/FR translations
│   ├── lib/           # Supabase client
│   └── pages/         # Home, EventDetail, SubmitEvent, MyEvents, Admin, Privacy
├── supabase/
│   └── migrations/    # PostgreSQL schema + RLS policies
├── public/            # PWA manifest, service worker, icons
└── vercel.json        # SPA routing
```

## License

MIT
