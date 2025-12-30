import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Trophy,
  ChevronLeft,
  ChevronRight,
  Lock,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyMission } from "./WeeklyMissionCard";
import { MissionArena } from "./MissionArena";

interface CurrentMissionSectionProps {
  missions: WeeklyMission[];
  missionCompletions: Record<string, { 
    status: 'pending' | 'submitted' | 'approved' | 'rejected'; 
    xp_earned: number;
  }>;
  currentWeek: number;
  enrollmentDate: Date | null;
  onSubmit: (mission: WeeklyMission) => void;
  courseId: string;
  userId: string;
}

export const CurrentMissionSection = ({
  missions,
  missionCompletions,
  currentWeek,
  enrollmentDate,
  onSubmit,
  courseId,
  userId
}: CurrentMissionSectionProps) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const mission = missions.find(m => m.week_number === selectedWeek);
  const completion = mission ? missionCompletions[mission.id] : null;
  
  const status = completion?.status;
  const isCompleted = status === 'approved';
  const isSubmitted = status === 'submitted' || status === 'pending';
  const isRejected = status === 'rejected';
  const isLocked = selectedWeek > currentWeek;
  
  const getDaysUntilUnlock = (week: number): number => {
    if (!enrollmentDate) return 0;
    const unlockDate = new Date(enrollmentDate);
    unlockDate.setDate(unlockDate.getDate() + (week - 1) * 7);
    const today = new Date();
    const diffTime = unlockDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const canNavigatePrev = selectedWeek > 1;
  const canNavigateNext = selectedWeek < 12;

  if (!mission) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-cream text-xl">
              Sua Jornada Semanal
            </h2>
            <p className="text-sm text-cream/50">Arena de Execução</p>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
            disabled={!canNavigatePrev}
            className="text-cream/50 hover:text-secondary hover:bg-secondary/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Badge 
            variant="outline" 
            className={cn(
              "min-w-[120px] justify-center text-sm py-1.5",
              selectedWeek === currentWeek 
                ? "border-secondary text-secondary bg-secondary/10" 
                : "border-cream/30 text-cream/70"
            )}
          >
            Semana {selectedWeek} de 12
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedWeek(prev => Math.min(12, prev + 1))}
            disabled={!canNavigateNext}
            className="text-cream/50 hover:text-secondary hover:bg-secondary/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mission Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedWeek}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {isLocked ? (
            // Locked Week Card
            <Card className="relative overflow-hidden border-2 border-zinc-800/50 bg-zinc-900/50 opacity-70">
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-cream/50 text-lg mb-2">
                    Semana {selectedWeek} Bloqueada
                  </h3>
                  <p className="text-zinc-500">
                    Disponível em {getDaysUntilUnlock(selectedWeek)} dias
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            // Active Mission Card
            <div className="relative">
              {/* Glow effect for current week */}
              {selectedWeek === currentWeek && !isCompleted && (
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
                selectedWeek === currentWeek && !isCompleted && !isSubmitted && !isRejected && "border-secondary glow-gold-subtle",
                selectedWeek !== currentWeek && !isCompleted && !isSubmitted && !isRejected && "border-secondary/30"
              )}>
                {/* Month Banner */}
                <div className="bg-gradient-to-r from-secondary/10 to-transparent px-5 py-2 border-b border-secondary/10">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    {mission.month_title || `Mês ${mission.month_number}`}
                  </p>
                </div>

                {/* Header with week indicator */}
                <div className="flex items-center justify-between p-5 border-b border-secondary/10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                      isCompleted ? "bg-green-500/20" : "bg-secondary/20"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-7 h-7 text-green-400" /> : mission.gamification_emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-secondary/50 text-secondary text-xs">
                          Semana {mission.week_number}
                        </Badge>
                        {selectedWeek === currentWeek && !isCompleted && (
                          <Badge className="bg-secondary/20 text-secondary text-xs border-0">
                            Atual
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-cream text-xl">
                        {mission.title}
                      </h3>
                    </div>
                  </div>

                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-medium px-3 py-1",
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
                  <div className="flex gap-4">
                    <Target className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-secondary mb-1">O Desafio</p>
                      <p className="text-cream/90 leading-relaxed">{mission.challenge_description}</p>
                    </div>
                  </div>

                  {/* Why do */}
                  {mission.why_do && (
                    <div className="flex gap-4">
                      <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-400 mb-1">Por que fazer</p>
                        <p className="text-cream/70 text-sm leading-relaxed">{mission.why_do}</p>
                      </div>
                    </div>
                  )}

                  {/* Gamification */}
                  <div className="flex gap-4 bg-gradient-to-r from-secondary/10 to-transparent rounded-xl p-4">
                    <Trophy className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-secondary mb-1">
                        {mission.gamification_title}
                      </p>
                      {mission.gamification_reward && (
                        <p className="text-cream/60 text-sm flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          {mission.gamification_reward}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="p-5 border-t border-secondary/10 bg-black/30">
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 py-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Missão Completada! +{completion?.xp_earned || mission.xp_reward} XP</span>
                    </div>
                  ) : isSubmitted ? (
                    <div className="flex items-center justify-center gap-2 text-amber-400 py-2">
                      <Clock className="w-5 h-5" />
                      <span>Aguardando aprovação da mentora</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => onSubmit(mission)}
                      className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold py-5"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isRejected ? "Reenviar Entrega" : "Entregar Missão"}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mission Arena - Comments Section */}
      {!isLocked && mission && (
        <MissionArena
          missionId={mission.id}
          weekNumber={mission.week_number}
          userId={userId}
          courseId={courseId}
        />
      )}
    </motion.div>
  );
};