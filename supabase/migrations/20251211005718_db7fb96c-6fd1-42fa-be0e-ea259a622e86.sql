-- Add categories array to sites table
ALTER TABLE public.sites ADD COLUMN categories text[] DEFAULT '{}';

-- Create junction table for picks to sites (many-to-many)
CREATE TABLE public.pick_sites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pick_id uuid NOT NULL REFERENCES public.picks(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(pick_id, site_id)
);

-- Enable RLS
ALTER TABLE public.pick_sites ENABLE ROW LEVEL SECURITY;

-- RLS policies for pick_sites
CREATE POLICY "Pick sites are viewable by everyone" 
ON public.pick_sites FOR SELECT USING (true);

CREATE POLICY "Admins can manage pick sites" 
ON public.pick_sites FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add end_time to events if not exists (for auto-delete logic)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

-- Add category to picks for matching with site categories
ALTER TABLE public.picks ADD COLUMN category text;