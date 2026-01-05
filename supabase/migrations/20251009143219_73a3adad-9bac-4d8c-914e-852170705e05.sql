-- Corrigir foreign key incorreta em picks.site_id
ALTER TABLE public.picks DROP COLUMN IF EXISTS site_id;
ALTER TABLE public.picks ADD COLUMN site_id UUID REFERENCES public.sites(id);