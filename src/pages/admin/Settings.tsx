import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [colors, setColors] = useState({
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '142 76% 36%',
    secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '221 83% 53%',
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '38 92% 50%',
    pickExpert: getComputedStyle(document.documentElement).getPropertyValue('--pick-expert').trim() || '38 92% 50%',
    pickComputer: getComputedStyle(document.documentElement).getPropertyValue('--pick-computer').trim() || '221 83% 53%',
  });

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const applyColors = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--pick-expert', colors.pickExpert);
    root.style.setProperty('--pick-computer', colors.pickComputer);

    // Save to localStorage
    localStorage.setItem('theme-colors', JSON.stringify(colors));

    toast({
      title: "Tema atualizado!",
      description: "As cores do tema foram aplicadas com sucesso.",
    });
  };

  const resetColors = () => {
    const defaultColors = {
      primary: '142 76% 36%',
      secondary: '221 83% 53%',
      accent: '38 92% 50%',
      pickExpert: '38 92% 50%',
      pickComputer: '221 83% 53%',
    };
    setColors(defaultColors);
    
    const root = document.documentElement;
    root.style.setProperty('--primary', defaultColors.primary);
    root.style.setProperty('--secondary', defaultColors.secondary);
    root.style.setProperty('--accent', defaultColors.accent);
    root.style.setProperty('--pick-expert', defaultColors.pickExpert);
    root.style.setProperty('--pick-computer', defaultColors.pickComputer);

    localStorage.removeItem('theme-colors');

    toast({
      title: "Tema resetado!",
      description: "As cores padrão foram restauradas.",
    });
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
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
            <h1 className="text-3xl font-bold">Configurações de Tema</h1>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Cores do Tema</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Use valores HSL (ex: "142 76% 36%" para verde). As mudanças são aplicadas em tempo real.
            </p>

            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="primary">Cor Primária</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="primary"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    placeholder="142 76% 36%"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colors.primary})` }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="secondary">Cor Secundária</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="secondary"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    placeholder="221 83% 53%"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colors.secondary})` }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accent">Cor de Destaque</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="accent"
                    value={colors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    placeholder="38 92% 50%"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colors.accent})` }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pickExpert">Cor dos Expert Picks</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="pickExpert"
                    value={colors.pickExpert}
                    onChange={(e) => handleColorChange('pickExpert', e.target.value)}
                    placeholder="38 92% 50%"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colors.pickExpert})` }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pickComputer">Cor dos Computer Picks</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="pickComputer"
                    value={colors.pickComputer}
                    onChange={(e) => handleColorChange('pickComputer', e.target.value)}
                    placeholder="221 83% 53%"
                  />
                  <div 
                    className="w-12 h-12 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colors.pickComputer})` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button onClick={applyColors} className="flex-1">
                Aplicar Cores
              </Button>
              <Button onClick={resetColors} variant="outline">
                Resetar Padrão
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
