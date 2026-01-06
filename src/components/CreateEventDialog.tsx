import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const CreateEventDialog = ({ open, onOpenChange, onEventCreated }: any) => {
  const [sports, setSports] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [bookmakers, setBookmakers] = useState<any[]>([]);
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    sport_id: "",
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "",
    language: "pt",
    market_type: "", 
    bookmaker_id: "", 
    analyst_id: "", 
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoading(true);
    const [s, l, t, b, a] = await Promise.all([
      supabase.from("sports").select("id, name"),
      supabase.from("leagues").select("id, name, sport_id"),
      supabase.from("teams").select("id, name, league_id"),
      supabase.from("bookmakers_public").select("id, name"),
      supabase.from("analyst_profiles").select("id, display_name")
    ]);

    if (s.data) setSports(s.data);
    if (l.data) setLeagues(l.data);
    if (t.data) setTeams(t.data);
    if (b.data) setBookmakers(b.data);
    if (a.data) setAnalysts(a.data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Agora enviamos TODOS os campos para o banco
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          sport_id: formData.sport_id,
          league_id: formData.league_id,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          event_datetime: formData.event_datetime,
          venue: formData.venue,
          language: formData.language,
          market_type: formData.market_type, // Enviando market_type
          bookmaker_id: formData.bookmaker_id === "" ? null : formData.bookmaker_id, // Enviando bookmaker
          analyst_id: formData.analyst_id === "" ? null : formData.analyst_id, // Enviando analista
          status: "scheduled",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Erro ao salvar: " + error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Evento e Pick criados com sucesso!");
    onEventCreated(data.id);
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento e Pick</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Esporte */}
          <div>
            <Label>ID do Esporte (ou use a lista) *</Label>
            <Input 
              value={formData.sport_id} 
              onChange={(e) => setFormData({...formData, sport_id: e.target.value})}
              list="sports-list" 
              placeholder="Selecione ou cole o ID"
            />
            <datalist id="sports-list">
              {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </datalist>
          </div>

          {/* Liga */}
          <div>
            <Label>ID da Liga *</Label>
            <Input 
              value={formData.league_id} 
              onChange={(e) => setFormData({...formData, league_id: e.target.value})}
              list="leagues-list"
            />
            <datalist id="leagues-list">
              {leagues.filter(l => l.sport_id === formData.sport_id || !formData.sport_id).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </datalist>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time Casa *</Label>
              <Input 
                value={formData.home_team_id} 
                onChange={(e) => setFormData({...formData, home_team_id: e.target.value})}
                list="teams-list"
              />
            </div>
            <div>
              <Label>Time Visitante *</Label>
              <Input 
                value={formData.away_team_id} 
                onChange={(e) => setFormData({...formData, away_team_id: e.target.value})}
                list="teams-list"
              />
            </div>
            <datalist id="teams-list">
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </datalist>
          </div>

          {/* Data e Mercado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data e Hora *</Label>
              <Input type="datetime-local" value={formData.event_datetime} onChange={(e) => setFormData({...formData, event_datetime: e.target.value})} />
            </div>
            <div>
              <Label>Tipo de Mercado *</Label>
              <Input value={formData.market_type} onChange={(e) => setFormData({...formData, market_type: e.target.value})} placeholder="Ex: Ambas Marcam" />
            </div>
          </div>

          {/* Casa de Aposta e Analista */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Casa de Aposta</Label>
              <Input value={formData.bookmaker_id} onChange={(e) => setFormData({...formData, bookmaker_id: e.target.value})} list="bm-list" />
              <datalist id="bm-list">
                {bookmakers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </datalist>
            </div>
            <div>
              <Label>Analista</Label>
              <Input value={formData.analyst_id} onChange={(e) => setFormData({...formData, analyst_id: e.target.value})} list="an-list" />
              <datalist id="an-list">
                {analysts.map(a => <option key={a.id} value={a.id}>{a.display_name}</option>)}
              </datalist>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Criar Evento e Pick"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
