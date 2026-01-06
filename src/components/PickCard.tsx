import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pick {
  id: string;
  selection: string;
  odds: string;
  odds_format: string;
  analysis: string | null;
  created_at: string;
  // Alterado para refletir o relacionamento com a tabela de eventos
  event?: {
    home_team: { name: string; logo_url: string | null };
    away_team: { name: string; logo_url: string | null };
  };
  market_type?: { name: string; slug: string } | any;
  bookmaker?: any;
  analyst?: { display_name: string; avatar_url: string | null; bio: string | null } | any;
}

interface PickCardProps {
  pick: Pick;
  isAnalysisExpanded: boolean;
  onToggleAnalysis: () => void;
}

export const PickCard = ({ pick, isAnalysisExpanded, onToggleAnalysis }: PickCardProps) => {
  const getHoursAgo = () => {
    try {
      return formatDistanceToNow(new Date(pick.created_at), { addSuffix: false, locale: ptBR });
    } catch (e) {
      return "RECENTE";
    }
  };

  const hoursAgo = getHoursAgo();
  const bkm = pick?.bookmaker || {};
  const affiliateLink = bkm?.affiliate_link || bkm?.affiliate_url || "#";
  const bkmName = bkm?.name || "";
  const bkmSlug = bkm?.slug || "";
  const bkmLogo = bkm?.logo_url || "";

  const getLogo = () => {
    if (typeof bkmSlug === 'string' && bkmSlug.startsWith('http')) return bkmSlug;
    if (bkmLogo) return bkmLogo;
    if (typeof bkmName === 'string' && bkmName.toLowerCase().includes("bet365")) {
      return "https://upload.wikimedia.org/wikipedia/commons/0/07/Bet365_Logo.svg";
    }
    return null;
  };

  const finalLogo = getLogo();

  // Lógica para definir qual logo exibir na esquerda (geralmente o time da casa do evento)
  const displayLogo = pick.event?.home_team?.logo_url || pick.event?.away_team?.logo_url;

  return (
    <article className="p-4 md:p-6 bg-white hover:bg-slate-50 transition-colors border-b">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Coluna 1: Seleção e Evento */}
        <div className="flex items-center gap-4">
          {displayLogo && (
            <div className="h-12 w-12 flex-shrink-0">
              <img 
                src={displayLogo} 
                className="h-full w-full object-contain" 
                alt="team logo"
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {pick.event ? `${pick.event.home_team.name} vs ${pick.event.away_team.name}` : (pick.market_type?.name || "MERCADO")}
            </span>
            <span className="font-black text-lg uppercase leading-tight text-slate-900">
              {pick.selection || "Sem Seleção"}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
              <Clock className="h-3 w-3" />
              <span>{hoursAgo.toUpperCase()} ATRÁS</span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Odds e Botão */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Odds</span>
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[190px] border-2 border-slate-100 rounded-lg overflow-hidden shadow-sm hover:border-orange-500 transition-all group"
          >
            <div className="bg-white py-2 px-3 text-center border-r-2 border-slate-100 group-hover:bg-slate-50">
              <span className="font-black text-lg text-slate-900">{pick.odds || "1.00"}</span>
            </div>
            <div className="flex-1 bg-slate-900 py-2 px-3 flex justify-center items-center group-hover:bg-slate-800 min-h-[44px]">
              {finalLogo ? (
                <img 
                  src={finalLogo} 
                  className="h-6 w-auto max-w-full object-contain brightness-0 invert" 
                  alt="bookmaker"
                  onError={(e) => {
                    (e.target as HTMLImageElement).classList.remove('brightness-0', 'invert');
                  }}
                />
              ) : (
                <span className="text-white text-[10px] font-bold uppercase">Apostar</span>
              )}
            </div>
          </a>
        </div>

        {/* Coluna 3: Expert */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h4 className="font-bold text-sm text-slate-900">
                {pick.analyst?.display_name || "Analista"}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Expert</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-slate-100">
              <AvatarImage src={pick.analyst?.avatar_url || ""} />
              <AvatarFallback>
                {pick.analyst?.display_name ? pick.analyst.display_name.slice(0,2).toUpperCase() : "EX"}
              </AvatarFallback>
            </Avatar>
          </div>
          {pick.analysis && (
            <Button variant="outline" size="sm" onClick={onToggleAnalysis} className="text-[10px] font-bold uppercase h-7">
              Análise <ChevronDown className={`ml-1 h-3 w-3 ${isAnalysisExpanded ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {pick.analysis && isAnalysisExpanded && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border-l-4 border-orange-500 text-sm italic text-slate-700">
          "{pick.analysis}"
        </div>
      )}
    </article>
  );
};
