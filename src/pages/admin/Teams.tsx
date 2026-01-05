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

interface Team {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  logo_url: string | null;
  league: { name: string };
}

interface League {
  id: string;
  name: string;
}

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    league_id: "",
    short_name: "",
    logo_url: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    const { data } = await supabase.from("leagues").select("id, name").order("name");
    if (data) setLeagues(data);
  };

  const loadTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*, league:leagues(name)")
      .order("name");
    
    if (data) setTeams(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("teams")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error updating team");
        return;
      }
      toast.success("Team updated successfully");
    } else {
      const { error } = await supabase
        .from("teams")
        .insert([formData]);

      if (error) {
        toast.error("Error creating team");
        return;
      }
      toast.success("Team created successfully");
    }

    setFormData({ name: "", slug: "", league_id: "", short_name: "", logo_url: "" });
    setEditingId(null);
    loadTeams();
  };

  const handleEdit = (team: Team) => {
    setFormData({
      name: team.name,
      slug: team.slug,
      league_id: "",
      short_name: team.short_name || "",
      logo_url: team.logo_url || ""
    });
    setEditingId(team.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting team");
      return;
    }

    toast.success("Team deleted successfully");
    loadTeams();
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
            <h1 className="text-4xl font-bold">Teams Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Team" : "Create Team"}</CardTitle>
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
                    <Label htmlFor="short_name">Short Name</Label>
                    <Input
                      id="short_name"
                      value={formData.short_name}
                      onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    />
                  </div>

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
                          setFormData({ name: "", slug: "", league_id: "", short_name: "", logo_url: "" });
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
                <CardTitle>Teams List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{team.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.league.name} • {team.short_name || team.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(team)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(team.id)}
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

export default Teams;