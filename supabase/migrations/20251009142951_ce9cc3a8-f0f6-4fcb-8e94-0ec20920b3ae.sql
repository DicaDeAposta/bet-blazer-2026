-- Criar tabela de sites para sistema multisite
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1EAEDB',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar campo site_id nas tabelas relevantes
ALTER TABLE public.leagues ADD COLUMN site_id UUID REFERENCES public.sites(id);
ALTER TABLE public.events ADD COLUMN site_id UUID REFERENCES public.sites(id);
ALTER TABLE public.picks ADD COLUMN site_id UUID REFERENCES public.picks(id);

-- Índices para performance
CREATE INDEX idx_leagues_site_id ON public.leagues(site_id);
CREATE INDEX idx_events_site_id ON public.events(site_id);
CREATE INDEX idx_picks_site_id ON public.picks(site_id);

-- RLS para sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sites are viewable by everyone"
ON public.sites
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage sites"
ON public.sites
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();