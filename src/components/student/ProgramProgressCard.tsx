import { motion } from "framer-motion";
import { Calendar, Target, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ProgramProgressCardProps {
  courseId: string;
  courseTitle: string;
  currentWeek: number;
  totalWeeks: number;
  completedWeeks: number[];
  currentMission?: {
    title: string;
    status: 'pending' | 'submitted' | 'approved';
  } | null;
  xpEarned?: number;
  className?: string;
}

export const ProgramProgressCard = ({
  courseId,
  courseTitle,
  currentWeek,
  totalWeeks,
  completedWeeks,
  currentMission,
  xpEarned = 0,
  className
}: ProgramProgressCardProps) => {
  const navigate = useNavigate();
  const progressPercent = Math.round((completedWeeks.length / totalWeeks) * 100);
  const weeksRemaining = totalWeeks - currentWeek;
  
  // Status da missão
  const getMissionStatus = () => {
    if (!currentMission) return { label: 'Disponível', color: 'bg-blue-500' };
    switch (currentMission.status) {
      case 'approved': return { label: 'Aprovada', color: 'bg-green-500' };
      case 'submitted': return { label: 'Aguardando', color: 'bg-yellow-500' };
      default: return { label: 'Pendente', color: 'bg-orange-500' };
    }
  };

  const missionStatus = getMissionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate(`/student/program/${courseId}`)}
      className={cn(
        "relative cursor-pointer bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-2xl p-5 border border-secondary/30 overflow-hidden group",
        className
      )}
    >
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant="outline" className="border-secondary/40 text-secondary text-xs mb-2">
              <Calendar className="w-3 h-3 mr-1" />
              Semana {currentWeek} de {totalWeeks}
            </Badge>
            <h3 className="text-lg font-serif font-semibold text-cream line-clamp-1">
              {courseTitle}
            </h3>
          </div>
          <motion.div
            className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"
            animate={completedWeeks.includes(currentWeek) ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Trophy className="w-5 h-5 text-secondary" />
          </motion.div>
        </div>

        {/* Timeline Visual - Horizontal compact */}
        <div className="mb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const isCompleted = completedWeeks.includes(week);
              const isCurrent = week === currentWeek && !isCompleted;
              const isLocked = week > currentWeek;
              
              return (
                <motion.div
                  key={week}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: week * 0.03 }}
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    isCompleted && "bg-green-500/20 text-green-400 border border-green-500/50",
                    isCurrent && "bg-secondary text-black border-2 border-secondary shadow-[0_0_10px_rgba(166,144,97,0.4)]",
                    isLocked && "bg-zinc-800 text-zinc-600 border border-zinc-700"
                  )}
                >
                  {isCompleted ? "✓" : week}
                </motion.div>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center gap-3 mt-2">
            <Progress value={progressPercent} className="h-1.5 flex-1 bg-secondary/20" />
            <span className="text-xs text-cream/60 whitespace-nowrap">{progressPercent}%</span>
          </div>
        </div>

        {/* Current Mission */}
        {currentMission && (
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-secondary/10 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cream/50 mb-0.5">Missão da Semana {currentWeek}</p>
              <p className="text-sm text-cream font-medium truncate">{currentMission.title}</p>
            </div>
            <Badge className={cn("text-xs text-white", missionStatus.color)}>
              {missionStatus.label}
            </Badge>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* XP earned */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-cream">{xpEarned} XP</span>
            </div>
            
            {/* Weeks remaining */}
            <span className="text-xs text-cream/50">
              {weeksRemaining > 0 ? `${weeksRemaining} semanas restantes` : 'Programa finalizado'}
            </span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};
