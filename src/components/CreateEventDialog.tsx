import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const CreateEventDialog = ({ open, onOpenChange, onEventCreated }) => {
  const [loading, setLoading] = useState(false);
  
  // Estados para armazenar as listas vindas do banco
  const [sports, setSports] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);

  const [formData, setFormData] = useState({
    sport_id: "",
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "",
    language: "pt",
  });

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [sportsRes, leaguesRes, teamsRes] = await Promise.all([
        supabase.from("sports").select("id, name").order("name"),
        supabase.from("leagues").select("id, name").order("name"),
        supabase.from("teams").select("id, name").order("name")
      ]);

      if (sportsRes.data) setSports(sportsRes.data);
      if (leaguesRes.data) setLeagues(leaguesRes.data);
      if (teamsRes.data) setTeams(teamsRes.data);
    } catch (error) {
      toast.error("Erro ao carregar listas do banco de dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sport_id || !formData.league_id || !formData.home_team_id || !formData.away_team_id) {
      toast.error("Selecione todos os campos obrigatórios");
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
        status: "scheduled",
      }])
      .select().single();

    if (error) {
      toast.error("Erro ao criar evento: " + error.message);
      return;
    }

    toast.success("Evento criado com sucesso!");
    onEventCreated(data.id);
    onOpenChange(false);
    
    // Resetar form
    setFormData({
      sport_id: "", league_id: "", home_team_id: "", away_team_id: "",
      event_datetime: "", venue: "", language: "pt"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Novo Evento</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm font-bold mt-2">Carregando listas...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold uppercase text-[10px]">Esporte *</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  value={formData.sport_id}
                  onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                  required
                >
                  <option value="">Selecione o Esporte</option>
                  {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="font-bold uppercase text-[10px]">Liga *</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  value={formData.league_id}
                  onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
                  required
                >
                  <option value="">Selecione a Liga</option>
                  {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold uppercase text-[10px]">Time da Casa *</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  value={formData.home_team_id}
                  onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                  required
                >
                  <option value="">Quem joga em casa?</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="font-bold uppercase text-[10px]">Time Visitante *</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  value={formData.away_team_id}
                  onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                  required
                >
                  <option value="">Quem é o visitante?</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold uppercase text-[10px]">Data e Hora *</Label>
                <Input
                  type="datetime-local"
                  value={formData.event_datetime}
                  onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="font-bold uppercase text-[10px]">Venue (Cidade/Estádio) *</Label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Ex: Miami - Hard Rock Stadium"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 font-bold uppercase">
                Criar Evento e Selecionar
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
