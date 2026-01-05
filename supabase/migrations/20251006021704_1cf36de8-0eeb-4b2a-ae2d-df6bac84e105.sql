-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'user');
CREATE TYPE public.pick_type AS ENUM ('manual', 'ai', 'computer');
CREATE TYPE public.odds_format AS ENUM ('decimal', 'american', 'fractional');

-- Sports taxonomy
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leagues
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_name TEXT,
  logo_url TEXT,
  external_api_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Players
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position TEXT,
  jersey_number INTEGER,
  photo_url TEXT,
  external_api_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Market types taxonomy
CREATE TABLE public.market_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookmakers
CREATE TABLE public.bookmakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  affiliate_link TEXT,
  affiliate_params JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events (Matchups)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_datetime TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT DEFAULT 'scheduled',
  external_api_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Analyst profiles (extended user info for analysts)
CREATE TABLE public.analyst_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  twitter_handle TEXT,
  win_rate DECIMAL(5,2),
  total_picks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Picks (betting tips)
CREATE TABLE public.picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  analyst_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  related_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  market_type_id UUID NOT NULL REFERENCES public.market_types(id) ON DELETE CASCADE,
  selection TEXT NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  odds_format odds_format DEFAULT 'american',
  bookmaker_id UUID NOT NULL REFERENCES public.bookmakers(id) ON DELETE CASCADE,
  analysis TEXT,
  pick_type pick_type DEFAULT 'manual',
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  is_best_odds BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies

-- Sports: public read, admin write
CREATE POLICY "Sports are viewable by everyone" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Admins can manage sports" ON public.sports FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leagues: public read, admin write
CREATE POLICY "Leagues are viewable by everyone" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Admins can manage leagues" ON public.leagues FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Teams: public read, admin write
CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Players: public read, admin write
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Admins can manage players" ON public.players FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Market types: public read, admin write
CREATE POLICY "Market types are viewable by everyone" ON public.market_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage market types" ON public.market_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bookmakers: public read, admin write
CREATE POLICY "Bookmakers are viewable by everyone" ON public.bookmakers FOR SELECT USING (true);
CREATE POLICY "Admins can manage bookmakers" ON public.bookmakers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Events: public read, admin write
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User roles: users can view own, admin can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Analyst profiles: public read, own update
CREATE POLICY "Analyst profiles are viewable by everyone" ON public.analyst_profiles FOR SELECT USING (true);
CREATE POLICY "Analysts can update own profile" ON public.analyst_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage analyst profiles" ON public.analyst_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Picks: public read, analysts and admins can create/update own
CREATE POLICY "Picks are viewable by everyone" ON public.picks FOR SELECT USING (true);
CREATE POLICY "Analysts can create picks" ON public.picks FOR INSERT WITH CHECK (
  auth.uid() = analyst_id AND (
    public.has_role(auth.uid(), 'analyst') OR 
    public.has_role(auth.uid(), 'admin')
  )
);
CREATE POLICY "Analysts can update own picks" ON public.picks FOR UPDATE USING (
  auth.uid() = analyst_id AND (
    public.has_role(auth.uid(), 'analyst') OR 
    public.has_role(auth.uid(), 'admin')
  )
);
CREATE POLICY "Admins can delete picks" ON public.picks FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_leagues_sport ON public.leagues(sport_id);
CREATE INDEX idx_teams_league ON public.teams(league_id);
CREATE INDEX idx_players_team ON public.players(team_id);
CREATE INDEX idx_events_sport ON public.events(sport_id);
CREATE INDEX idx_events_league ON public.events(league_id);
CREATE INDEX idx_events_datetime ON public.events(event_datetime);
CREATE INDEX idx_picks_event ON public.picks(event_id);
CREATE INDEX idx_picks_analyst ON public.picks(analyst_id);
CREATE INDEX idx_picks_created ON public.picks(created_at DESC);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookmakers_updated_at BEFORE UPDATE ON public.bookmakers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analyst_profiles_updated_at BEFORE UPDATE ON public.analyst_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_picks_updated_at BEFORE UPDATE ON public.picks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();