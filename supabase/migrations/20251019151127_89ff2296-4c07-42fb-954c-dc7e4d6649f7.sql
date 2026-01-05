-- Fix RLS policy for picks to allow admins to create picks for any analyst
DROP POLICY IF EXISTS "Analysts can create picks" ON picks;

CREATE POLICY "Analysts can create picks"
ON picks
FOR INSERT
WITH CHECK (
  -- Allow if user is the analyst
  (auth.uid() = analyst_id AND has_role(auth.uid(), 'analyst'::app_role))
  OR
  -- Allow if user is an admin (can create picks for any analyst)
  has_role(auth.uid(), 'admin'::app_role)
);

-- Make selection field optional
ALTER TABLE picks ALTER COLUMN selection DROP NOT NULL;

-- Prepopulate Sports
INSERT INTO sports (name, slug, icon) VALUES
('Futebol', 'futebol', '⚽'),
('Futebol Americano', 'futebol-americano', '🏈'),
('Basquete', 'basquete', '🏀'),
('Hóquei', 'hoquei', '🏒'),
('Beisebol', 'beisebol', '⚾')
ON CONFLICT DO NOTHING;

-- Get sport IDs for leagues
DO $$
DECLARE
  futebol_id UUID;
  futebol_americano_id UUID;
  basquete_id UUID;
  hoquei_id UUID;
  beisebol_id UUID;
BEGIN
  SELECT id INTO futebol_id FROM sports WHERE slug = 'futebol';
  SELECT id INTO futebol_americano_id FROM sports WHERE slug = 'futebol-americano';
  SELECT id INTO basquete_id FROM sports WHERE slug = 'basquete';
  SELECT id INTO hoquei_id FROM sports WHERE slug = 'hoquei';
  SELECT id INTO beisebol_id FROM sports WHERE slug = 'beisebol';

  -- Insert Leagues
  INSERT INTO leagues (name, slug, sport_id, country) VALUES
  -- Futebol - Brasil
  ('Brasileirão Série A', 'brasileirao-serie-a', futebol_id, 'Brasil'),
  ('Brasileirão Série B', 'brasileirao-serie-b', futebol_id, 'Brasil'),
  -- Futebol - Inglaterra
  ('Premier League', 'premier-league', futebol_id, 'Inglaterra'),
  ('Championship', 'championship', futebol_id, 'Inglaterra'),
  ('League One', 'league-one', futebol_id, 'Inglaterra'),
  ('League Two', 'league-two', futebol_id, 'Inglaterra'),
  -- Futebol - Espanha
  ('La Liga', 'la-liga', futebol_id, 'Espanha'),
  -- Futebol - Alemanha
  ('Bundesliga', 'bundesliga', futebol_id, 'Alemanha'),
  -- Futebol - Itália
  ('Serie A', 'serie-a-italy', futebol_id, 'Itália'),
  -- Futebol - Holanda
  ('Eredivisie', 'eredivisie', futebol_id, 'Holanda'),
  -- Futebol - França
  ('Ligue 1', 'ligue-1', futebol_id, 'França'),
  -- Futebol - EUA
  ('Major League Soccer', 'mls', futebol_id, 'EUA'),
  -- Futebol - Internacional
  ('Copa Libertadores', 'copa-libertadores', futebol_id, 'Internacional'),
  ('Copa Sul-Americana', 'copa-sul-americana', futebol_id, 'Internacional'),
  ('UEFA Champions League', 'uefa-champions-league', futebol_id, 'Internacional'),
  ('UEFA Europa League', 'uefa-europa-league', futebol_id, 'Internacional'),
  ('UEFA Conference League', 'uefa-conference-league', futebol_id, 'Internacional'),
  -- Futebol Americano
  ('NFL', 'nfl', futebol_americano_id, 'EUA'),
  ('NCAAF', 'ncaaf', futebol_americano_id, 'EUA'),
  -- Basquete
  ('NBA', 'nba', basquete_id, 'EUA'),
  -- Hóquei
  ('NHL', 'nhl', hoquei_id, 'EUA'),
  -- Beisebol
  ('MLB', 'mlb', beisebol_id, 'EUA')
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Teams for Brasileirão Série A
DO $$
DECLARE
  brasileirao_id UUID;
BEGIN
  SELECT id INTO brasileirao_id FROM leagues WHERE slug = 'brasileirao-serie-a';
  
  INSERT INTO teams (name, short_name, slug, league_id) VALUES
  ('Flamengo', 'FLA', 'flamengo', brasileirao_id),
  ('Palmeiras', 'PAL', 'palmeiras', brasileirao_id),
  ('São Paulo', 'SAO', 'sao-paulo', brasileirao_id),
  ('Corinthians', 'COR', 'corinthians', brasileirao_id),
  ('Grêmio', 'GRE', 'gremio', brasileirao_id),
  ('Internacional', 'INT', 'internacional', brasileirao_id),
  ('Atlético Mineiro', 'CAM', 'atletico-mineiro', brasileirao_id),
  ('Cruzeiro', 'CRU', 'cruzeiro', brasileirao_id),
  ('Botafogo', 'BOT', 'botafogo', brasileirao_id),
  ('Fluminense', 'FLU', 'fluminense', brasileirao_id),
  ('Santos', 'SAN', 'santos', brasileirao_id),
  ('Vasco da Gama', 'VAS', 'vasco-da-gama', brasileirao_id),
  ('Bahia', 'BAH', 'bahia', brasileirao_id),
  ('Athletico Paranaense', 'CAP', 'athletico-paranaense', brasileirao_id),
  ('Fortaleza', 'FOR', 'fortaleza', brasileirao_id),
  ('Bragantino', 'BRA', 'bragantino', brasileirao_id),
  ('Cuiabá', 'CUI', 'cuiaba', brasileirao_id),
  ('Goiás', 'GOI', 'goias', brasileirao_id),
  ('Coritiba', 'CFC', 'coritiba', brasileirao_id),
  ('América Mineiro', 'AME', 'america-mineiro', brasileirao_id)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Teams for Premier League
DO $$
DECLARE
  premier_league_id UUID;
BEGIN
  SELECT id INTO premier_league_id FROM leagues WHERE slug = 'premier-league';
  
  INSERT INTO teams (name, short_name, slug, league_id) VALUES
  ('Arsenal', 'ARS', 'arsenal', premier_league_id),
  ('Aston Villa', 'AVL', 'aston-villa', premier_league_id),
  ('Bournemouth', 'BOU', 'bournemouth', premier_league_id),
  ('Brentford', 'BRE', 'brentford', premier_league_id),
  ('Brighton', 'BHA', 'brighton', premier_league_id),
  ('Chelsea', 'CHE', 'chelsea', premier_league_id),
  ('Crystal Palace', 'CRY', 'crystal-palace', premier_league_id),
  ('Everton', 'EVE', 'everton', premier_league_id),
  ('Fulham', 'FUL', 'fulham', premier_league_id),
  ('Liverpool', 'LIV', 'liverpool', premier_league_id),
  ('Luton Town', 'LUT', 'luton-town', premier_league_id),
  ('Manchester City', 'MCI', 'manchester-city', premier_league_id),
  ('Manchester United', 'MUN', 'manchester-united', premier_league_id),
  ('Newcastle United', 'NEW', 'newcastle-united', premier_league_id),
  ('Nottingham Forest', 'NFO', 'nottingham-forest', premier_league_id),
  ('Sheffield United', 'SHU', 'sheffield-united', premier_league_id),
  ('Tottenham', 'TOT', 'tottenham', premier_league_id),
  ('West Ham', 'WHU', 'west-ham', premier_league_id),
  ('Wolverhampton', 'WOL', 'wolverhampton', premier_league_id),
  ('Burnley', 'BUR', 'burnley', premier_league_id)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Teams for La Liga
DO $$
DECLARE
  la_liga_id UUID;
BEGIN
  SELECT id INTO la_liga_id FROM leagues WHERE slug = 'la-liga';
  
  INSERT INTO teams (name, short_name, slug, league_id) VALUES
  ('Real Madrid', 'RMA', 'real-madrid', la_liga_id),
  ('Barcelona', 'BAR', 'barcelona', la_liga_id),
  ('Atlético Madrid', 'ATM', 'atletico-madrid', la_liga_id),
  ('Sevilla', 'SEV', 'sevilla', la_liga_id),
  ('Real Sociedad', 'RSO', 'real-sociedad', la_liga_id),
  ('Real Betis', 'BET', 'real-betis', la_liga_id),
  ('Villarreal', 'VIL', 'villarreal', la_liga_id),
  ('Valencia', 'VAL', 'valencia', la_liga_id),
  ('Athletic Bilbao', 'ATH', 'athletic-bilbao', la_liga_id),
  ('Osasuna', 'OSA', 'osasuna', la_liga_id),
  ('Girona', 'GIR', 'girona', la_liga_id),
  ('Celta Vigo', 'CEL', 'celta-vigo', la_liga_id),
  ('Mallorca', 'MLL', 'mallorca', la_liga_id),
  ('Getafe', 'GET', 'getafe', la_liga_id),
  ('Rayo Vallecano', 'RAY', 'rayo-vallecano', la_liga_id),
  ('Las Palmas', 'LPA', 'las-palmas', la_liga_id),
  ('Alavés', 'ALA', 'alaves', la_liga_id),
  ('Cádiz', 'CAD', 'cadiz', la_liga_id),
  ('Granada', 'GRA', 'granada', la_liga_id),
  ('Almería', 'ALM', 'almeria', la_liga_id)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Teams for NFL (32 teams)
DO $$
DECLARE
  nfl_id UUID;
BEGIN
  SELECT id INTO nfl_id FROM leagues WHERE slug = 'nfl';
  
  INSERT INTO teams (name, short_name, slug, league_id) VALUES
  ('Arizona Cardinals', 'ARI', 'arizona-cardinals', nfl_id),
  ('Atlanta Falcons', 'ATL', 'atlanta-falcons', nfl_id),
  ('Baltimore Ravens', 'BAL', 'baltimore-ravens', nfl_id),
  ('Buffalo Bills', 'BUF', 'buffalo-bills', nfl_id),
  ('Carolina Panthers', 'CAR', 'carolina-panthers', nfl_id),
  ('Chicago Bears', 'CHI', 'chicago-bears', nfl_id),
  ('Cincinnati Bengals', 'CIN', 'cincinnati-bengals', nfl_id),
  ('Cleveland Browns', 'CLE', 'cleveland-browns', nfl_id),
  ('Dallas Cowboys', 'DAL', 'dallas-cowboys', nfl_id),
  ('Denver Broncos', 'DEN', 'denver-broncos', nfl_id),
  ('Detroit Lions', 'DET', 'detroit-lions', nfl_id),
  ('Green Bay Packers', 'GB', 'green-bay-packers', nfl_id),
  ('Houston Texans', 'HOU', 'houston-texans', nfl_id),
  ('Indianapolis Colts', 'IND', 'indianapolis-colts', nfl_id),
  ('Jacksonville Jaguars', 'JAX', 'jacksonville-jaguars', nfl_id),
  ('Kansas City Chiefs', 'KC', 'kansas-city-chiefs', nfl_id),
  ('Las Vegas Raiders', 'LV', 'las-vegas-raiders', nfl_id),
  ('Los Angeles Chargers', 'LAC', 'los-angeles-chargers', nfl_id),
  ('Los Angeles Rams', 'LAR', 'los-angeles-rams', nfl_id),
  ('Miami Dolphins', 'MIA', 'miami-dolphins', nfl_id),
  ('Minnesota Vikings', 'MIN', 'minnesota-vikings', nfl_id),
  ('New England Patriots', 'NE', 'new-england-patriots', nfl_id),
  ('New Orleans Saints', 'NO', 'new-orleans-saints', nfl_id),
  ('New York Giants', 'NYG', 'new-york-giants', nfl_id),
  ('New York Jets', 'NYJ', 'new-york-jets', nfl_id),
  ('Philadelphia Eagles', 'PHI', 'philadelphia-eagles', nfl_id),
  ('Pittsburgh Steelers', 'PIT', 'pittsburgh-steelers', nfl_id),
  ('San Francisco 49ers', 'SF', 'san-francisco-49ers', nfl_id),
  ('Seattle Seahawks', 'SEA', 'seattle-seahawks', nfl_id),
  ('Tampa Bay Buccaneers', 'TB', 'tampa-bay-buccaneers', nfl_id),
  ('Tennessee Titans', 'TEN', 'tennessee-titans', nfl_id),
  ('Washington Commanders', 'WAS', 'washington-commanders', nfl_id)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Teams for NBA (30 teams)
DO $$
DECLARE
  nba_id UUID;
BEGIN
  SELECT id INTO nba_id FROM leagues WHERE slug = 'nba';
  
  INSERT INTO teams (name, short_name, slug, league_id) VALUES
  ('Atlanta Hawks', 'ATL', 'atlanta-hawks', nba_id),
  ('Boston Celtics', 'BOS', 'boston-celtics', nba_id),
  ('Brooklyn Nets', 'BKN', 'brooklyn-nets', nba_id),
  ('Charlotte Hornets', 'CHA', 'charlotte-hornets', nba_id),
  ('Chicago Bulls', 'CHI', 'chicago-bulls', nba_id),
  ('Cleveland Cavaliers', 'CLE', 'cleveland-cavaliers', nba_id),
  ('Dallas Mavericks', 'DAL', 'dallas-mavericks', nba_id),
  ('Denver Nuggets', 'DEN', 'denver-nuggets', nba_id),
  ('Detroit Pistons', 'DET', 'detroit-pistons', nba_id),
  ('Golden State Warriors', 'GSW', 'golden-state-warriors', nba_id),
  ('Houston Rockets', 'HOU', 'houston-rockets', nba_id),
  ('Indiana Pacers', 'IND', 'indiana-pacers', nba_id),
  ('LA Clippers', 'LAC', 'la-clippers', nba_id),
  ('Los Angeles Lakers', 'LAL', 'los-angeles-lakers', nba_id),
  ('Memphis Grizzlies', 'MEM', 'memphis-grizzlies', nba_id),
  ('Miami Heat', 'MIA', 'miami-heat', nba_id),
  ('Milwaukee Bucks', 'MIL', 'milwaukee-bucks', nba_id),
  ('Minnesota Timberwolves', 'MIN', 'minnesota-timberwolves', nba_id),
  ('New Orleans Pelicans', 'NOP', 'new-orleans-pelicans', nba_id),
  ('New York Knicks', 'NYK', 'new-york-knicks', nba_id),
  ('Oklahoma City Thunder', 'OKC', 'oklahoma-city-thunder', nba_id),
  ('Orlando Magic', 'ORL', 'orlando-magic', nba_id),
  ('Philadelphia 76ers', 'PHI', 'philadelphia-76ers', nba_id),
  ('Phoenix Suns', 'PHX', 'phoenix-suns', nba_id),
  ('Portland Trail Blazers', 'POR', 'portland-trail-blazers', nba_id),
  ('Sacramento Kings', 'SAC', 'sacramento-kings', nba_id),
  ('San Antonio Spurs', 'SAS', 'san-antonio-spurs', nba_id),
  ('Toronto Raptors', 'TOR', 'toronto-raptors', nba_id),
  ('Utah Jazz', 'UTA', 'utah-jazz', nba_id),
  ('Washington Wizards', 'WAS', 'washington-wizards', nba_id)
  ON CONFLICT DO NOTHING;
END $$;