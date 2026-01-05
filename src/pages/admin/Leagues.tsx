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

interface League {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logo_url: string | null;
  sport: { name: string };
}

interface Sport {
  id: string;
  name: string;
}

const Leagues = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sport_id: "",
    country: "",
    logo_url: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadLeagues();
    loadSports();
  }, []);

  const loadSports = async () => {
    const { data } = await supabase.from("sports").select("id, name").order("name");
    if (data) setSports(data);
  };

  const loadLeagues = async () => {
    const { data } = await supabase
      .from("leagues")
      .select("*, sport:sports(name)")
      .order("name");
    
    if (data) setLeagues(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("leagues")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error updating league");
        return;
      }
      toast.success("League updated successfully");
    } else {
      const { error } = await supabase
        .from("leagues")
        .insert([formData]);

      if (error) {
        toast.error("Error creating league");
        return;
      }
      toast.success("League created successfully");
    }

    setFormData({ name: "", slug: "", sport_id: "", country: "", logo_url: "" });
    setEditingId(null);
    loadLeagues();
  };

  const handleEdit = (league: League) => {
    setFormData({
      name: league.name,
      slug: league.slug,
      sport_id: "",
      country: league.country || "",
      logo_url: league.logo_url || ""
    });
    setEditingId(league.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this league?")) return;

    const { error } = await supabase
      .from("leagues")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting league");
      return;
    }

    toast.success("League deleted successfully");
    loadLeagues();
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
            <h1 className="text-4xl font-bold">Leagues Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit League" : "Create League"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sport_id">Sport</Label>
                    <Select
                      value={formData.sport_id}
                      onValueChange={(value) => setFormData({ ...formData, sport_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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
                          setFormData({ name: "", slug: "", sport_id: "", country: "", logo_url: "" });
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
                <CardTitle>Leagues List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leagues.map((league) => (
                    <div
                      key={league.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{league.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {league.sport.name} • {league.country || "No country"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(league)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(league.id)}
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

export default Leagues;