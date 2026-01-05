import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PickCard } from "./PickCard";

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

interface EventCardProps {
  event: Event;
  picks: Pick[];
}

const formatEventTime = (datetime: string) => {
  const date = new Date(datetime);
  const et = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
  
  return et.replace(' ', '').toUpperCase();
};

const formatEventDate = (datetime: string) => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const EventCard = ({ event, picks }: EventCardProps) => {
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  const expertPicks = picks.length;
  const displayedPicks = isExpanded ? picks : picks.slice(0, 3);

  const toggleAnalysis = (pickId: string) => {
    setExpandedAnalysis(prev => ({
      ...prev,
      [pickId]: !prev[pickId]
    }));
  };

  return (
    <section className="mb-6">
      <Card className="overflow-hidden border-none shadow-md">
        {/* Event Title Header */}
        <header className="bg-white p-6 border-b">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Home Team */}
              <div className="flex items-center gap-3">
                {event.home_team?.logo_url && (
                  <img src={event.home_team.logo_url} className="h-10 w-10 object-contain" alt={event.home_team.name} />
                )}
                <span className="text-xl md:text-2xl font-black uppercase tracking-tighter">{event.home_team?.name || 'TBD'}</span>
              </div>
              
              <span className="text-sm font-bold text-muted-foreground italic">vs</span>

              {/* Away Team */}
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl font-black uppercase tracking-tighter">{event.away_team?.name || 'TBD'}</span>
                {event.away_team?.logo_url && (
                  <img src={event.away_team.logo_url} className="h-10 w-10 object-contain" alt={event.away_team.name} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                {formatEventDate(event.event_datetime)} • {formatEventTime(event.event_datetime)} ET
              </span>
              <Badge className="bg-orange-500 text-white hover:bg-orange-600 border-0 text-[10px] font-bold px-2 py-0.5">
                {expertPicks} PICKS
              </Badge>
            </div>
          </div>
        </header>
        
        {/* Picks List */}
        <div className="divide-y divide-border">
          {displayedPicks.map((pick) => (
            <PickCard
              key={pick.id}
              pick={pick}
              isAnalysisExpanded={expandedAnalysis[pick.id] || false}
              onToggleAnalysis={() => toggleAnalysis(pick.id)}
            />
          ))}
        </div>

        {/* View More Button */}
        {picks.length > 3 && (
          <div className="p-3 bg-white border-t">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
              size="sm"
            >
              {isExpanded ? `Show Less` : `View All ${picks.length} Picks`}
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
};
