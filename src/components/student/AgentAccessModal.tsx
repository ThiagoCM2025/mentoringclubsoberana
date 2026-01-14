import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, ExternalLink, Lock, Sparkles, Target, Info } from "lucide-react";
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
  full_description: string | null;
  objective: string | null;
  icon: string;
  thumbnail_url: string | null;
  external_url: string;
  is_featured: boolean;
  category?: AgentCategory;
}

interface AgentAccessModalProps {
  agent: Agent;
  hasAccess: boolean;
  onClose: () => void;
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

export function AgentAccessModal({
  agent,
  hasAccess,
  onClose,
  iconMap,
}: AgentAccessModalProps) {
  const IconComponent = iconMap[agent.icon] || Bot;

  const handleOpenAgent = () => {
    window.open(agent.external_url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-secondary/20 text-cream max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center border shrink-0",
                hasAccess
                  ? "bg-secondary/20 border-secondary/30"
                  : "bg-zinc-700/50 border-zinc-600/50"
              )}
            >
              <IconComponent
                className={cn(
                  "w-7 h-7",
                  hasAccess ? "text-secondary" : "text-zinc-400"
                )}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-xl font-serif text-cream">
                  {agent.title}
                </DialogTitle>
                {agent.is_featured && (
                  <Sparkles className="w-4 h-4 text-secondary" />
                )}
              </div>
              {agent.category && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    categoryColors[agent.category.color] || ""
                  )}
                >
                  {agent.category.name}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          {agent.description && (
            <p className="text-cream/70">{agent.description}</p>
          )}

          {/* Objective */}
          {agent.objective && (
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-cream">Objetivo</span>
              </div>
              <p className="text-cream/70 text-sm">{agent.objective}</p>
            </div>
          )}

          {/* Full Description */}
          {agent.full_description && (
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-cream">
                  Como Usar
                </span>
              </div>
              <p className="text-cream/70 text-sm whitespace-pre-line">
                {agent.full_description}
              </p>
            </div>
          )}

          {/* Action */}
          <div className="pt-4">
            {hasAccess ? (
              <Button
                onClick={handleOpenAgent}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no ChatGPT
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <Lock className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                  <p className="text-cream/60 text-sm">
                    Este assistente está bloqueado para sua conta.
                  </p>
                  <p className="text-cream/40 text-xs mt-1">
                    Entre em contato com a equipe Soberana para liberar o acesso.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-zinc-700 text-cream hover:bg-zinc-800"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
