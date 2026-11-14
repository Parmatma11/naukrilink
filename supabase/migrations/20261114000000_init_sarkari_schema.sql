-- ==============================================================================
-- Supabase Migration: 20261114000000_init_sarkari_schema.sql
-- Description: Core Schema for Sarkari Portal (Categories, Jobs, Ticker Alerts)
-- ==============================================================================

-- 1. Enable Useful Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color_code VARCHAR(50) DEFAULT '#b91c1c',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Jobs / Notices Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    department TEXT,
    post_name TEXT,
    total_posts TEXT,
    post_date TEXT,
    short_info TEXT,
    important_dates JSONB DEFAULT '{}'::jsonb,
    application_fee JSONB DEFAULT '{}'::jsonb,
    age_limit JSONB DEFAULT '{}'::jsonb,
    vacancy_details JSONB DEFAULT '[]'::jsonb,
    important_links JSONB DEFAULT '{}'::jsonb,
    source_url TEXT UNIQUE NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Ticker Alerts Table (Top Breaking News Bar)
CREATE TABLE IF NOT EXISTS public.ticker_alerts (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_source_url ON public.jobs(source_url);

-- PostgreSQL Full-Text Search Index (Blazing fast multi-word keyword search)
CREATE INDEX IF NOT EXISTS idx_jobs_search ON public.jobs USING gin(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(department, '') || ' ' || COALESCE(short_info, ''))
);

-- 6. Trigger for Automatic updated_at Timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.jobs;
CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Supabase Row Level Security (RLS) Configuration
-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticker_alerts ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access (Anon and Authenticated users can view jobs)
DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on jobs" ON public.jobs;
CREATE POLICY "Allow public read on jobs"
    ON public.jobs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on ticker_alerts" ON public.ticker_alerts;
CREATE POLICY "Allow public read on ticker_alerts"
    ON public.ticker_alerts FOR SELECT
    USING (true);

-- Allow Service Role / Postgres Admin Full Access for Scrapers and Admin Ops
DROP POLICY IF EXISTS "Allow service role full access on categories" ON public.categories;
CREATE POLICY "Allow service role full access on categories"
    ON public.categories FOR ALL
    USING (auth.role() = 'service_role' OR current_user = 'postgres');

DROP POLICY IF EXISTS "Allow service role full access on jobs" ON public.jobs;
CREATE POLICY "Allow service role full access on jobs"
    ON public.jobs FOR ALL
    USING (auth.role() = 'service_role' OR current_user = 'postgres');

DROP POLICY IF EXISTS "Allow service role full access on ticker_alerts" ON public.ticker_alerts;
CREATE POLICY "Allow service role full access on ticker_alerts"
    ON public.ticker_alerts FOR ALL
    USING (auth.role() = 'service_role' OR current_user = 'postgres');
