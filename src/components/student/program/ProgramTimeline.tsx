import { motion } from "framer-motion";
import { Check, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramTimelineProps {
  totalWeeks: number;
  currentWeek: number;
  completedWeeks: number[];
  onWeekClick?: (week: number) => void;
}

export const ProgramTimeline = ({
  totalWeeks,
  currentWeek,
  completedWeeks,
  onWeekClick
}: ProgramTimelineProps) => {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const getWeekStatus = (week: number): 'completed' | 'current' | 'locked' => {
    if (completedWeeks.includes(week)) return 'completed';
    if (week <= currentWeek) return 'current';
    return 'locked';
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center gap-2 min-w-max px-4">
        {weeks.map((week, index) => {
          const status = getWeekStatus(week);
          const isActive = week === currentWeek && !completedWeeks.includes(week);

          return (
            <div key={week} className="flex items-center">
              <motion.button
                onClick={() => status !== 'locked' && onWeekClick?.(week)}
                disabled={status === 'locked'}
                whileHover={status !== 'locked' ? { scale: 1.1 } : undefined}
                whileTap={status !== 'locked' ? { scale: 0.95 } : undefined}
                className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                  status === 'completed' && "bg-green-500/20 text-green-400 border-2 border-green-500/50",
                  status === 'current' && !isActive && "bg-secondary/20 text-secondary border-2 border-secondary/50",
                  isActive && "bg-secondary text-black border-2 border-secondary",
                  status === 'locked' && "bg-zinc-800 text-zinc-600 border-2 border-zinc-700 cursor-not-allowed"
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
                ) : status === 'locked' ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  week
                )}
              </motion.button>

              {/* Connector line */}
              {index < weeks.length - 1 && (
                <div 
                  className={cn(
                    "w-4 h-0.5 mx-0.5 transition-colors",
                    completedWeeks.includes(week) ? "bg-green-500/50" : "bg-zinc-700"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Month labels */}
      <div className="flex justify-between px-4 mt-3 min-w-max">
        <div className="text-xs text-cream/50 text-center" style={{ width: '33%' }}>
          Mês 1 - Fundação
        </div>
        <div className="text-xs text-cream/50 text-center" style={{ width: '33%' }}>
          Mês 2 - Conversão
        </div>
        <div className="text-xs text-cream/50 text-center" style={{ width: '33%' }}>
          Mês 3 - Escala
        </div>
      </div>
    </div>
  );
};
