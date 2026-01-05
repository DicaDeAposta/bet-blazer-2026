import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  display_name: string;
  is_active: boolean;
}

interface SiteContextType {
  currentSite: Site | null;
  loading: boolean;
  allSites: Site[];
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    // Carregar todos os sites
    const { data: sites } = await supabase
      .from("sites")
      .select("*")
      .eq("is_active", true);

    if (sites) {
      setAllSites(sites);

      // Detectar site atual baseado no domínio
      const currentDomain = window.location.hostname;
      const site = sites.find(s => s.domain === currentDomain);
      
      // Se não encontrar por domínio, usar o primeiro site ou null
      setCurrentSite(site || sites[0] || null);
    }

    setLoading(false);
  };

  return (
    <SiteContext.Provider value={{ currentSite, loading, allSites }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSiteContext must be used within a SiteProvider");
  }
  return context;
}
