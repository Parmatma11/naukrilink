# Supabase Migrations & Schema

This folder contains standard Supabase migration scripts for version-controlled database schema management.

## Folder Structure

```
supabase/
├── migrations/
│   └── 20261114000000_init_sarkari_schema.sql  # Core DDL, indexes, triggers, and RLS policies
├── seed.sql                                     # Default category and alert seed data
└── README.md
```

## Features Included in the Migration

1. **Tables**:
   - `categories`: Exam and notice categories with display orders and theme colors.
   - `jobs`: Full recruitment post schema (JSONB fields for dates, fees, age limits, vacancy tables, and direct links).
   - `ticker_alerts`: Breaking announcement marquee ticker.

2. **Indexes & Search**:
   - High-speed B-Tree indexes on `category_id`, `slug`, `source_url`, and `created_at`.
   - **PostgreSQL Full-Text Search (FTS)** GIN index using `to_tsvector` across titles, departments, and short summaries.

3. **Row Level Security (RLS)**:
   - Public `SELECT` policies enabled so client SDKs / Next.js can read freely.
   - Admin / `service_role` write policies for scraper workers and administration.

4. **Triggers**:
   - Automated `handle_updated_at()` trigger that updates `updated_at` timestamps on row updates.

## CLI Usage (Optional)

If you use the Supabase CLI:

```bash
# Link to your Supabase project
npx supabase link --project-ref qvwajcdxqqppzzxiktzx

# Push new migrations
npx supabase db push

# Apply seed data
npx supabase db reset
```
