-- ==========================================================
-- TCS NQT Study Tracker — Supabase Schema & Initial Data
-- Run this script in the Supabase SQL Editor (Dashboard > SQL)
-- ==========================================================

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    planned_duration TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DSA Progress Table
CREATE TABLE IF NOT EXISTS public.dsa_progress (
    id BIGSERIAL PRIMARY KEY,
    total_hours DOUBLE PRECISION NOT NULL DEFAULT 110.0,
    completed_hours DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subject Progress Table
CREATE TABLE IF NOT EXISTS public.subject_progress (
    id BIGSERIAL PRIMARY KEY,
    subject TEXT NOT NULL UNIQUE,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Daily Schedule Items Table
CREATE TABLE IF NOT EXISTS public.schedule_items (
    id BIGSERIAL PRIMARY KEY,
    time_slot TEXT NOT NULL,
    activity TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & allow all operations for anon public access
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on dsa_progress" ON public.dsa_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on subject_progress" ON public.subject_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on schedule_items" ON public.schedule_items FOR ALL USING (true) WITH CHECK (true);

-- Seed Default DSA Target (110 hours)
INSERT INTO public.dsa_progress (id, total_hours, completed_hours)
VALUES (1, 110.0, 0.0)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Subjects
INSERT INTO public.subject_progress (subject, progress_percentage)
VALUES 
    ('DSA / Striver', 0),
    ('TCS NQT Aptitude', 0),
    ('Coding Practice', 0),
    ('Development', 0),
    ('Communication', 0),
    ('Interview Preparation', 0)
ON CONFLICT (subject) DO NOTHING;

-- Seed Default Daily Routine Schedule
INSERT INTO public.schedule_items (time_slot, activity, sort_order)
VALUES 
    ('7:00 – 7:30 AM', 'Wake up + Freshen up', 1),
    ('7:30 – 9:30 AM', 'Striver DSA', 2),
    ('9:30 – 10:00 AM', 'Breakfast / Break', 3),
    ('10:00 AM – 12:00 PM', 'TCS NQT Aptitude', 4),
    ('12:00 – 12:30 PM', 'Break', 5),
    ('12:30 – 2:30 PM', 'Development', 6),
    ('2:30 – 3:00 PM', 'Lunch', 7),
    ('3:00 – 4:00 PM', 'Coding / NQT Coding Practice', 8),
    ('4:00 – 4:30 PM', 'Communication', 9),
    ('4:30 – 5:00 PM', 'Break / Get Ready', 10),
    ('5:00 – 7:30 PM', 'Gym', 11),
    ('7:30 – 8:00 PM', 'Dinner', 12),
    ('8:00 – 9:00 PM', 'Revision', 13),
    ('9:00 – 9:45 PM', 'Interview Preparation', 14)
ON CONFLICT DO NOTHING;
