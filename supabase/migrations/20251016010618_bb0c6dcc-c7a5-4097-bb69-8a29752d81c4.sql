-- Remove unique constraint from sites domain to allow multiple sites with same domain
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_domain_key;

-- Add index for performance (non-unique)
CREATE INDEX IF NOT EXISTS idx_sites_domain ON public.sites(domain) WHERE domain IS NOT NULL;