import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Mantivemos o Input para os campos
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
// Importações corrigidas para resolver o erro "Select is not defined"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateEventDialog = ({ open, onOpenChange, onEventCreated }) => {
  const [formData, setFormData] = useState({
    sport_id: "",
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    event_datetime: "",
    venue: "", // Campo para o local da partida
    language: "pt",
    market_type: "", // Campo para o tipo de mercado
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificação dos campos obrigatórios
    if (
      !formData.sport_id ||
      !formData.league_id ||
      !formData.home_team_id ||
      !formData.away_team_id ||
      !formData.event_datetime ||
      !formData.market_type || // Verificação do Market Type
      !formData.venue
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Inserção no banco de dados
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          sport_id: formData.sport_id,
          league_id: formData.league_id,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          event_datetime: formData.event_datetime,
          venue: formData.venue, // Local da partida
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
          <DialogTitle>Criar Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Esporte */}
          <div>
            <Label>Esporte *</Label>
            <Input
              value={formData.sport_id}
              onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
              placeholder="Selecione o esporte"
              required
            />
          </div>

          {/* Liga */}
          <div>
            <Label>Liga *</Label>
            <Input
              value={formData.league_id}
              onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
              disabled={!formData.sport_id}
              placeholder="Selecione a liga"
              required
            />
          </div>

          {/* Time da Casa */}
          <div>
            <Label>Time da Casa *</Label>
            <Input
              value={formData.home_team_id}
              onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
              disabled={!formData.league_id}
              placeholder="Selecione o time da casa"
              required
            />
          </div>

          {/* Time Visitante */}
          <div>
            <Label>Time Visitante *</Label>
            <Input
              value={formData.away_team_id}
              onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
              disabled={!formData.league_id}
              placeholder="Selecione o time visitante"
              required
            />
          </div>

          {/* Data e Hora */}
          <div>
            <Label htmlFor="event_datetime">Data e Hora *</Label>
            <Input
              id="event_datetime"
              type="datetime-local"
              value={formData.event_datetime}
              onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
              required
            />
          </div>

          {/* Tipo de Mercado */}
          <div>
            <Label htmlFor="market_type">Tipo de Mercado *</Label>
            <Input
              id="market_type"
              value={formData.market_type}
              onChange={(e) => setFormData({ ...formData, market_type: e.target.value })}
              placeholder="Ex: Vencedor do Encontro"
              required
            />
          </div>

          {/* Local da Partida */}
          <div>
            <Label>Local da Partida *</Label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Nome da Cidade"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Criar Evento</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
