import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const Sports = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    const { data } = await supabase
      .from("sports")
      .select("*")
      .order("name");
    
    if (data) setSports(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("sports")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error updating sport");
        return;
      }
      toast.success("Sport updated successfully");
    } else {
      const { error } = await supabase
        .from("sports")
        .insert([formData]);

      if (error) {
        toast.error("Error creating sport");
        return;
      }
      toast.success("Sport created successfully");
    }

    setFormData({ name: "", slug: "", icon: "" });
    setEditingId(null);
    loadSports();
  };

  const handleEdit = (sport: Sport) => {
    setFormData({
      name: sport.name,
      slug: sport.slug,
      icon: sport.icon || ""
    });
    setEditingId(sport.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sport?")) return;

    const { error } = await supabase
      .from("sports")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting sport");
      return;
    }

    toast.success("Sport deleted successfully");
    loadSports();
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
            <h1 className="text-4xl font-bold">Sports Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Sport" : "Create Sport"}</CardTitle>
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
                    <Label htmlFor="icon">Icon (emoji or icon class)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
                          setFormData({ name: "", slug: "", icon: "" });
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
                <CardTitle>Sports List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sports.map((sport) => (
                    <div
                      key={sport.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{sport.name}</p>
                        <p className="text-sm text-muted-foreground">{sport.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sport)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(sport.id)}
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

export default Sports;