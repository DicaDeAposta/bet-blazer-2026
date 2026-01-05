import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Globe, Plus, Pencil, Trash2, ArrowLeft, Copy, Code } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  primary_color: string;
  display_name: string;
  is_active: boolean;
  categories: string[];
}

export default function Sites() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    domain: "",
    primary_color: "#1EAEDB",
    display_name: "Picks Manager",
    categories: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setSites(data.map(s => ({ ...s, categories: s.categories || [] })));
      }
    } catch (error) {
      console.error("Error loading sites:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const categoriesArray = formData.categories
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    try {
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        domain: formData.domain || null,
        primary_color: formData.primary_color,
        display_name: formData.display_name,
        categories: categoriesArray,
      };

      if (editingId) {
        const { error } = await supabase
          .from("sites")
          .update(submitData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Site updated successfully!" });
      } else {
        const { error } = await supabase.from("sites").insert([submitData]);
        if (error) throw error;
        toast({ title: "Site created successfully!" });
      }

      setFormData({ name: "", slug: "", domain: "", primary_color: "#1EAEDB", display_name: "Picks Manager", categories: "" });
      setEditingId(null);
      loadSites();
    } catch (error: any) {
      toast({
        title: "Error saving site",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (site: Site) => {
    setFormData({
      name: site.name,
      slug: site.slug,
      domain: site.domain || "",
      primary_color: site.primary_color,
      display_name: site.display_name || "Picks Manager",
      categories: (site.categories || []).join(", "),
    });
    setEditingId(site.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return;

    const { error } = await supabase.from("sites").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting site",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Site deleted successfully!" });
      loadSites();
    }
  };

  const toggleExpand = (siteId: string) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const getSiteEmbedCode = (siteId: string) => {
    return `<div id="site-picks-${siteId}"></div>
<script>
(function(){
  var d=document,s=d.createElement('script');
  s.src='${supabaseUrl}/functions/v1/embed-site?id=${siteId}';
  s.onload=function(){};
  fetch('${supabaseUrl}/functions/v1/embed-site?id=${siteId}')
    .then(r=>r.text())
    .then(h=>{d.getElementById('site-picks-${siteId}').innerHTML=h;});
})();
</script>`;
  };

  const copySiteEmbedCode = (siteId: string) => {
    navigator.clipboard.writeText(getSiteEmbedCode(siteId));
    toast({ title: "Site embed code copied to clipboard!" });
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />

        <div className="container py-8">
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Sites</h1>
              <p className="text-muted-foreground text-lg">Configure sites and get embed codes for WordPress</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingId ? "Edit Site" : "New Site"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Site Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Football Tips BR"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="football-tips-br"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="domain">Site URL (optional)</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="https://footballtips.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Picks Manager"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categories">Categories (comma-separated)</Label>
                    <Textarea
                      id="categories"
                      value={formData.categories}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                      placeholder="Bundesliga, Premier League, NBA, NFL"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Picks matching these categories will be available for this site
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#1EAEDB"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Saving..." : editingId ? "Update" : "Create Site"}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ name: "", slug: "", domain: "", primary_color: "#1EAEDB", display_name: "Picks Manager", categories: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Sites ({sites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sites.map((site) => (
                    <div key={site.id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: site.primary_color }}
                          />
                          <div>
                            <p className="font-medium">{site.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {site.domain || `/${site.slug}`}
                            </p>
                            {site.categories?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {site.categories.map((cat, i) => (
                                  <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpand(site.id)}
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(site)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(site.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {expandedSite === site.id && (
                        <div className="border-t bg-muted/30 p-4">
                          <p className="text-sm font-medium mb-3">Global Site Embed Code</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Copy and paste this HTML into any WordPress post or page. All picks assigned to this site will display automatically.
                          </p>
                          <div className="bg-background p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-sm">Embed for: {site.name}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copySiteEmbedCode(site.id)}
                                className="gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </Button>
                            </div>
                            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto whitespace-pre-wrap">
                              {getSiteEmbedCode(site.id)}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {sites.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No sites created yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
