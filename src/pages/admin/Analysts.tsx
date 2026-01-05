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
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Analyst {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  twitter_handle: string | null;
  website: string | null;
}

const Analysts = () => {
  const navigate = useNavigate();
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    twitter_handle: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysts();
  }, []);

  const loadAnalysts = async () => {
    const { data } = await supabase
      .from("analyst_profiles")
      .select("id, display_name, bio, avatar_url, twitter_handle, website")
      .order("display_name");
    
    if (data) setAnalysts(data);
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('analyst-avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('analyst-avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let avatar_url = null;
    if (avatarFile) {
      avatar_url = await uploadAvatar(avatarFile);
      if (!avatar_url) {
        toast.error("Failed to upload avatar");
        return;
      }
    }

    const submitData: any = {
      display_name: formData.display_name,
      bio: formData.bio || null,
      twitter_handle: formData.twitter_handle || null,
      website: formData.website || null,
    };

    if (avatar_url) {
      submitData.avatar_url = avatar_url;
    }

    if (editingId) {
      const { error } = await supabase
        .from("analyst_profiles")
        .update(submitData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error updating analyst");
        return;
      }
      toast.success("Analyst updated successfully");
    } else {
      // For new analysts, we need to get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase
        .from("analyst_profiles")
        .insert([{ ...submitData, user_id: user.id }]);

      if (error) {
        toast.error("Error creating analyst: " + error.message);
        return;
      }
      toast.success("Analyst created successfully");
    }

    setFormData({ display_name: "", bio: "", twitter_handle: "", website: "" });
    setAvatarFile(null);
    setEditingId(null);
    loadAnalysts();
  };

  const handleEdit = (analyst: Analyst) => {
    setFormData({
      display_name: analyst.display_name,
      bio: analyst.bio || "",
      twitter_handle: analyst.twitter_handle || "",
      website: analyst.website || "",
    });
    setEditingId(analyst.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analyst?")) return;

    const { error } = await supabase
      .from("analyst_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting analyst");
      return;
    }

    toast.success("Analyst deleted successfully");
    loadAnalysts();
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
            <h1 className="text-4xl font-bold">Analysts Management</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Analyst" : "Create Analyst"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="avatar">Avatar Image</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter_handle">Twitter Handle</Label>
                    <Input
                      id="twitter_handle"
                      value={formData.twitter_handle}
                      onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
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
                          setFormData({ display_name: "", bio: "", twitter_handle: "", website: "" });
                          setAvatarFile(null);
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
                <CardTitle>Analysts List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {analysts.map((analyst) => (
                    <div
                      key={analyst.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={analyst.avatar_url || undefined} />
                          <AvatarFallback>{analyst.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{analyst.display_name}</p>
                          {analyst.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{analyst.bio}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(analyst)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(analyst.id)}
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

export default Analysts;
