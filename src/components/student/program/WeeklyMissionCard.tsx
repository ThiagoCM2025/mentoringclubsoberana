import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Target, 
  Lightbulb, 
  Gift, 
  CheckCircle2, 
  Clock,
  Send,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WeeklyMission {
  id: string;
  week_number: number;
  month_number: number;
  month_title: string | null;
  title: string;
  challenge_description: string;
  why_do: string | null;
  gamification_emoji: string;
  gamification_title: string | null;
  gamification_reward: string | null;
  xp_reward: number;
  requires_proof: boolean;
}

interface WeeklyMissionCardProps {
  mission: WeeklyMission;
  userCompletion?: {
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    xp_earned: number;
  } | null;
  onSubmit: () => void;
  isCurrentWeek: boolean;
}

export const WeeklyMissionCard = ({
  mission,
  userCompletion,
  onSubmit,
  isCurrentWeek
}: WeeklyMissionCardProps) => {
  const status = userCompletion?.status;
  const isCompleted = status === 'approved';
  const isSubmitted = status === 'submitted' || status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Glow effect for current week */}
      {isCurrentWeek && !isCompleted && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-1 bg-secondary/20 rounded-2xl blur-xl"
        />
      )}

      <Card className={cn(
        "relative overflow-hidden border-2 transition-all bg-zinc-900/80 backdrop-blur-sm",
        isCompleted && "border-green-500/50 bg-green-500/5",
        isSubmitted && "border-amber-500/50 bg-amber-500/5",
        isRejected && "border-red-500/50 bg-red-500/5",
        isCurrentWeek && !isCompleted && !isSubmitted && "border-secondary glow-gold-subtle",
        !isCurrentWeek && !isCompleted && !isSubmitted && "border-secondary/20"
      )}>
        {/* Header with week indicator */}
        <div className="flex items-center justify-between p-4 border-b border-secondary/10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
              isCompleted ? "bg-green-500/20" : "bg-secondary/20"
            )}>
              {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : mission.gamification_emoji}
            </div>
            <div>
              <p className="text-xs text-cream/50 uppercase tracking-wider">
                Semana {mission.week_number} • {mission.month_title}
              </p>
              <h3 className="font-serif font-bold text-cream text-lg">
                {mission.title}
              </h3>
            </div>
          </div>

          <Badge 
            variant="outline" 
            className={cn(
              "font-medium",
              isCompleted && "border-green-500 text-green-400",
              isSubmitted && "border-amber-500 text-amber-400",
              isRejected && "border-red-500 text-red-400",
              !status && "border-secondary text-secondary"
            )}
          >
            {isCompleted && "✓ Concluída"}
            {isSubmitted && "⏳ Aguardando"}
            {isRejected && "↻ Reenviar"}
            {!status && `${mission.xp_reward} XP`}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Challenge */}
          <div className="flex gap-3">
            <Target className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-secondary mb-1">O Desafio</p>
              <p className="text-cream/80">{mission.challenge_description}</p>
            </div>
          </div>

          {/* Why do */}
          {mission.why_do && (
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400 mb-1">Por que fazer</p>
                <p className="text-cream/70 text-sm">{mission.why_do}</p>
              </div>
            </div>
          )}

          {/* Gamification */}
          <div className="flex gap-3 bg-secondary/10 rounded-xl p-3">
            <Trophy className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-secondary mb-1">
                {mission.gamification_title}
              </p>
              {mission.gamification_reward && (
                <p className="text-cream/60 text-sm">
                  🎁 Recompensa: {mission.gamification_reward}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-4 border-t border-secondary/10 bg-black/30">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 text-green-400 py-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Missão Completada! +{userCompletion?.xp_earned || mission.xp_reward} XP</span>
            </div>
          ) : isSubmitted ? (
            <div className="flex items-center justify-center gap-2 text-amber-400 py-2">
              <Clock className="w-5 h-5" />
              <span>Aguardando aprovação da mentora</span>
            </div>
          ) : (
            <Button 
              onClick={onSubmit}
              className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              {isRejected ? "Reenviar Entrega" : "Entregar Missão"}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
