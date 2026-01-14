import { Bot, Lock, Sparkles, ChevronRight } from "lucide-react";
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

interface AgentCardProps {
  agent: Agent;
  hasAccess: boolean;
  onClick: () => void;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
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

export function AgentCard({ agent, hasAccess, onClick, iconMap }: AgentCardProps) {
  const IconComponent = iconMap[agent.icon] || Bot;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-xl border transition-all duration-300 group",
        "bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm",
        hasAccess
          ? "border-secondary/30 hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(166,144,97,0.15)]"
          : "border-zinc-700/50 hover:border-zinc-600/50 opacity-80 hover:opacity-100"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105",
            hasAccess
              ? "bg-secondary/20 border-secondary/30"
              : "bg-zinc-700/50 border-zinc-600/50"
          )}
        >
          <IconComponent
            className={cn(
              "w-6 h-6",
              hasAccess ? "text-secondary" : "text-zinc-400"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "font-semibold truncate",
                hasAccess ? "text-cream" : "text-zinc-300"
              )}
            >
              {agent.title}
            </h3>
            {agent.is_featured && (
              <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
            )}
          </div>

          {agent.description && (
            <p className="text-cream/60 text-sm line-clamp-2 mb-3">
              {agent.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            {agent.category && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  categoryColors[agent.category.color] || "bg-zinc-700/50 text-zinc-400 border-zinc-600/50"
                )}
              >
                {agent.category.name}
              </Badge>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              {hasAccess ? (
                <>
                  <span className="text-xs text-secondary">Acessar</span>
                  <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Bloqueado</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
