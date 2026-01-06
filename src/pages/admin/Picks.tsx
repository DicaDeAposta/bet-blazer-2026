import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ArrowLeft, Plus } from "lucide-react";
// Importação agora condizente com o 'export const' do componente
import { CreateEventDialog } from "@/components/CreateEventDialog";

const Picks = () => {
  const navigate = useNavigate();
  const [picks, setPicks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [bookmakers, setBookmakers] = useState<any[]>([]);
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    event_id: "",
    analyst_id: "",
    market_type: "",
    selection: "",
    odds: "",
    bookmaker_id: "",
    analysis: "",
    confidence_level: "3",
  });

  useEffect(() => {
    loadPicks();
    loadEvents();
    loadBookmakers();
    loadAnalysts();
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        id,
        event_datetime,
        home_team:teams!events_home_team_id_fkey(name),
        away_team:teams!events_away_team_id_fkey(name)
      `)
      .order("event_datetime", { ascending: false });
    if (data) setEvents(data);
  };

  const loadBookmakers = async () => {
    const { data } = await supabase.from("bookmakers_public").select("id, name").order("name");
    if (data) setBookmakers(data);
  };

  const loadAnalysts = async () => {
    const { data } = await supabase.from("analyst_profiles").select("id, display_name").order("display_name");
    if (data) setAnalysts(data);
  };

  const loadPicks = async () => {
    const { data } = await supabase
      .from("picks")
      .select(`
        *,
        event:events(home_team:teams!events_home_team_id_fkey(name), away_team:teams!events_away_team_id_fkey(name)),
        market_type:market_types(name),
        bookmaker:bookmakers_public(name),
        analyst:analyst_profiles(display_name)
      `)
      .order("created_at", { ascending: false });
    if (data) setPicks(data);
  };

  const handleEventCreated = (eventId: string) => {
    loadEvents().then(() => {
      setFormData(prev => ({ ...prev, event_id: eventId }));
      toast.success("Novo evento criado e selecionado!");
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lógica para salvar a Pick (Simplificada para o exemplo)
    const { error } = await supabase.from("picks").insert([{
        event_id: formData.event_id,
        analyst_id: formData.analyst_id,
        bookmaker_id: formData.bookmaker_id,
        selection: formData.selection,
        odds: parseFloat(formData.odds),
        analysis: formData.analysis,
        confidence_level: parseInt(formData.confidence_level)
    }]);

    if (error) {
        toast.error("Erro: " + error.message);
    } else {
        toast.success("Aposta criada!");
        setFormData({ ...formData, selection: "", odds: "", analysis: "" });
        loadPicks();
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/admin")}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Gerenciar Picks</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-t-4 border-t-orange-500">
              <CardHeader><CardTitle>Nova Pick</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* SELEÇÃO DE EVENTO COM NOMES */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-bold">Evento *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsEventDialogOpen(true)} className="h-7 text-[10px] font-bold uppercase">
                        <Plus className="h-3 w-3 mr-1" /> New Event
                      </Button>
                    </div>
                    <select 
                      className="w-full p-2 border rounded-md bg-white text-sm"
                      value={formData.event_id}
                      onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione o Jogo</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.home_team?.name} vs {ev.away_team?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELEÇÃO DE ANALISTA */}
                  <div>
                    <Label className="font-bold">Expert / Analista *</Label>
                    <select 
                      className="w-full p-2 border rounded-md bg-white text-sm"
                      value={formData.analyst_id}
                      onChange={(e) => setFormData({...formData, analyst_id: e.target.value})}
                      required
                    >
                      <option value="">Quem está dando a dica?</option>
                      {analysts.map(a => <option key={a.id} value={a.id}>{a.display_name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Seleção</Label>
                      <Input placeholder="Ex: Over 2.5" value={formData.selection} onChange={(e) => setFormData({...formData, selection: e.target.value})} />
                    </div>
                    <div>
                      <Label className="font-bold">Odds</Label>
                      <Input placeholder="1.90" value={formData.odds} onChange={(e) => setFormData({...formData, odds: e.target.value})} required />
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold">Casa de Aposta *</Label>
                    <select 
                      className="w-full p-2 border rounded-md bg-white text-sm"
                      value={formData.bookmaker_id}
                      onChange={(e) => setFormData({...formData, bookmaker_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione a Casa</option>
                      {bookmakers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Análise (Opcional)</Label>
                    <Textarea value={formData.analysis} onChange={(e) => setFormData({...formData, analysis: e.target.value})} />
                  </div>

                  <Button type="submit" className="w-full bg-slate-900 font-bold uppercase tracking-widest py-6">Publicar Pick</Button>
                </form>
              </CardContent>
            </Card>

            {/* LISTA DE PICKS SIMPLIFICADA */}
            <Card className="bg-slate-100 border-none">
                <CardHeader><CardTitle className="text-sm font-bold uppercase text-slate-500">Últimas Publicações</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {picks.slice(0, 5).map(p => (
                        <div key={p.id} className="bg-white p-3 rounded border flex justify-between items-center shadow-sm">
                            <div>
                                <p className="font-black text-xs uppercase">{p.event?.home_team?.name} x {p.event?.away_team?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{p.analyst?.display_name} • {p.selection} @{p.odds}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </div>
        </main>

        <CreateEventDialog 
          open={isEventDialogOpen} 
          onOpenChange={setIsEventDialogOpen} 
          onEventCreated={handleEventCreated} 
        />
      </div>
    </ProtectedRoute>
  );
};

export default Picks;
