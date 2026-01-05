import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";

interface Bookmaker {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  affiliate_link: string | null;
  is_active: boolean;
}

const Bookmakers = () => {
  const navigate = useNavigate();
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    affiliate_link: "",
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookmakers();
  }, []);

  const loadBookmakers = async () => {
    const { data } = await supabase
      .from("bookmakers")
      .select("*")
      .order("name");
    
    if (data) setBookmakers(data);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('bookmaker-logos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('bookmaker-logos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logo_url = null;
    if (logoFile) {
      logo_url = await uploadLogo(logoFile);
      if (!logo_url) {
        toast.error("Failed to upload logo");
        return;
      }
    }

    const slug = formData.slug || generateSlug(formData.name);

    const submitData: any = {
      name: formData.name,
      slug,
      affiliate_link: formData.affiliate_link || null,
      is_active: formData.is_active,
    };

    if (logo_url) {
      submitData.logo_url = logo_url;
    }

    if (editingId) {
      const { error } = await supabase
        .from("bookmakers")
        .update(submitData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error updating bookmaker");
        return;
      }
      toast.success("Bookmaker updated successfully");
    } else {
      const { error } = await supabase
        .from("bookmakers")
        .insert([submitData]);

      if (error) {
        toast.error("Error creating bookmaker");
        return;
      }
      toast.success("Bookmaker created successfully");
    }

    setFormData({ name: "", slug: "", affiliate_link: "", is_active: true });
    setLogoFile(null);
    setEditingId(null);
    loadBookmakers();
  };

  const handleEdit = (bookmaker: Bookmaker) => {
    setFormData({
      name: bookmaker.name,
      slug: bookmaker.slug,
      affiliate_link: bookmaker.affiliate_link || "",
      is_active: bookmaker.is_active,
    });
    setEditingId(bookmaker.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bookmaker?")) return;

    const { error } = await supabase
      .from("bookmakers")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting bookmaker");
      return;
    }

    toast.success("Bookmaker deleted successfully");
    loadBookmakers();
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
            <h1 className="text-4xl font-bold">Bookmakers Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Bookmaker" : "Create Bookmaker"}</CardTitle>
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
                    <Label htmlFor="slug">Slug (auto-generated if empty)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder={generateSlug(formData.name)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo">Logo Image</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="affiliate_link">Affiliate Link</Label>
                    <Input
                      id="affiliate_link"
                      type="url"
                      value={formData.affiliate_link}
                      onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                      placeholder="https://bookmaker.com/ref/yourcode"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
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
                          setFormData({ name: "", slug: "", affiliate_link: "", is_active: true });
                          setLogoFile(null);
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
                <CardTitle>Bookmakers List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {bookmakers.map((bookmaker) => (
                    <div
                      key={bookmaker.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {bookmaker.logo_url && (
                          <img 
                            src={bookmaker.logo_url} 
                            alt={bookmaker.name}
                            className="w-10 h-10 object-contain"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{bookmaker.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {bookmaker.is_active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(bookmaker)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(bookmaker.id)}
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

export default Bookmakers;
