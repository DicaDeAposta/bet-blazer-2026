-- Fix 1: Secure bookmakers table by creating a public view
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Bookmakers are viewable by everyone" ON public.bookmakers;

-- Create a public view that only exposes safe fields
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

-- Grant access to the view
GRANT SELECT ON public.bookmakers_public TO anon, authenticated;

-- Restrict full bookmakers table to admins only
CREATE POLICY "Admins can view full bookmaker data" 
ON public.bookmakers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));