import { motion } from "framer-motion";
import { Bot, Lock, Sparkles, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const hasThumbnail = !!agent.thumbnail_url;

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
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-secondary/90 text-zinc-900 border-0 shadow-lg backdrop-blur-sm text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {hasThumbnail ? (
            <img
              src={agent.thumbnail_url!}
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
                "w-16 h-16 transition-all duration-300",
                hasAccess ? "text-secondary/60" : "text-zinc-600"
              )} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

          {/* Lock overlay */}
          {!hasAccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40">
              <div className="w-12 h-12 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-600/50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-zinc-400" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category Badge */}
          {agent.category && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs mb-2",
                categoryColors[agent.category.color] || "bg-zinc-700/50 text-zinc-400 border-zinc-600/50"
              )}
            >
              {agent.category.name}
            </Badge>
          )}

          <h3 className={cn(
            "font-semibold mb-1 line-clamp-1 transition-colors",
            hasAccess ? "text-cream group-hover:text-secondary" : "text-zinc-400"
          )}>
            {agent.title}
          </h3>

          {agent.description && (
            <p className="text-cream/50 text-sm line-clamp-2 mb-3">
              {agent.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
            <div className="flex items-center gap-1.5">
              {hasAccess ? (
                <>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-500">Liberado</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Bloqueado</span>
                </>
              )}
            </div>

            <div className={cn(
              "flex items-center gap-1 text-sm font-medium transition-colors",
              hasAccess ? "text-secondary" : "text-zinc-500"
            )}>
              <span>Acessar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
