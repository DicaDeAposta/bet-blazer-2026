-- Add language field to sites table for localization
ALTER TABLE public.sites 
ADD COLUMN language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));