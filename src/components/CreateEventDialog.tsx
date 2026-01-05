import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Sport {
  id: string;
  name: string;
}

interface League {
  id: string;
  name: string;
  sport_id: string;
}

interface Team {
  id: string;
  name: string;
  league_id: string;
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (eventId: string) => void;
}

export const CreateEventDialog = ({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    sport_id: "",
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "",
    language: "en" as "en" | "pt" | "es",
    market_type: "" // Novo campo para market_type como string
  });

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      Promise.all([loadSports(), loadLeagues(), loadTeams()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [open]);

  const loadSports = async () => {
    const { data } = await supabase
      .from("sports")
      .select("id, name")
      .order("name");
    if (data) setSports(data);
  };

  const loadLeagues = async () => {
    const { data } = await supabase
      .from("leagues")
      .select("id, name, sport_id")
      .order("name");
    if (data) setLeagues(data);
  };

  const loadTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("id, name, league_id")
      .order("name");
    if (data) setTeams(data);
  };

  const handleSportChange = (sportId: string) => {
    setFormData({ ...formData, sport_id: sportId, league_id: "", home_team_id: "", away_team_id: "" });
    setFilteredLeagues(leagues.filter(l => l.sport_id === sportId));
    setFilteredTeams([]);
  };

  const handleLeagueChange = (leagueId: string) => {
    setFormData({ ...formData, league_id: leagueId, home_team_id: "", away_team_id: "" });
    setFilteredTeams(teams.filter(t => t.league_id === leagueId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sport_id || !formData.league_id || !formData.home_team_id || 
        !formData.away_team_id || !formData.event_datetime || !formData.market_type) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.home_team_id === formData.away_team_id) {
      toast.error("Home and away teams must be different");
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .insert([{
        sport_id: formData.sport_id,
        league_id: formData.league_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        event_datetime: formData.event_datetime,
        venue: formData.venue,
        language: formData.language,
        status: "scheduled"
      }])
      .select()
      .single();

    if (error) {
      toast.error("Error creating event");
      console.error(error);
      return;
    }

    toast.success("Event created successfully");
    onEventCreated(data.id);
    onOpenChange(false);

    // Reset form
    setFormData({
      sport_id: "",
      league_id: "",
      home_team_id: "",
      away_team_id: "",
      event_datetime: "",
      venue: "",
      language: "en",
      market_type: "" // Resetar o campo market_type
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sport_id">Sport *</Label>
            <Input
              value={formData.sport_id}
              onChange={(e) => handleSportChange(e.target.value)}
              placeholder="Select sport"
              required
            />
          </div>

          <div>
            <Label htmlFor="league_id">League *</Label>
            <Input
              value={formData.league_id}
              onChange={(e) => handleLeagueChange(e.target.value)}
              disabled={!formData.sport_id}
              placeholder="Select league"
              required
            />
          </div>

          <div>
            <Label htmlFor="home_team_id">Home Team *</Label>
            <Input
              value={formData.home_team_id}
              onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
              disabled={!formData.league_id}
              placeholder="Select home team"
              required
            />
          </div>

          <div>
            <Label htmlFor="away_team_id">Away Team *</Label>
            <Input
              value={formData.away_team_id}
              onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
              disabled={!formData.league_id}
              placeholder="Select away team"
              required
            />
          </div>

          <div>
            <Label htmlFor="event_datetime">Event Date & Time *</Label>
            <Input
              id="event_datetime"
              type="datetime-local"
              value={formData.event_datetime}
              onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g., Maracanã Stadium"
            />
          </div>

          <div>
            <Label htmlFor="market_type">Market Type *</Label>
            <Input
              id="market_type"
              value={formData.market_type}
              onChange={(e) => setFormData({ ...formData, market_type: e.target.value })}
              placeholder="Enter market type"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Create Event</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
