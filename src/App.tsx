import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { SiteProvider } from "@/hooks/useSiteContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Sites from "./pages/admin/Sites";
import Sports from "./pages/admin/Sports";
import Leagues from "./pages/admin/Leagues";
import Teams from "./pages/admin/Teams";
import Events from "./pages/admin/Events";
import Picks from "./pages/admin/Picks";
import Analysts from "./pages/admin/Analysts";
import Bookmakers from "./pages/admin/Bookmakers";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SiteProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/sites" element={<Sites />} />
              <Route path="/admin/sports" element={<Sports />} />
              <Route path="/admin/leagues" element={<Leagues />} />
            <Route path="/admin/teams" element={<Teams />} />
            <Route path="/admin/events" element={<Events />} />
          <Route path="/admin/picks" element={<Picks />} />
          <Route path="/admin/analysts" element={<Analysts />} />
          <Route path="/admin/bookmakers" element={<Bookmakers />} />
            <Route path="/admin/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
