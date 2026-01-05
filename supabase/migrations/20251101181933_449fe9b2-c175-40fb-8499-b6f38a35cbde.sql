-- Fix security definer view by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.bookmakers_public;

CREATE VIEW public.bookmakers_public AS
SELECT 
  id,
  name,
  slug,
  logo_url,
  is_active,
  created_at,
  updated_at
FROM public.bookmakers
WHERE is_active = true;