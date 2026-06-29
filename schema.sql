-- ==========================================
-- Syrma SGS Technology - Equipment Management System
-- Database Schema Setup Script
-- File: schema.sql
-- ==========================================

-- Drop table if exists to ensure clean run if desired (optional)
-- DROP TABLE IF EXISTS public.equipment CASCADE;

-- 1. Create the equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
    asset_number TEXT PRIMARY KEY,
    serial_number TEXT NOT NULL,
    machine_name TEXT NOT NULL,
    calibration_due_date DATE NOT NULL,
    location TEXT NOT NULL,
    equipment_owner TEXT NOT NULL,
    department TEXT NOT NULL,
    equipment_status TEXT NOT NULL,
    remarks TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Indexes for optimized searching and filtering
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment (equipment_status);
CREATE INDEX IF NOT EXISTS idx_equipment_dept ON public.equipment (department);
CREATE INDEX IF NOT EXISTS idx_equipment_owner ON public.equipment (equipment_owner);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for the equipment table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.equipment;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.equipment;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.equipment;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.equipment;

-- Create policies restricted to authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.equipment
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.equipment
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.equipment
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.equipment
    FOR DELETE TO authenticated USING (true);

-- 5. Storage configuration for uploaded documents
-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the documents bucket
-- Enable authenticated users to manage files in the bucket
CREATE POLICY "Allow authenticated users to view files" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to update files" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'documents');
