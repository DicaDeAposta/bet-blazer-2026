import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAnalyst?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireAnalyst }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [user, loading]);

  // Note: This is a UI convenience check for better user experience.
  // Actual authorization is enforced server-side via RLS policies on all tables.
  // This prevents showing unauthorized pages, but cannot be bypassed to access protected data.
  const checkAccess = async () => {
    if (loading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    if (requireAdmin || requireAnalyst) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roles = data?.map(r => r.role) || [];

      if (requireAdmin && !roles.includes("admin")) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de administrador",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (requireAnalyst && !roles.includes("analyst") && !roles.includes("admin")) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de analista",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
    }

    setHasAccess(true);
    setChecking(false);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
}
