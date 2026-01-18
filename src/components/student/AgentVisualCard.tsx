import { motion } from "framer-motion";
import { Bot, Lock, Sparkles, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import all agent images
import agentComportamental from "@/assets/agents/agent-comportamental.png";
import agentConteudos from "@/assets/agents/agent-conteudos.png";
import agentVendasFunis from "@/assets/agents/agent-vendas-funis.png";
import agentEstrategia from "@/assets/agents/agent-estrategia.png";
import agentPropostas from "@/assets/agents/agent-propostas.png";
import agentPecas from "@/assets/agents/agent-pecas.png";
import agentAgenda from "@/assets/agents/agent-agenda.png";
import agentTrafego from "@/assets/agents/agent-trafego.png";
import agentPeticoes from "@/assets/agents/agent-peticoes.png";
import agentArtigos from "@/assets/agents/agent-artigos.png";
import agentVendasImob from "@/assets/agents/agent-vendas-imob.png";
import agentEstrategiaNicho from "@/assets/agents/agent-estrategia-nicho.png";
import agentMapaImobiliario from "@/assets/agents/agent-mapa-imobiliario.png";

interface AgentCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface Agent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  category?: AgentCategory;
}

interface AgentVisualCardProps {
  agent: Agent;
  hasAccess: boolean;
  onClick: () => void;
}

// Map slug to local image - using actual database slugs
const agentImages: Record<string, string> = {
  "assistente-comportamental": agentComportamental,
  "especialista-conteudos": agentConteudos,
  "vendas-funis": agentVendasFunis,
  "estrategia-nicho": agentEstrategia,
  "criador-propostas": agentPropostas,
  "expert-pecas": agentPecas,
  "organizacao-agenda": agentAgenda,
  "gestora-trafego": agentTrafego,
  "peticoes-pecas": agentPeticoes,
  "criacao-artigos": agentArtigos,
  "vendas-imobiliaria": agentVendasImob,
  "estrategica-de-nicho-para-advogadas": agentEstrategiaNicho,
  "ia-mapa-imobiliario": agentMapaImobiliario,
};

const categoryColors: Record<string, string> = {
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

// Gradient fallbacks for agents without thumbnail
const gradientFallbacks = [
  "from-purple-900/80 via-purple-800/60 to-zinc-900",
  "from-amber-900/80 via-amber-800/60 to-zinc-900",
  "from-emerald-900/80 via-emerald-800/60 to-zinc-900",
  "from-blue-900/80 via-blue-800/60 to-zinc-900",
  "from-rose-900/80 via-rose-800/60 to-zinc-900",
  "from-orange-900/80 via-orange-800/60 to-zinc-900",
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export function AgentVisualCard({ agent, hasAccess, onClick }: AgentVisualCardProps) {
  const gradientIndex = agent.title.charCodeAt(0) % gradientFallbacks.length;
  
  // Use local image if available, otherwise use thumbnail_url from DB
  const imageSource = agentImages[agent.slug] || agent.thumbnail_url;
  const hasThumbnail = !!imageSource;

  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full text-left group"
    >
      {/* Shimmer border effect */}
      <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/50 to-transparent animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className={cn(
        "relative bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 rounded-xl overflow-hidden border transition-all duration-300",
        hasAccess
          ? "border-secondary/30 group-hover:border-secondary/50 group-hover:shadow-[0_0_20px_rgba(166,144,97,0.15)]"
          : "border-zinc-700/50 group-hover:border-zinc-600/50"
      )}>
        {/* Featured Badge */}
        {agent.is_featured && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <Badge className="bg-secondary/90 text-zinc-900 border-0 shadow-lg backdrop-blur-sm text-[9px] px-1 py-0">
              <Sparkles className="w-2 h-2 mr-0.5" />
              Destaque
            </Badge>
          </div>
        )}

        {/* Image Container - Compact square */}
        <div className="relative aspect-square overflow-hidden">
          {hasThumbnail ? (
            <img
              src={imageSource!}
              alt={agent.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                !hasAccess && "grayscale brightness-50"
              )}
            />
          ) : (
            <div className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center",
              gradientFallbacks[gradientIndex]
            )}>
              <Bot className={cn(
                "w-8 h-8 transition-all duration-300",
                hasAccess ? "text-secondary/60" : "text-zinc-600"
              )} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

          {/* Lock overlay */}
          {!hasAccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40">
              <div className="w-8 h-8 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-600/50 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </div>
          )}
        </div>

        {/* Content - Ultra compact */}
        <div className="p-2">
          {/* Category Badge */}
          {agent.category && (
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] mb-1 px-1 py-0",
                categoryColors[agent.category.color] || "bg-zinc-700/50 text-zinc-400 border-zinc-600/50"
              )}
            >
              {agent.category.name}
            </Badge>
          )}

          <h3 className={cn(
            "font-semibold text-xs mb-0.5 line-clamp-1 transition-colors",
            hasAccess ? "text-cream group-hover:text-secondary" : "text-zinc-400"
          )}>
            {agent.title}
          </h3>

          {agent.description && (
            <p className="text-cream/50 text-[10px] line-clamp-1 mb-1.5">
              {agent.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-700/50">
            <div className="flex items-center gap-0.5">
              {hasAccess ? (
                <>
                  <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[9px] text-emerald-500">Liberado</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-zinc-500" />
                  <span className="text-[9px] text-zinc-500">Bloqueado</span>
                </>
              )}
            </div>

            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-medium transition-colors",
              hasAccess ? "text-secondary" : "text-zinc-500"
            )}>
              <span>Acessar</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Premium glow */}
        {hasAccess && (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
      </div>
    </motion.button>
  );
}

export default AgentVisualCard;
