import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Mantivemos o Input para os campos
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
// Importações corrigidas para resolver o erro "Select is not defined"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [bookmakers, setBookmakers] = useState<any[]>([]); // Para Bookmakers
  const [analysts, setAnalysts] = useState<any[]>([]); // Para Analysts
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    sport_id: "",
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "",
    language: "pt" as "en" | "pt" | "es",
    market_type: "", 
    bookmaker_id: "", // Campo para bookmaker
    analyst_id: "", // Campo para analyst
  });

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Carregar os dados iniciais
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [s, l, t, b, a] = await Promise.all([
        supabase.from("sports").select("id, name").order("name"),
        supabase.from("leagues").select("id, name, sport_id").order("name"),
        supabase.from("teams").select("id, name, league_id").order("name"),
        supabase.from("bookmakers_public").select("id, name").order("name"),
        supabase.from("analyst_profiles").select("id, display_name").order("display_name")
      ]);

      if (s.data) setSports(s.data);
      if (l.data) setLeagues(l.data);
      if (t.data) setTeams(t.data);
      if (b.data) setBookmakers(b.data);
      if (a.data) setAnalysts(a.data);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast.error("Erro ao carregar dados iniciais.");
    } finally {
      setIsLoading(false);
    }
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

    if (!formData.sport_id || !formData.league_id || !formData.home_team_id || !formData.away_team_id || !formData.event_datetime || !formData.market_type) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
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
      console.error(error);
      toast.error("Erro ao criar evento: " + error.message);
      return;
    }

    toast.success("Evento criado com sucesso!");
    onEventCreated(data.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Esporte com Select Real */}
          <div>
            <Label>Esporte *</Label>
            <Select onValueChange={handleSportChange} value={formData.sport_id} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o esporte" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de Liga */}
          <div>
            <Label>Liga *</Label>
            <Select 
              onValueChange={handleLeagueChange} 
              value={formData.league_id}
              disabled={!formData.sport_id || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a liga" />
              </SelectTrigger>
              <SelectContent>
                {filteredLeagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>{league.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time da Casa *</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, home_team_id: val})} 
                value={formData.home_team_id}
                disabled={!formData.league_id || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Casa" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Visitante *</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, away_team_id: val})} 
                value={formData.away_team_id}
                disabled={!formData.league_id || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Visitante" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data e Hora do Evento */}
          <div>
            <Label htmlFor="event_datetime">Data e Hora *</Label>
            <Input
              id="event_datetime"
              type="datetime-local"
              value={formData.event_datetime}
              onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
              required
            />
          </div>

          {/* Tipo de Mercado */}
          <div>
            <Label htmlFor="market_type">Tipo de Mercado *</Label>
            <Input
              id="market_type"
              value={formData.market_type}
              onChange={(e) => setFormData({ ...formData, market_type: e.target.value })}
              placeholder="Ex: Vencedor do Encontro"
              required
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>Criar Evento</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
