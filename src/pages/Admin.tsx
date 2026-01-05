import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, TrendingUp, Users, Globe, Settings, Building2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPicks: 0,
    totalSports: 0,
    totalAnalysts: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    const [events, picks, sports, analysts] = await Promise.all([
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("picks").select("id", { count: "exact", head: true }),
      supabase.from("sports").select("id", { count: "exact", head: true }),
      supabase.from("analyst_profiles").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      totalEvents: events.count || 0,
      totalPicks: picks.count || 0,
      totalSports: sports.count || 0,
      totalAnalysts: analysts.count || 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <div className="container py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        
        <div className="container py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
              <p className="text-muted-foreground text-lg">Gerencie eventos, picks e análises</p>
            </div>
            <Button asChild>
              <Link to="/admin/sites">
                <Globe className="mr-2 h-4 w-4" />
                Gerenciar Sites
              </Link>
            </Button>
          </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Picks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPicks}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Esportes</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSports}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Analistas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalysts}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gerenciamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/sites">
                  <Globe className="mr-2 h-4 w-4" />
                  Sites Multisite
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/sports">
                  <Trophy className="mr-2 h-4 w-4" />
                  Esportes
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/leagues">
                  <Trophy className="mr-2 h-4 w-4" />
                  Ligas
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/teams">
                  <Users className="mr-2 h-4 w-4" />
                  Times
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  Eventos
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/picks">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Picks
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/analysts">
                  <Users className="mr-2 h-4 w-4" />
                  Analistas
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/bookmakers">
                  <Building2 className="mr-2 h-4 w-4" />
                  Bookmakers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações de Tema
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Funcionalidades Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-green-600">
                <li>✅ Sistema multisite completo</li>
                <li>✅ Autenticação e roles (admin/analyst)</li>
                <li>✅ Gerenciamento de esportes, ligas e times</li>
                <li>✅ Criação e edição de eventos</li>
                <li>✅ Sistema completo de picks com análises</li>
                <li>✅ Gerenciamento de analistas com avatars</li>
                <li>✅ Gerenciamento de bookmakers com logos</li>
                <li>✅ Market types editáveis (texto livre)</li>
                <li>✅ Geração de análises via IA (Lovable AI)</li>
                <li>✅ Plugin WordPress para integração</li>
                <li>✅ Configuração de cores e tema personalizável</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
