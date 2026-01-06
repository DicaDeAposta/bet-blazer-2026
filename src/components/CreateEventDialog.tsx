import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Adicionado 'export' no início para resolver o erro da Vercel
export const CreateEventDialog = ({ open, onOpenChange, onEventCreated }) => {
  const [formData, setFormData] = useState({
    sport_id: "",
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "", // Local da partida (Cidade)
    language: "pt",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Removido market_type da validação conforme seu pedido
    if (
      !formData.sport_id ||
      !formData.league_id ||
      !formData.home_team_id ||
      !formData.away_team_id ||
      !formData.event_datetime ||
      !formData.venue
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          sport_id: formData.sport_id,
          league_id: formData.league_id,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          event_datetime: formData.event_datetime,
          venue: formData.venue,
          language: formData.language,
          status: "scheduled",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Erro ao criar evento: " + error.message);
      return;
    }

    toast.success("Evento criado com sucesso!");
    onEventCreated(data.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>ID do Esporte *</Label>
              <Input
                value={formData.sport_id}
                onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                placeholder="Cole o ID do Esporte"
                required
              />
            </div>
            <div>
              <Label>ID da Liga *</Label>
              <Input
                value={formData.league_id}
                onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
                placeholder="Cole o ID da Liga"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>ID Time Casa *</Label>
              <Input
                value={formData.home_team_id}
                onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                placeholder="ID Time Casa"
                required
              />
            </div>
            <div>
              <Label>ID Time Visitante *</Label>
              <Input
                value={formData.away_team_id}
                onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                placeholder="ID Time Visitante"
                required
              />
            </div>
          </div>

          <div>
            <Label>Data e Hora *</Label>
            <Input
              type="datetime-local"
              value={formData.event_datetime}
              onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
              required
            />
          </div>

          {/* Campo Venue conforme solicitado: Texto livre para cidade */}
          <div>
            <Label>Venue (Local da Partida) *</Label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Ex: São Paulo - Morumbi"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Campo livre: aceite letras, números e traços.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">Criar Evento</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
