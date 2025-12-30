import { useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Flame, 
  Award,
  Crown,
  ChevronRight,
  Users,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgramLeaderboard } from "./ProgramLeaderboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CourseGamificationData {
  xp: number;
  level: number;
  current_title: string;
  missions_completed: number;
  week_progress: number;
  badges_earned: string[];
}

interface ProgramTitle {
  week_number: number;
  title: string;
  emoji: string;
}

interface CourseGamificationSidebarProps {
  gamification: CourseGamificationData;
  totalMissions: number;
  allTitles: ProgramTitle[];
  courseId?: string;
  className?: string;
}

export const CourseGamificationSidebar = ({
  gamification,
  totalMissions,
  allTitles,
  courseId,
  className
}: CourseGamificationSidebarProps) => {
  const [activeTab, setActiveTab] = useState("progress");
  const progressPercent = (gamification.missions_completed / totalMissions) * 100;
  
  // Create complete titles array including initial title (week 0)
  const titlesWithInitial: ProgramTitle[] = [
    { week_number: 0, title: "Advogada Invisível", emoji: "🔍" },
    ...allTitles
  ];
  
  // Find current title index in the complete array
  const currentTitleIndex = titlesWithInitial.findIndex(t => t.title === gamification.current_title);
  // If not found, default to 0 (initial title)
  const safeCurrentIndex = currentTitleIndex >= 0 ? currentTitleIndex : 0;
  const nextTitle = titlesWithInitial[safeCurrentIndex + 1];

  // Calculate XP to next level
  const xpForNextLevel = (gamification.level) * 200;
  const xpProgress = (gamification.xp % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tabs for Progress vs Ranking */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50 border border-secondary/20">
          <TabsTrigger value="progress" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
            <Trophy className="w-4 h-4 mr-2" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="ranking" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
            <Users className="w-4 h-4 mr-2" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4 space-y-6">
      {/* Current Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-5 border border-secondary/30"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center">
            <Crown className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-cream/50 uppercase tracking-wider">Seu Título</p>
            <h3 className="font-serif font-bold text-secondary text-lg">
              {gamification.current_title}
            </h3>
          </div>
        </div>

        {nextTitle && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-cream/60 bg-black/20 rounded-lg p-2">
              <ChevronRight className="w-4 h-4" />
              <span>Próximo: {nextTitle.emoji} {nextTitle.title}</span>
            </div>
            <p className="text-xs text-cream/50 text-center italic">
              Complete a missão da Semana {nextTitle.week_number} para desbloquear
            </p>
          </div>
        )}
      </motion.div>

      {/* Title Journey Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-zinc-900/80 rounded-2xl p-5 border border-secondary/20"
      >
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="font-medium text-cream">Jornada de Títulos</span>
          </div>
          <p className="text-xs text-cream/50">
            Cada título é desbloqueado ao ter sua missão semanal aprovada
          </p>
        </div>

        {/* Mini Timeline */}
        <TooltipProvider>
          <div className="flex justify-between items-center mb-4 px-1">
            {titlesWithInitial.map((title, index) => {
              const isAchieved = index < safeCurrentIndex;
              const isCurrent = index === safeCurrentIndex;
              const isFuture = index > safeCurrentIndex;
              
              return (
                <Tooltip key={title.week_number}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300",
                        isAchieved && "bg-secondary",
                        isCurrent && "bg-secondary ring-2 ring-secondary/50 ring-offset-1 ring-offset-zinc-900 animate-pulse",
                        isFuture && "bg-zinc-700"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-zinc-800 border-secondary/30">
                    <div className="text-center">
                      <div className="font-medium text-cream">
                        {title.emoji} {title.title}
                      </div>
                      <div className="text-xs text-cream/60">
                        {title.week_number === 0 ? "Início" : `Semana ${title.week_number}`}
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        isAchieved && "text-green-400",
                        isCurrent && "text-secondary",
                        isFuture && "text-cream/40"
                      )}>
                        {isAchieved && `✓ Conquistado na Semana ${title.week_number}`}
                        {isCurrent && "★ Seu título atual"}
                        {isFuture && `🔒 Complete a missão da Semana ${title.week_number}`}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Progress Bar */}
        <Progress 
          value={(safeCurrentIndex / Math.max(titlesWithInitial.length - 1, 1)) * 100} 
          className="h-2 bg-secondary/20 mb-3" 
        />

        {/* Remaining Titles Text */}
        <div className="text-center">
          {safeCurrentIndex >= titlesWithInitial.length - 1 ? (
            <p className="text-sm text-secondary font-medium">
              👸 Você alcançou Advogada Soberana!
            </p>
          ) : (
            <p className="text-sm text-cream/70">
              <span className="text-secondary font-medium">{titlesWithInitial.length - 1 - safeCurrentIndex}</span> título{titlesWithInitial.length - 1 - safeCurrentIndex !== 1 ? 's' : ''} para <span className="text-secondary">Advogada Soberana</span> 👸
            </p>
          )}
        </div>
      </motion.div>

      {/* XP Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/80 rounded-2xl p-5 border border-secondary/20"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-medium text-cream">XP do Programa</span>
          </div>
          <Badge variant="outline" className="border-secondary text-secondary">
            Nível {gamification.level}
          </Badge>
        </div>

        <div className="text-3xl font-bold text-secondary mb-2">
          {gamification.xp.toLocaleString()}
        </div>

        <Progress value={xpProgress} className="h-2 bg-secondary/20" />
        <p className="text-xs text-cream/50 mt-2">
          {Math.round(xpForNextLevel - (gamification.xp % xpForNextLevel))} XP para o próximo nível
        </p>
      </motion.div>

      {/* Mission Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/80 rounded-2xl p-5 border border-secondary/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-secondary" />
          <span className="font-medium text-cream">Missões</span>
        </div>

        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-bold text-cream">
            {gamification.missions_completed}
          </span>
          <span className="text-cream/50 pb-1">/ {totalMissions}</span>
        </div>

        <Progress value={progressPercent} className="h-2 bg-secondary/20" />
        
        <p className="text-xs text-cream/50 mt-2">
          {Math.round(progressPercent)}% do programa concluído
        </p>
      </motion.div>


      {/* Badges Earned */}
      {gamification.badges_earned.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/80 rounded-2xl p-5 border border-secondary/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-secondary" />
            <span className="font-medium text-cream">Conquistas</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {gamification.badges_earned.map((badge, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-secondary/50 text-secondary bg-secondary/10"
              >
                🏅 {badge}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 rounded-2xl p-5 border border-secondary/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-secondary" />
              <span className="font-medium text-cream">Ranking do Programa</span>
            </div>
            
            {courseId ? (
              <ProgramLeaderboard courseId={courseId} />
            ) : (
              <p className="text-sm text-cream/50 text-center py-4">
                Ranking não disponível
              </p>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
