# PuntMarketApp

[![CI](https://github.com/juanJose251/PuntMarketApp/actions/workflows/ci.yml/badge.svg)](https://github.com/juanJose251/PuntMarketApp/actions/workflows/ci.yml)

Point of sale (POS) web app for a small store. Sellers register sales from a simple POS screen, and the admin manages products, sees the sales history and exports the sales of a day to Excel.

A customized version of this app is used in production by a supermarket. This repository is the public version.

**Demo:** https://puntomarket.netlify.app — click **Entrar como Admin** or **Entrar como Vendedor**. The demo runs entirely in your browser (no server): data is stored in `localStorage` and can be reset from the banner.

<!-- TODO: add screenshots or a GIF of the POS screen and the admin dashboard -->

## Features

- Two roles: **admin** and **seller**, each one with its own layout and routes
- Admin dashboard with totals, today's sales, top 5 products and last sales
- Products CRUD (name, price, stock, category)
- POS screen: cart with stock limits, quantities, payment method
- Atomic sales: the sale, its items and the stock update are saved together or not at all
- Sales history
- Export the sales of a selected day to `.xlsx`

## Architecture

```
Pages → Providers (state) → data adapter ──┬─ localAdapter    (demo: localStorage + seed data)
                                           └─ supabaseAdapter (client version: Supabase / Postgres)
```

The adapter is chosen with `VITE_DATA_MODE`:

| Mode | Used for | Storage |
|---|---|---|
| `local` (default) | public demo | browser `localStorage`, seeded with 20 products and 30 sales |
| `supabase` | real deployment | Supabase (PostgreSQL), sales via the `create_sale` function |

Why: the free Supabase tier pauses a project after a week of inactivity, so a public demo can't depend on it. Both adapters implement the same interface (`products.list/create/update/remove`, `sales.list/create/clear`) and the same rules (stock validation, atomic sale). See [`docs/FLUJO.md`](docs/FLUJO.md).

## Tech stack

- React 19 + Vite, React Router, Tailwind CSS
- Supabase (PostgreSQL) for the real deployment
- Context API for global state, `useReducer` for the cart
- ExcelJS for the export (lazy loaded)
- Vitest + Testing Library, GitHub Actions (tests + build)
- Deployed on Netlify

## Project structure

```
src/
  components/   layouts, protected route, table, demo banner
  data/         adapters (local, supabase), seed data
  pages/        login, admin pages and seller pages
  store/        context providers, cart reducer and hooks
  lib/          supabase client (created lazily)
  utils/        format, dates and Excel export
database/
  schema.sql                     tables and functions
  migrations/001_auth_rls.sql    Supabase Auth + Row Level Security (not applied yet, see below)
docs/           FLUJO.md (how it works) and PREGUNTAS.md (interview Q&A)
```

## Run it locally

Demo mode needs no setup:

```bash
npm install
npm run dev
```

To use Supabase instead:

1. Create a project in [Supabase](https://supabase.com) and run `database/schema.sql` in the SQL Editor
2. Copy `.env.example` to `.env` and set:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Tests

```bash
npm test
```

19 tests: local adapter (CRUD, stock validation, atomic rollback, reset), cart reducer, protected routes, date/format utilities and Excel rows.

## Deploy

`netlify.toml` is included. Demo site: `VITE_DATA_MODE=local` (or unset). Real site: `VITE_DATA_MODE=supabase` plus the two `VITE_SUPABASE_*` variables.

## Security notes

- The login is a **demo login** (name + role, no passwords). That is fine for the local demo; it is not for a real database.
- `database/migrations/001_auth_rls.sql` adds Supabase Auth profiles, Row Level Security, stock validation inside `create_sale`, and admin-only `clear_sales`. It has **not been applied or tested yet**; run it first on a test Supabase project and switch the login to `supabase.auth.signInWithPassword`.
- `.github/workflows/keepalive.yml` pings Supabase every 3 days (needs `SUPABASE_URL` and `SUPABASE_ANON_KEY` repo secrets) so a free project doesn't get paused.
- `npm audit` still reports one moderate advisory from `uuid` inside `exceljs`; it only affects calls that pass a buffer to `uuid`, which this app doesn't do.

## Decisions and problems

<!-- Draft written by Claude Code. Rewrite in your own words after studying docs/FLUJO.md. -->

- **Adapter instead of one Supabase client:** keeps the public demo free and always online, and makes the data layer testable.
- **Local dates:** `toISOString()` returns UTC; in El Salvador (UTC-6) sales after 6 pm showed up on the next day. `toDateKey` uses local time.
- **Replaced `xlsx`:** the npm package has unpatched vulnerabilities, so the export uses ExcelJS.
