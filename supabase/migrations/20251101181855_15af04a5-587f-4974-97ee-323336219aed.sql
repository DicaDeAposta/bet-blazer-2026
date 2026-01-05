-- Add language/locale support to tables
ALTER TABLE public.sports ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));
ALTER TABLE public.picks ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));
ALTER TABLE public.market_types ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));

-- Add season field to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS season integer;

-- Add unique constraint for teams to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS teams_unique_name_league_season ON public.teams(name, league_id, season) WHERE season IS NOT NULL;

-- Add indexes for language filtering
CREATE INDEX IF NOT EXISTS idx_sports_language ON public.sports(language);
CREATE INDEX IF NOT EXISTS idx_leagues_language ON public.leagues(language);
CREATE INDEX IF NOT EXISTS idx_teams_language ON public.teams(language);
CREATE INDEX IF NOT EXISTS idx_teams_season ON public.teams(season);
CREATE INDEX IF NOT EXISTS idx_events_language ON public.events(language);
CREATE INDEX IF NOT EXISTS idx_picks_language ON public.picks(language);
CREATE INDEX IF NOT EXISTS idx_market_types_language ON public.market_types(language);