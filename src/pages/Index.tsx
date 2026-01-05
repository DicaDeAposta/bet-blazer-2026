import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/hooks/useSiteContext";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";

interface Event {
  id: string;
  home_team: { name: string; logo_url: string | null; slug: string };
  away_team: { name: string; logo_url: string | null; slug: string };
  league: { name: string };
  sport: { name: string; slug: string };
  event_datetime: string;
}

interface Pick {
  id: string;
  selection: string;
  odds: string;
  odds_format: string;
  analysis: string | null;
  created_at: string;
  market_type: { name: string; slug: string };
  related_player: { name: string; photo_url: string | null } | null;
  related_team: { name: string; logo_url: string | null } | null;
  bookmaker: {
    name: string;
    logo_url: string | null;
    slug: string;
    affiliate_url?: string | null;
    affiliate_link?: string | null;
  } | null;
  analyst: { display_name: string; avatar_url: string | null; bio: string | null };
}

const Index = () => {
  const { currentSite, loading: siteLoading } = useSiteContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [picksByEvent, setPicksByEvent] = useState<Record<string, Pick[]>>({});

  useEffect(() => {
    if (!siteLoading) {
      loadEvents();
    }
  }, [currentSite, siteLoading]);

  const loadEvents = async () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: eventsData } = await supabase
      .from("events")
      .select(`
        id,
        event_datetime,
        home_team:teams!events_home_team_id_fkey(name, logo_url, slug),
        away_team:teams!events_away_team_id_fkey(name, logo_url, slug),
        league:leagues(name),
        sport:sports(name, slug)
      `)
      .gte("event_datetime", oneHourAgo.toISOString())
      .order("event_datetime", { ascending: true });

    if (eventsData) {
      setEvents(eventsData as any);

      const picksData: Record<string, Pick[]> = {};
      for (const event of eventsData) {
        const { data: picks } = await supabase
          .from("picks")
          .select(`
            id,
            selection,
            odds,
            odds_format,
            analysis,
            created_at,
            market_type:market_types(name, slug),
            related_player:players(name, photo_url),
            related_team:teams(name, logo_url),
            bookmaker:bookmakers(name, logo_url, slug, affiliate_link),
            analyst:analyst_profiles(display_name, avatar_url, bio)
          `)
          .eq("event_id", event.id);

        if (picks) {
          picksData[event.id] = (picks as any[]).map((p) => ({
            ...p,
            odds: p?.odds == null ? "" : String(p.odds),
          })) as any;
        }
      }
      setPicksByEvent(picksData);
    }
  };

  if (siteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="sr-only">Palpites e Prognósticos Esportivos</h1>
        
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Nenhum evento encontrado.
          </p>
        ) : (
          <div className="space-y-8">
            {events.map((event) => {
              const picks = picksByEvent[event.id] || [];
              
              if (picks.length === 0) return null;
              
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  picks={picks}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
