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
  Flame,
  Sparkles,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyMission } from "./WeeklyMissionCard";
import { MissionArena } from "./MissionArena";
import { MissionSubmissionHistory } from "./MissionSubmissionHistory";
import { useMissionSubmissionCount } from "@/hooks/useMissionSubmissionCount";

interface CurrentMissionSectionProps {
  missions: WeeklyMission[];
  missionCompletions: Record<string, { 
    status: 'pending' | 'submitted' | 'approved' | 'rejected'; 
    xp_earned: number;
    admin_feedback: string | null;
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
  // Sort missions by week_number for consistent navigation order
  const sortedMissions = [...missions].sort((a, b) => a.week_number - b.week_number);
  
  // Calculate completed missions count
  const completedMissionsCount = sortedMissions.filter(
    m => missionCompletions[m.id]?.status === 'approved'
  ).length;
  const totalMissionsCount = sortedMissions.length;

  // Index-based navigation through all missions
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  const mission = sortedMissions[selectedIndex];
  const completion = mission ? missionCompletions[mission.id] : null;
  
  const { count: submissionCount } = useMissionSubmissionCount(mission?.id, userId);
  
  const status = completion?.status;
  const adminFeedback = completion?.admin_feedback;
  const isCompleted = status === 'approved';
 const isSubmitted = status === 'submitted';
  const isRejected = status === 'rejected';
  const isCurrentWeek = mission?.week_number === currentWeek;

  // Navigation between missions (index-based)
  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < sortedMissions.length - 1;

  // Empty state when no missions exist
  if (sortedMissions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center border border-secondary/30">
            <Flame className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-shimmer-gold">
              Sua Jornada Semanal
            </h2>
            <p className="text-sm text-cream/60">Arena de Execução</p>
          </div>
        </div>
        <Card className="border-2 border-dashed border-zinc-700/50 bg-zinc-900/50 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="font-serif text-xl text-cream/60 mb-2">Missões em Breve</h3>
          <p className="text-zinc-500 text-sm">As missões da sua jornada serão disponibilizadas em breve.</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Section Header with Premium Styling */}
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4"
        >
          {/* Animated Icon Container */}
          <div className="relative">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px hsla(var(--secondary) / 0.3)",
                  "0 0 40px hsla(var(--secondary) / 0.5)",
                  "0 0 20px hsla(var(--secondary) / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center border border-secondary/30"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className="w-6 h-6 text-secondary" />
              </motion.div>
            </motion.div>
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-shimmer-gold">
              Sua Jornada Semanal
            </h2>
            <p className="text-sm text-cream/60 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-secondary" />
              Arena de Execução
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 ml-2">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {completedMissionsCount}/{totalMissionsCount}
              </Badge>
            </p>
          </div>
        </motion.div>

        {/* Week Navigation with Enhanced Styling */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-zinc-900/60 rounded-xl p-1.5 border border-secondary/20 backdrop-blur-sm"
        >
          <Button
            variant="ghost"
            size="icon"
              onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
            disabled={!canGoPrev}
            className={cn(
              "text-cream/50 hover:text-secondary hover:bg-secondary/20 transition-all h-9 w-9",
              !canGoPrev && "opacity-30"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Badge 
            variant="outline" 
            className={cn(
              "min-w-[140px] justify-center text-sm py-2 font-semibold transition-all",
              isCurrentWeek 
                ? "border-secondary text-secondary bg-secondary/15 shadow-[0_0_15px_hsla(var(--secondary)/0.3)]" 
                : "border-cream/30 text-cream/70 bg-transparent"
            )}
          >
            <Flame className={cn("w-4 h-4 mr-2", isCurrentWeek ? "text-secondary" : "text-cream/50")} />
              Missão {selectedIndex + 1} de {totalMissionsCount}
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
              onClick={() => setSelectedIndex(prev => Math.min(sortedMissions.length - 1, prev + 1))}
            disabled={!canGoNext}
            className={cn(
              "text-cream/50 hover:text-secondary hover:bg-secondary/20 transition-all h-9 w-9",
              !canGoNext && "opacity-30"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Mission Card with Enhanced Animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mission?.id || selectedIndex}
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative">
              {/* Intense Glow Effect for Current Week */}
              {isCurrentWeek && !isCompleted && (
                <>
                  <motion.div
                    animate={{ 
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-2 bg-gradient-to-r from-secondary/30 via-secondary/50 to-secondary/30 rounded-2xl blur-2xl"
                  />
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -inset-1 bg-secondary/20 rounded-xl blur-lg"
                  />
                </>
              )}

              <Card className={cn(
                "relative overflow-hidden border-2 transition-all bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm",
                isCompleted && "border-green-500/60 bg-green-500/5",
                isSubmitted && "border-amber-500/60 bg-amber-500/5",
                isRejected && "border-red-500/60 bg-red-500/5",
                isCurrentWeek && !isCompleted && !isSubmitted && !isRejected && "border-secondary shadow-[0_0_30px_hsla(var(--secondary)/0.3)]",
                !isCurrentWeek && !isCompleted && !isSubmitted && !isRejected && "border-secondary/40"
              )}>
                {/* Month Banner - Enhanced */}
                <div className="bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent px-5 py-3 border-b border-secondary/20">
                  <p className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {mission.month_title || `Mês ${mission.month_number}`}
                  </p>
                </div>

                {/* Header with Week Indicator - Enhanced */}
                <div className="flex items-center justify-between p-5 border-b border-secondary/15">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg",
                        isCompleted 
                          ? "bg-gradient-to-br from-green-500/30 to-green-600/20 border border-green-500/30" 
                          : "bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/30"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : mission.gamification_emoji}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="border-secondary/50 text-secondary text-xs font-medium">
                          Semana {mission.week_number}
                        </Badge>
                        {isCurrentWeek && !isCompleted && (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Badge className="bg-gradient-to-r from-secondary to-secondary/80 text-black text-xs border-0 font-bold shadow-lg">
                              🔥 Atual
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-cream text-xl md:text-2xl">
                        {mission.title}
                      </h3>
                    </div>
                  </div>

                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-semibold px-4 py-1.5 text-sm",
                      isCompleted && "border-green-500 text-green-400 bg-green-500/10",
                      isSubmitted && "border-amber-500 text-amber-400 bg-amber-500/10",
                      isRejected && "border-red-500 text-red-400 bg-red-500/10",
                      !status && "border-secondary text-secondary bg-secondary/10"
                    )}
                  >
                    {isCompleted && "✓ Concluída"}
                    {isSubmitted && "⏳ Aguardando"}
                    {isRejected && "↻ Reenviar"}
                    {!status && `${mission.xp_reward} XP`}
                  </Badge>
                </div>

                {/* Content - Enhanced Spacing */}
                <div className="p-6 space-y-5">
                  {/* Challenge */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0 group-hover:bg-secondary/30 transition-colors">
                      <Target className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary mb-1.5 uppercase tracking-wide">O Desafio</p>
                      <p className="text-cream/90 leading-relaxed text-base">{mission.challenge_description}</p>
                    </div>
                  </motion.div>

                  {/* Why do */}
                  {mission.why_do && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/30 transition-colors">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-400 mb-1.5 uppercase tracking-wide">Por que fazer</p>
                        <p className="text-cream/80 text-sm leading-relaxed">{mission.why_do}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Gamification - Enhanced Box */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-4 bg-gradient-to-r from-secondary/15 via-secondary/10 to-transparent rounded-xl p-5 border border-secondary/25 hover:border-secondary/40 transition-all group hover:shadow-[0_0_20px_hsla(var(--secondary)/0.15)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/25 flex items-center justify-center shrink-0 group-hover:bg-secondary/35 transition-colors">
                      <Trophy className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary mb-1.5 uppercase tracking-wide">
                        {mission.gamification_title}
                      </p>
                      {mission.gamification_reward && (
                        <p className="text-cream/70 text-sm flex items-center gap-2">
                          <Gift className="w-4 h-4 text-secondary/70" />
                          {mission.gamification_reward}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Feedback da Mentora - Exibido para aprovadas ou rejeitadas */}
                {adminFeedback && (isCompleted || isRejected) && (
                  <div className={cn(
                    "mx-6 mb-4 p-4 rounded-xl border",
                    isCompleted 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isCompleted ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        💬
                      </div>
                      <div>
                        <p className={cn(
                          "text-xs font-bold uppercase tracking-wide mb-1",
                          isCompleted ? "text-green-400" : "text-red-400"
                        )}>
                          {isCompleted ? "Comentário da Mentora" : "Feedback para Correção"}
                        </p>
                        <p className={cn(
                          "text-sm leading-relaxed",
                          isCompleted ? "text-green-300/90" : "text-red-300/90"
                        )}>
                          {adminFeedback}
                        </p>
                      </div>
                    </div>
                    
                    {/* Botão Ver Histórico */}
                    {submissionCount > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowHistory(true)}
                        className="mt-3 text-xs text-cream/60 hover:text-cream hover:bg-secondary/10"
                      >
                        <History className="w-3 h-3 mr-1" />
                        Ver {submissionCount} tentativas anteriores
                      </Button>
                    )}
                  </div>
                )}

                {/* Action - Enhanced Button */}
                <div className="p-5 border-t border-secondary/15 bg-black/40">
                  {isCompleted ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center gap-3 text-green-400 py-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold text-lg">Missão Completada! +{completion?.xp_earned || mission.xp_reward} XP</span>
                    </motion.div>
                  ) : isSubmitted ? (
                    <div className="flex items-center justify-center gap-3 text-amber-400 py-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="w-5 h-5" />
                      </motion.div>
                      <span className="font-medium">Aguardando aprovação da mentora</span>
                    </div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button 
                        onClick={() => onSubmit(mission)}
                        className="w-full bg-gradient-to-r from-secondary via-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-black font-bold py-6 text-lg shadow-[0_0_25px_hsla(var(--secondary)/0.4)] hover:shadow-[0_0_35px_hsla(var(--secondary)/0.5)] transition-all"
                      >
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Send className="w-5 h-5 mr-2" />
                        </motion.div>
                        {isRejected ? "Reenviar Entrega" : "Entregar Missão"}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </div>
        </motion.div>
      </AnimatePresence>

      {/* Mission Arena - Comments Section */}
      {mission && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MissionArena
            missionId={mission.id}
            weekNumber={mission.week_number}
            userId={userId}
            courseId={courseId}
          />
        </motion.div>
      )}

      {/* Mission Submission History Modal */}
      {mission && (
        <MissionSubmissionHistory
          open={showHistory}
          onOpenChange={setShowHistory}
          missionId={mission.id}
          userId={userId}
          weekNumber={mission.week_number}
        />
      )}
    </motion.div>
  );
};
