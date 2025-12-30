import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Lock,
  ChevronDown,
  ChevronUp,
  Trophy,
  Sparkles,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyMission } from "./WeeklyMissionCard";

interface MissionCompletion {
  mission_id: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  xp_earned: number;
}

interface WeeklyJourneySectionProps {
  missions: WeeklyMission[];
  missionCompletions: Record<string, MissionCompletion>;
  currentWeek: number;
  enrollmentDate: Date | null;
  onMissionSubmit: (mission: WeeklyMission) => void;
}

const MONTH_LABELS = [
  { month: 1, title: "Mês 1: Fundação", subtitle: "Posicionamento de Elite", weeks: [1, 2, 3, 4] },
  { month: 2, title: "Mês 2: Conversão", subtitle: "Engenharia do Lucro", weeks: [5, 6, 7, 8] },
  { month: 3, title: "Mês 3: Escala", subtitle: "Rumo aos +50K", weeks: [9, 10, 11, 12] },
];

export const WeeklyJourneySection = ({
  missions,
  missionCompletions,
  currentWeek,
  enrollmentDate,
  onMissionSubmit
}: WeeklyJourneySectionProps) => {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(
    currentWeek <= 4 ? 1 : currentWeek <= 8 ? 2 : 3
  );

  const getMissionStatus = (weekNumber: number) => {
    const mission = missions.find(m => m.week_number === weekNumber);
    if (!mission) return 'unavailable';
    
    const completion = missionCompletions[mission.id];
    if (completion?.status === 'approved') return 'completed';
    if (completion?.status === 'submitted' || completion?.status === 'pending') return 'submitted';
    if (completion?.status === 'rejected') return 'rejected';
    if (weekNumber === currentWeek) return 'current';
    if (weekNumber < currentWeek) return 'available';
    return 'locked';
  };

  const getDaysUntilUnlock = (weekNumber: number): number => {
    if (!enrollmentDate || weekNumber <= currentWeek) return 0;
    const weeksUntil = weekNumber - currentWeek;
    return weeksUntil * 7;
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: "bg-green-500/20",
          border: "border-green-500/50",
          text: "text-green-400",
          icon: CheckCircle2
        };
      case 'submitted':
        return {
          bg: "bg-amber-500/20",
          border: "border-amber-500/50",
          text: "text-amber-400",
          icon: Clock
        };
      case 'current':
        return {
          bg: "bg-secondary/20",
          border: "border-secondary",
          text: "text-secondary",
          icon: Target
        };
      case 'rejected':
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: Send
        };
      case 'available':
        return {
          bg: "bg-zinc-800",
          border: "border-zinc-700",
          text: "text-cream/70",
          icon: Target
        };
      default: // locked
        return {
          bg: "bg-zinc-900/50",
          border: "border-zinc-800",
          text: "text-cream/30",
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold text-cream flex items-center gap-2">
          <Target className="w-5 h-5 text-secondary" />
          Sua Jornada Semanal
        </h2>
        <Badge variant="outline" className="border-secondary/30 text-secondary">
          Semana {currentWeek} de 12
        </Badge>
      </div>

      {/* Month Sections */}
      <div className="space-y-3">
        {MONTH_LABELS.map(({ month, title, subtitle, weeks }) => {
          const monthMissions = weeks.map(w => {
            const mission = missions.find(m => m.week_number === w);
            return { week: w, mission, status: getMissionStatus(w) };
          });
          
          const completedInMonth = monthMissions.filter(m => m.status === 'completed').length;
          const isExpanded = expandedMonth === month;
          const isCurrentMonth = weeks.includes(currentWeek);

          return (
            <Card
              key={month}
              className={cn(
                "overflow-hidden transition-all border-2",
                isCurrentMonth ? "border-secondary/40 bg-zinc-900/80" : "border-zinc-800 bg-zinc-900/50"
              )}
            >
              {/* Month Header */}
              <button
                onClick={() => setExpandedMonth(isExpanded ? null : month)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                    completedInMonth === 4 ? "bg-green-500/20 text-green-400" :
                    isCurrentMonth ? "bg-secondary/20 text-secondary" : "bg-zinc-800 text-cream/50"
                  )}>
                    {completedInMonth === 4 ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      month
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif font-semibold text-cream">{title}</h3>
                    <p className="text-xs text-cream/50">{subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-sm text-cream/70">{completedInMonth}/4 missões</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-cream/50" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-cream/50" />
                  )}
                </div>
              </button>

              {/* Week Cards */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 p-4 pt-0">
                      {monthMissions.map(({ week, mission, status }) => {
                        const styles = getStatusStyles(status);
                        const StatusIcon = styles.icon;
                        const daysUntil = getDaysUntilUnlock(week);
                        const isLocked = status === 'locked';

                        if (!mission) {
                          return (
                            <div
                              key={week}
                              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 opacity-50"
                            >
                              <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                                <span className="text-sm text-cream/50">{week}</span>
                              </div>
                              <span className="text-sm text-cream/50">Missão não configurada</span>
                            </div>
                          );
                        }

                        return (
                          <TooltipProvider key={week}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={!isLocked ? { scale: 1.01 } : undefined}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    styles.bg,
                                    styles.border,
                                    isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/10"
                                  )}
                                  onClick={() => {
                                    if (!isLocked && status !== 'completed' && status !== 'submitted') {
                                      onMissionSubmit(mission);
                                    }
                                  }}
                                >
                                  {/* Week indicator */}
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex flex-col items-center justify-center",
                                    status === 'current' && "ring-2 ring-secondary ring-offset-2 ring-offset-zinc-900"
                                  )}>
                                    <span className="text-xl">{mission.gamification_emoji}</span>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-cream/50">Semana {week}</span>
                                      {status === 'current' && (
                                        <Badge className="bg-secondary text-black text-[10px] px-1.5 py-0">
                                          ATUAL
                                        </Badge>
                                      )}
                                    </div>
                                    <p className={cn(
                                      "font-medium truncate",
                                      styles.text,
                                      isLocked && "text-cream/40"
                                    )}>
                                      {mission.title}
                                    </p>
                                  </div>

                                  {/* Status / Action */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {isLocked ? (
                                      <div className="flex items-center gap-1 text-cream/40">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs">{daysUntil}d</span>
                                      </div>
                                    ) : (
                                      <>
                                        <Badge 
                                          variant="outline" 
                                          className={cn(
                                            "text-xs",
                                            styles.border,
                                            styles.text
                                          )}
                                        >
                                          {status === 'completed' && `+${mission.xp_reward} XP`}
                                          {status === 'submitted' && "Aguardando"}
                                          {status === 'rejected' && "Reenviar"}
                                          {(status === 'current' || status === 'available') && `${mission.xp_reward} XP`}
                                        </Badge>
                                        <StatusIcon className={cn("w-5 h-5", styles.text)} />
                                      </>
                                    )}
                                  </div>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="left" 
                                className="max-w-xs bg-zinc-900 border-secondary/30"
                              >
                                <div className="space-y-2">
                                  <p className="font-semibold text-secondary">{mission.title}</p>
                                  <p className="text-sm text-cream/70">{mission.challenge_description}</p>
                                  {mission.gamification_reward && (
                                    <p className="text-xs text-cream/50">
                                      🎁 {mission.gamification_reward}
                                    </p>
                                  )}
                                  {isLocked && (
                                    <p className="text-xs text-amber-400">
                                      Disponível em {daysUntil} dias
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
