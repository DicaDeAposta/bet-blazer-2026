-- Fix the analyst_id FK constraint to reference analyst_profiles.id instead of user_id
ALTER TABLE public.picks DROP CONSTRAINT IF EXISTS picks_analyst_id_fkey;

ALTER TABLE public.picks 
ADD CONSTRAINT picks_analyst_id_fkey 
FOREIGN KEY (analyst_id) REFERENCES public.analyst_profiles(id);

-- Add display_name column to sites table for per-site branding
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT 'Picks Manager';

-- Update existing sites with default display_name
UPDATE public.sites SET display_name = 'Picks Manager' WHERE display_name IS NULL;