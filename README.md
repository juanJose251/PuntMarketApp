# PuntMarketApp

Point of sale (POS) web app for a small store. Sellers register sales from a simple POS screen, and the admin manages products, sees the sales history and exports the sales of a day to Excel.

I built it with React and Supabase to practice a real CRUD with a database instead of localStorage.

**Demo:** _coming soon_

## Features

- Two roles: **admin** and **seller**, each one with its own layout and routes
- Admin dashboard with totals, today's sales, top 5 products and last sales
- Products CRUD (name, price, stock, category)
- POS screen: add products to the cart, change quantities, choose payment method
- Sales are saved with a Postgres function (`create_sale`) that inserts the sale, its items and updates the stock in one transaction
- Sales history
- Export the sales of a selected day to `.xlsx`

## Tech stack

- React 19 + Vite
- React Router
- Tailwind CSS
- Supabase (PostgreSQL)
- SheetJS (xlsx) for the Excel export
- Context API for global state (auth, products, sales)
- Deployed on Netlify

## Project structure

```
src/
  components/   layouts, protected route, table
  pages/        login, admin pages and seller pages
  store/        context providers and hooks (auth, products, sales)
  lib/          supabase client
  utils/        format, dates and Excel export
database/
  schema.sql    tables, functions and sample products
```

## Run it locally

1. Create a free project in [Supabase](https://supabase.com)
2. Open the SQL Editor and run `database/schema.sql`
3. Copy `.env.example` to `.env` and add your project URL and anon key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Install and run:

```bash
npm install
npm run dev
```

## Deploy

The repo has a `netlify.toml`, so Netlify only needs the two `VITE_SUPABASE_*` environment variables.

## Notes

- The login is a **demo login**: you type your name and pick a role. There are no passwords yet, so it is not meant for real use.
- Next steps I want to add: Supabase Auth with real users, Row Level Security policies per role, and a stock check before saving a sale.
