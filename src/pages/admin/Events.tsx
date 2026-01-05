import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";

interface Event {
  id: string;
  event_datetime: string;
  venue: string | null;
  home_team_id: string;
  away_team_id: string;
  league_id: string;
  sport_id: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  league: { id: string; name: string; sport_id: string };
}

interface Team {
  id: string;
  name: string;
}

interface League {
  id: string;
  name: string;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [formData, setFormData] = useState({
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "",
    sport_id: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
    loadTeams();
    loadLeagues();
  }, []);

  const loadTeams = async () => {
    const { data } = await supabase.from("teams").select("id, name").order("name");
    if (data) setTeams(data);
  };

  const loadLeagues = async () => {
    const { data } = await supabase.from("leagues").select("id, name, sport_id").order("name");
    if (data) setLeagues(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        home_team:teams!events_home_team_id_fkey(id, name),
        away_team:teams!events_away_team_id_fkey(id, name),
        league:leagues(id, name, sport_id)
      `)
      .order("event_datetime", { ascending: false });
    
    if (data) setEvents(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLeague = leagues.find(l => l.id === formData.league_id);
    if (!selectedLeague) {
      toast.error("Please select a league");
      return;
    }

    const submitData = {
      ...formData,
      sport_id: (selectedLeague as any).sport_id
    };

    if (editingId) {
      const { error } = await supabase
        .from("events")
        .update(submitData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error updating event");
        return;
      }
      toast.success("Event updated successfully");
    } else {
      const { error } = await supabase
        .from("events")
        .insert([submitData]);

      if (error) {
        toast.error("Error creating event");
        return;
      }
      toast.success("Event created successfully");
    }

    setFormData({ league_id: "", home_team_id: "", away_team_id: "", event_datetime: "", venue: "", sport_id: "" });
    setEditingId(null);
    loadEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting event");
      return;
    }

    toast.success("Event deleted successfully");
    loadEvents();
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl font-bold">Events Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Event" : "Create Event"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="league_id">League</Label>
                    <Select
                      value={formData.league_id}
                      onValueChange={(value) => setFormData({ ...formData, league_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a league" />
                      </SelectTrigger>
                      <SelectContent>
                        {leagues.map((league) => (
                          <SelectItem key={league.id} value={league.id}>
                            {league.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="home_team_id">Home Team</Label>
                    <Select
                      value={formData.home_team_id}
                      onValueChange={(value) => setFormData({ ...formData, home_team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="away_team_id">Away Team</Label>
                    <Select
                      value={formData.away_team_id}
                      onValueChange={(value) => setFormData({ ...formData, away_team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="event_datetime">Event Date & Time</Label>
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
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingId ? "Update" : "Create"}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({ league_id: "", home_team_id: "", away_team_id: "", event_datetime: "", venue: "", sport_id: "" });
                          setEditingId(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {event.home_team.name} vs {event.away_team.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.league.name} • {new Date(event.event_datetime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const eventDate = new Date(event.event_datetime);
                            const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000);
                            setFormData({
                              league_id: event.league?.id || event.league_id || "",
                              home_team_id: event.home_team?.id || event.home_team_id || "",
                              away_team_id: event.away_team?.id || event.away_team_id || "",
                              event_datetime: localDate.toISOString().slice(0, 16),
                              venue: event.venue || "",
                              sport_id: event.league?.sport_id || event.sport_id || ""
                            });
                            setEditingId(event.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Events;