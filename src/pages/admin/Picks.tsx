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
import { Loader2, ArrowLeft, Plus, Copy } from "lucide-react";
// Importação corrigida para export default
import CreateEventDialog from "@/components/CreateEventDialog";

// ... interfaces permanecem as mesmas ...

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
    loadEvents(); // Recarrega a lista para o novo evento aparecer
    setFormData(prev => ({ ...prev, event_id: eventId }));
    toast.success("Evento selecionado automaticamente!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de Market Type e Insert (igual a sua, mas usando formData.event_id do select)
    // ... (mantenha seu handleSubmit original aqui)
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/admin")}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
            <h1 className="text-4xl font-bold">Gerenciar Picks</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Nova Pick</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* SELETOR DE EVENTO - Substitui o Input de ID */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Evento *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsEventDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Novo Evento
                      </Button>
                    </div>
                    <select 
                      className="w-full p-2 border rounded-md bg-white"
                      value={formData.event_id}
                      onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione um evento existente</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.home_team?.name} vs {ev.away_team?.name} ({new Date(ev.event_datetime).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELETOR DE ANALISTA */}
                  <div>
                    <Label>Analista *</Label>
                    <select 
                      className="w-full p-2 border rounded-md bg-white"
                      value={formData.analyst_id}
                      onChange={(e) => setFormData({...formData, analyst_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione o analista</option>
                      {analysts.map(a => <option key={a.id} value={a.id}>{a.display_name}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Tipo de Mercado *</Label>
                    <Input placeholder="Ex: Vencedor do Encontro" value={formData.market_type} onChange={(e) => setFormData({...formData, market_type: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Seleção</Label>
                      <Input placeholder="Ex: Flamengo" value={formData.selection} onChange={(e) => setFormData({...formData, selection: e.target.value})} />
                    </div>
                    <div>
                      <Label>Odds</Label>
                      <Input placeholder="Ex: 1.90" value={formData.odds} onChange={(e) => setFormData({...formData, odds: e.target.value})} required />
                    </div>
                  </div>

                  {/* SELETOR DE BOOKMAKER */}
                  <div>
                    <Label>Casa de Aposta *</Label>
                    <select 
                      className="w-full p-2 border rounded-md bg-white"
                      value={formData.bookmaker_id}
                      onChange={(e) => setFormData({...formData, bookmaker_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione a casa</option>
                      {bookmakers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Criar Pick</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Lista de Picks à direita (Mantenha seu código original aqui) */}
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
