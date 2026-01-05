import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2, ArrowLeft, Plus, Copy } from "lucide-react";
import { CreateEventDialog } from "@/components/CreateEventDialog";

interface Pick {
  id: string;
  selection: string;
  odds: string;
  analysis: string;
  category: string | null;
  event: { home_team: { name: string }; away_team: { name: string } };
  market_type: { name: string };
  bookmaker: { name: string };
}

interface Event {
  id: string;
  home_team: { name: string };
  away_team: { name: string };
  event_datetime: string;
}

interface Bookmaker {
  id: string;
  name: string;
}

interface AnalystProfile {
  id: string;
  display_name: string;
}

interface Site {
  id: string;
  name: string;
  categories: string[];
}

const Picks = () => {
  const navigate = useNavigate();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [analysts, setAnalysts] = useState<AnalystProfile[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    event_id: "",
    analyst_id: "",
    market_type: "",
    selection: "",
    odds: "",
    odds_format: "american" as "american" | "decimal" | "fractional",
    bookmaker_id: "",
    analysis: "",
    confidence_level: "3",
    category: "",
    selected_sites: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    loadPicks();
    loadEvents();
    loadBookmakers();
    loadAnalysts();
    loadSites();
  }, []);

  const loadSites = async () => {
    const { data } = await supabase
      .from("sites")
      .select("id, name, categories")
      .eq("is_active", true)
      .order("name");
    if (data) setSites(data.map(s => ({ ...s, categories: s.categories || [] })));
  };

  const loadAnalysts = async () => {
    const { data } = await supabase
      .from("analyst_profiles")
      .select("id, display_name")
      .order("display_name");
    if (data) setAnalysts(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        id,
        event_datetime,
        home_team:teams!events_home_team_id_fkey(name),
        away_team:teams!events_away_team_id_fkey(name)
      `)
      .gte("event_datetime", new Date().toISOString())
      .order("event_datetime");
    if (data) setEvents(data as any);
  };

  const loadBookmakers = async () => {
    const { data } = await supabase
      .from("bookmakers_public")
      .select("id, name")
      .order("name");
    if (data) setBookmakers(data);
  };

  const loadPicks = async () => {
    try {
      const { data, error } = await supabase
        .from("picks")
        .select(`
          *,
          event:events(
            home_team:teams!events_home_team_id_fkey(name),
            away_team:teams!events_away_team_id_fkey(name)
          ),
          market_type:market_types(name),
          bookmaker:bookmakers(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error loading picks:", error);
        return;
      }
      if (data) setPicks(data as any);
    } catch (error) {
      console.error("Error loading picks:", error);
    }
  };

  const generateAIAnalysis = async () => {
    if (!formData.event_id || !formData.market_type) {
      toast.error("Please fill event and market type first");
      return;
    }

    // Here we provide a simple placeholder analysis
    const event = events.find(e => e.id === formData.event_id);
    const simpleAnalysis = `This is a simple analysis of ${event?.home_team.name} vs ${event?.away_team.name}, Market: ${formData.market_type}`;

    setFormData(prev => ({ ...prev, analysis: simpleAnalysis }));
    toast.success("AI analysis generated!");
  };

  const handleEventCreated = (eventId: string) => {
    setFormData({ ...formData, event_id: eventId });
    loadEvents();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.event_id) {
      toast.error("Please select an event");
      return;
    }
    if (!formData.analyst_id) {
      toast.error("Please select an analyst");
      return;
    }
    if (!formData.bookmaker_id) {
      toast.error("Please select a bookmaker");
      return;
    }
    if (!formData.market_type) {
      toast.error("Please enter a market type");
      return;
    }

    // Find or create market type
    let market_type_id = "";
    const { data: existingMarketType } = await supabase
      .from("market_types")
      .select("id")
      .eq("name", formData.market_type)
      .maybeSingle();

    if (existingMarketType) {
      market_type_id = existingMarketType.id;
    } else {
      const slug = formData.market_type.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: newMarketType, error: marketError } = await supabase
        .from("market_types")
        .insert([{ name: formData.market_type, slug, language: 'en' }])
        .select()
        .single();

      if (marketError || !newMarketType) {
        toast.error("Error creating market type");
        console.error(marketError);
        return;
      }
      market_type_id = newMarketType.id;
    }

    const submitData = {
      event_id: formData.event_id,
      analyst_id: formData.analyst_id,
      market_type_id,
      selection: formData.selection || null,
      odds: parseFloat(formData.odds) || 0,
      odds_format: formData.odds_format,
      bookmaker_id: formData.bookmaker_id,
      analysis: formData.analysis || null,
      confidence_level: formData.confidence_level ? parseInt(formData.confidence_level) : null,
      category: formData.category || null,
      language: 'en'
    };

    let pickId = editingId;

    if (editingId) {
      const { error } = await supabase
        .from("picks")
        .update(submitData)
        .eq("id", editingId);

      if (error) {
        console.error("Error updating pick:", error);
        toast.error(`Error updating pick: ${error.message}`);
        return;
      }
    } else {
      const { data: newPick, error } = await supabase
        .from("picks")
        .insert([submitData])
        .select()
        .single();

      if (error || !newPick) {
        console.error("Error creating pick:", error);
        toast.error(`Error creating pick: ${error?.message}`);
        return;
      }
      pickId = newPick.id;
    }

    // Handle site assignments
    if (pickId) {
      await supabase.from("pick_sites").delete().eq("pick_id", pickId);

      if (formData.selected_sites.length > 0) {
        const siteInserts = formData.selected_sites.map(site_id => ({
          pick_id: pickId,
          site_id
        }));
        await supabase.from("pick_sites").insert(siteInserts);
      }
    }

    toast.success(editingId ? "Pick updated successfully" : "Pick created successfully");

    setFormData({
      event_id: "",
      analyst_id: "",
      market_type: "",
      selection: "",
      odds: "",
      odds_format: "american",
      bookmaker_id: "",
      analysis: "",
      confidence_level: "3",
      category: "",
      selected_sites: []
    });
    setEditingId(null);
    loadPicks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pick?")) return;

    const { error } = await supabase
      .from("picks")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting pick");
      return;
    }

    toast.success("Pick deleted successfully");
    loadPicks();
  };

  const getEmbedCode = (pickId: string) => {
    return `<iframe src="${supabaseUrl}/functions/v1/embed-pick?id=${pickId}" width="420" height="300" frameborder="0" style="border-radius:12px;"></iframe>`;
  };

  const copyEmbedCode = (pickId: string) => {
    navigator.clipboard.writeText(getEmbedCode(pickId));
    toast.success("Embed code copied!");
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
            <h1 className="text-4xl font-bold">Picks Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Pick" : "Create Pick"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="event_id">Event *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEventDialogOpen(true)}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        New Event
                      </Button>
                    </div>
                    <Input
                      value={formData.event_id}
                      onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                      placeholder="Select event"
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

                  <div>
                    <Label htmlFor="selection">Selection (optional)</Label>
                    <Input
                      id="selection"
                      value={formData.selection}
                      onChange={(e) => setFormData({ ...formData, selection: e.target.value })}
                      placeholder="e.g., Joe Flacco"
                    />
                  </div>

                  <div>
                    <Label htmlFor="odds">Odds</Label>
                    <Input
                      id="odds"
                      type="text"
                      value={formData.odds}
                      onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                      placeholder="e.g., -115"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bookmaker_id">Bookmaker *</Label>
                    <Input
                      value={formData.bookmaker_id}
                      onChange={(e) => setFormData({ ...formData, bookmaker_id: e.target.value })}
                      placeholder="Select bookmaker"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="analysis">Analysis</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIAnalysis}
                        disabled={isGeneratingAI}
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate with AI"
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="analysis"
                      value={formData.analysis}
                      onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confidence_level">Confidence Level (1-5)</Label>
                    <Input
                      id="confidence_level"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.confidence_level}
                      onChange={(e) => setFormData({ ...formData, confidence_level: e.target.value })}
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
                          setFormData({
                            event_id: "",
                            analyst_id: "",
                            market_type: "",
                            selection: "",
                            odds: "",
                            odds_format: "american",
                            bookmaker_id: "",
                            analysis: "",
                            confidence_level: "3",
                            category: "",
                            selected_sites: []
                          });
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
                <CardTitle>Picks List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {picks.map((pick) => (
                    <div
                      key={pick.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {pick.event?.home_team?.name} vs {pick.event?.away_team?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pick.market_type?.name} • {pick.selection} • {pick.odds} @ {pick.bookmaker?.name}
                          </p>
                          {pick.category && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                              {pick.category}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyEmbedCode(pick.id)}
                            title="Copy embed code"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(pick.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
