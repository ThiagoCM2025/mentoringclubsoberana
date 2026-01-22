import { motion } from "framer-motion";
import { Check, Lock, Target, Sparkles, Rocket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { WeeklyMission } from "./WeeklyMissionCard";
import { getBrazilNow } from "@/lib/dateUtils";

interface MissionCompletion {
  mission_id: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  xp_earned: number;
}

interface ProgramTimelineProps {
  missions: WeeklyMission[];
  missionCompletions: Record<string, MissionCompletion>;
  currentWeek: number;
  enrollmentDate: Date | null;
  onWeekClick?: (mission: WeeklyMission) => void;
}

const MONTH_CONFIG = [
  { 
    label: "Mês 1", 
    subtitle: "Fundação",
    description: "Posicionamento de Elite",
    icon: Target,
    gradient: "from-emerald-500/20 to-secondary/20"
  },
  { 
    label: "Mês 2", 
    subtitle: "Conversão",
    description: "Engenharia do Lucro",
    icon: Zap,
    gradient: "from-secondary/20 to-amber-500/20"
  },
  { 
    label: "Mês 3", 
    subtitle: "Escala",
    description: "Rumo aos +50K",
    icon: Rocket,
    gradient: "from-amber-500/20 to-orange-500/20"
  }
];

export const ProgramTimeline = ({
  missions,
  missionCompletions,
  currentWeek,
  enrollmentDate,
  onWeekClick
}: ProgramTimelineProps) => {
  
  const getMissionForWeek = (week: number): WeeklyMission | undefined => {
    return missions.find(m => m.week_number === week);
  };

  const getWeekStatus = (week: number): 'completed' | 'current' | 'available' | 'locked' => {
    const mission = getMissionForWeek(week);
    if (mission) {
      const completion = missionCompletions[mission.id];
      if (completion?.status === 'approved') return 'completed';
      if (completion?.status === 'submitted') return 'current';
    }
    if (week === currentWeek) return 'current';
    if (week < currentWeek) return 'available';
    return 'locked';
  };

  const getDaysUntilUnlock = (week: number): number => {
    if (!enrollmentDate) return 0;
    const unlockDate = new Date(enrollmentDate);
    unlockDate.setDate(unlockDate.getDate() + (week - 1) * 7);
    const today = getBrazilNow();
    const diffTime = unlockDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Calculate overall progress
  const completedCount = missions.filter(m => 
    missionCompletions[m.id]?.status === 'approved'
  ).length;
  const progressPercentage = missions.length > 0 
    ? Math.round((completedCount / missions.length) * 100) 
    : 0;

  const getStatusConfig = (status: string, week: number) => {
    const daysUntil = getDaysUntilUnlock(week);
    
    switch (status) {
      case 'completed':
        return {
          bg: "bg-green-500/20",
          border: "border-green-500/50",
          text: "text-green-400",
          badge: "Concluído",
          badgeBg: "bg-green-500/20 text-green-400"
        };
      case 'current':
        return {
          bg: "bg-secondary/20",
          border: "border-secondary",
          text: "text-secondary",
          badge: "Sua Semana",
          badgeBg: "bg-secondary/20 text-secondary"
        };
      case 'available':
        return {
          bg: "bg-zinc-800/50",
          border: "border-zinc-600/50",
          text: "text-cream/70",
          badge: "Disponível",
          badgeBg: "bg-zinc-700/50 text-cream/60"
        };
      case 'locked':
        return {
          bg: "bg-zinc-900/50",
          border: "border-zinc-800/50",
          text: "text-zinc-600",
          badge: daysUntil > 0 ? `${daysUntil} dias` : "Bloqueado",
          badgeBg: "bg-zinc-800/50 text-zinc-500"
        };
      default:
        return {
          bg: "bg-zinc-900/50",
          border: "border-zinc-800/50",
          text: "text-zinc-600",
          badge: "",
          badgeBg: ""
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream/60">Progresso Geral</span>
          <span className="text-secondary font-semibold">
            {completedCount}/{missions.length} semanas • {progressPercentage}%
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-zinc-800" 
        />
      </div>

      {/* Month Groups */}
      <div className="space-y-6">
        {MONTH_CONFIG.map((month, monthIndex) => {
          const weeksInMonth = [1, 2, 3, 4].map(w => monthIndex * 4 + w);
          const MonthIcon = month.icon;
          
          return (
            <motion.div
              key={monthIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: monthIndex * 0.1 }}
              className="space-y-3"
            >
              {/* Month Header */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  monthIndex === 0 && "bg-emerald-500/20 text-emerald-400",
                  monthIndex === 1 && "bg-secondary/20 text-secondary",
                  monthIndex === 2 && "bg-amber-500/20 text-amber-400"
                )}>
                  <MonthIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-cream">
                    {month.label}: {month.subtitle}
                  </h3>
                  <p className="text-xs text-cream/40">{month.description}</p>
                </div>
              </div>

              {/* Week Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {weeksInMonth.map((week) => {
                  const mission = getMissionForWeek(week);
                  const status = getWeekStatus(week);
                  const config = getStatusConfig(status, week);
                  const isLocked = status === 'locked';
                  const isCurrent = status === 'current';
                  
                  return (
                    <TooltipProvider key={week}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            onClick={() => mission && !isLocked && onWeekClick?.(mission)}
                            disabled={isLocked || !mission}
                            whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!isLocked ? { scale: 0.98 } : {}}
                            className={cn(
                              "relative p-3 rounded-xl border-2 transition-all text-left",
                              "flex flex-col gap-2 min-h-[100px]",
                              config.bg,
                              config.border,
                              !isLocked && "cursor-pointer hover:shadow-lg",
                              isLocked && "opacity-50 cursor-not-allowed",
                              isCurrent && "ring-2 ring-secondary/30 ring-offset-2 ring-offset-zinc-900"
                            )}
                          >
                            {/* Current week pulse */}
                            {isCurrent && (
                              <motion.div
                                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-xl bg-secondary/10"
                              />
                            )}

                            {/* Week number with emoji */}
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                  status === 'completed' && "bg-green-500/30 text-green-400",
                                  status === 'current' && "bg-secondary text-black",
                                  status === 'available' && "bg-zinc-700 text-cream",
                                  status === 'locked' && "bg-zinc-800 text-zinc-600"
                                )}>
                                  {status === 'completed' ? (
                                    <Check className="w-3 h-3" />
                                  ) : status === 'locked' ? (
                                    <Lock className="w-3 h-3" />
                                  ) : (
                                    week
                                  )}
                                </span>
                                {mission?.gamification_emoji && !isLocked && (
                                  <span className="text-lg">{mission.gamification_emoji}</span>
                                )}
                              </div>
                              {/* XP Badge */}
                              {mission && !isLocked && (
                                <span className="text-xs text-secondary flex items-center gap-0.5">
                                  <Sparkles className="w-3 h-3" />
                                  {mission.xp_reward}
                                </span>
                              )}
                            </div>

                            {/* Mission Title */}
                            <div className="flex-1 relative z-10">
                              <p className={cn(
                                "text-xs font-medium line-clamp-2",
                                config.text
                              )}>
                                {mission ? (
                                  isLocked ? `Semana ${week}` : mission.title
                                ) : (
                                  `Semana ${week}`
                                )}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div className="relative z-10">
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full",
                                config.badgeBg
                              )}>
                                {config.badge}
                              </span>
                            </div>
                          </motion.button>
                        </TooltipTrigger>
                        
                        {mission && (
                          <TooltipContent 
                            side="bottom" 
                            className="bg-zinc-900 border-secondary/30 text-cream max-w-xs p-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {mission.gamification_emoji && (
                                  <span className="text-xl">{mission.gamification_emoji}</span>
                                )}
                                <div>
                                  <p className="font-semibold text-secondary">
                                    Semana {week}: {mission.title}
                                  </p>
                                </div>
                              </div>
                              
                              {mission.challenge_description && (
                                <p className="text-sm text-cream/70 line-clamp-3">
                                  {mission.challenge_description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3 pt-1">
                                <span className="flex items-center gap-1 text-secondary text-sm">
                                  <Sparkles className="w-3 h-3" />
                                  {mission.xp_reward} XP
                                </span>
                                
                                {status === 'completed' && (
                                  <span className="text-green-400 text-sm flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Concluída
                                  </span>
                                )}
                                
                                {status === 'locked' && (
                                  <span className="text-zinc-500 text-sm flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Disponível em {getDaysUntilUnlock(week)} dias
                                  </span>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
