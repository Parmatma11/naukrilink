-- ==============================================================================
-- Supabase Seed Data: seed.sql
-- Description: Default categories and initial ticker alerts
-- ==============================================================================

-- Seed Primary Categories
INSERT INTO public.categories (id, name, slug, color_code, order_index) VALUES
(1, 'Results', 'results', '#b91c1c', 1),
(2, 'Admit Card', 'admit-card', '#1e40af', 2),
(3, 'Latest Jobs', 'latest-jobs', '#047857', 3),
(4, 'Answer Key', 'answer-key', '#7c2d12', 4),
(5, 'Syllabus', 'syllabus', '#4c1d95', 5),
(6, 'Admission', 'admission', '#0e7490', 6),
(7, 'Certificate Verification', 'certificate-verification', '#b45309', 7),
(8, 'Important', 'important', '#374151', 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    color_code = EXCLUDED.color_code,
    order_index = EXCLUDED.order_index;

-- Reset sequence to prevent ID conflict
SELECT setval('public.categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.categories));

-- Seed Initial Ticker Alerts
INSERT INTO public.ticker_alerts (text, link, is_active) VALUES
('UPPSC RO / ARO 2026 Online Application Form Released - Apply Online Now', '/category/latest-jobs', true),
('Railway RRB NTPC 10+2 Level CEN 07/2026 Exam Schedule Out', '/category/admit-card', true),
('SSC CGL 2026 Final Answer Key Released - Check Marks & Score Card', '/category/answer-key', true),
('United India Insurance UIIC AO Scale I Result Declared', '/category/results', true)
ON CONFLICT DO NOTHING;
