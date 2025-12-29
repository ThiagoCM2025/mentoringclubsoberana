import { motion } from "framer-motion";
import { Check, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WeekInfo {
  week: number;
  moduleTitle?: string;
  missionTitle?: string;
  xpReward?: number;
}

interface ProgramTimelineProps {
  totalWeeks: number;
  currentWeek: number;
  completedWeeks: number[];
  weekInfo?: WeekInfo[];
  onWeekClick?: (week: number) => void;
  compact?: boolean;
}

export const ProgramTimeline = ({
  totalWeeks,
  currentWeek,
  completedWeeks,
  weekInfo = [],
  onWeekClick,
  compact = false
}: ProgramTimelineProps) => {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const getWeekStatus = (week: number): 'completed' | 'current' | 'upcoming' => {
    if (completedWeeks.includes(week)) return 'completed';
    if (week === currentWeek) return 'current';
    return 'upcoming';
  };

  const getWeekInfo = (week: number): WeekInfo | undefined => {
    return weekInfo.find(w => w.week === week);
  };

  const getMonthLabel = (monthIndex: number): string => {
    const labels = ['Mês 1', 'Mês 2', 'Mês 3'];
    return labels[monthIndex] || `Mês ${monthIndex + 1}`;
  };

  const getMonthSubtitle = (monthIndex: number): string => {
    const subtitles = ['Fundação', 'Conversão', 'Escala'];
    return subtitles[monthIndex] || '';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {weeks.map((week) => {
          const status = getWeekStatus(week);
          const isActive = week === currentWeek && !completedWeeks.includes(week);
          
          return (
            <motion.div
              key={week}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: week * 0.02 }}
              onClick={() => onWeekClick?.(week)}
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all cursor-pointer",
                status === 'completed' && "bg-green-500/20 text-green-400 border border-green-500/50",
                isActive && "bg-secondary text-black border-2 border-secondary shadow-[0_0_10px_rgba(166,144,97,0.4)]",
                status === 'current' && !isActive && "bg-secondary/20 text-secondary border border-secondary/50",
                status === 'upcoming' && "bg-zinc-800/50 text-zinc-500 border border-zinc-700/50"
              )}
            >
              {status === 'completed' ? <Check className="w-3 h-3" /> : week}
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
        {/* Month labels - positioned above weeks */}
        <div className="flex justify-between px-2 mb-3 min-w-max">
          {[0, 1, 2].map((monthIndex) => (
            <div 
              key={monthIndex}
              className="flex-1 text-center px-2"
            >
              <span className="text-xs font-medium text-secondary">
                {getMonthLabel(monthIndex)}
              </span>
              <span className="text-[10px] text-cream/40 ml-1">
                {getMonthSubtitle(monthIndex)}
              </span>
            </div>
          ))}
        </div>

        {/* Week circles */}
        <div className="flex items-center gap-2 min-w-max px-2">
          {weeks.map((week, index) => {
            const status = getWeekStatus(week);
            const isActive = week === currentWeek && !completedWeeks.includes(week);
            const info = getWeekInfo(week);

            return (
              <div key={week} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => onWeekClick?.(week)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                        status === 'completed' && "bg-green-500/20 text-green-400 border-2 border-green-500/50",
                        status === 'current' && !isActive && "bg-secondary/20 text-secondary border-2 border-secondary/50",
                        isActive && "bg-secondary text-black border-2 border-secondary",
                        status === 'upcoming' && "bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700/50"
                      )}
                    >
                      {/* Pulse animation for current week */}
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-secondary/30"
                        />
                      )}

                      {status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        week
                      )}

                      {/* Indicator for pending mission */}
                      {isActive && info?.missionTitle && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-zinc-900 border-secondary/30 text-cream max-w-xs"
                  >
                    <div className="space-y-1.5 p-1">
                      <p className="font-semibold text-secondary">Semana {week}</p>
                      {info?.moduleTitle && (
                        <p className="text-sm text-cream/80">{info.moduleTitle}</p>
                      )}
                      {info?.missionTitle && (
                        <div className="flex items-center gap-1.5 text-xs text-cream/60">
                          <Target className="w-3 h-3" />
                          <span>{info.missionTitle}</span>
                        </div>
                      )}
                      {info?.xpReward && (
                        <div className="flex items-center gap-1.5 text-xs text-secondary">
                          <Sparkles className="w-3 h-3" />
                          <span>{info.xpReward} XP</span>
                        </div>
                      )}
                      {status === 'completed' && (
                        <p className="text-xs text-green-400">✓ Concluída</p>
                      )}
                      {status === 'upcoming' && (
                        <p className="text-xs text-zinc-500">📅 Em breve</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Connector line */}
                {index < weeks.length - 1 && (
                  <div 
                    className={cn(
                      "w-4 h-0.5 mx-0.5 transition-colors",
                      completedWeeks.includes(week) ? "bg-green-500/50" : "bg-zinc-700/50"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
