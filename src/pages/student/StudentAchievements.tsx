import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useConfetti } from "@/hooks/useConfetti";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  Star,
  Flame,
  Zap,
  Crown,
  Award,
  BookOpen,
  PlayCircle,
  Lock,
  Sparkles,
  Medal
} from "lucide-react";
import { cn } from "@/lib/utils";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import { XPLeaderboard } from "@/components/student/XPLeaderboard";
import { DailyChallenges } from "@/components/student/DailyChallenges";
import { StudyCalendar } from "@/components/student/StudyCalendar";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  "play-circle": PlayCircle,
  "book-open": BookOpen,
  "flame": Flame,
  "trophy": Trophy,
  "crown": Crown,
  "award": Award,
  "star": Star,
  "zap": Zap,
  "sparkles": Sparkles
};

const StudentAchievements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    stats,
    badges,
    earnedBadges,
    leaderboard,
    loading,
    calculateLevel,
    getCurrentLevelProgress,
    userRank
  } = useGamification();
  const { fireCelebration } = useConfetti();
  
  // Track previous level to detect level ups
  const previousLevelRef = useRef<number | null>(null);

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));
  const level = stats ? calculateLevel(stats.xp) : 1;
  const levelProgress = stats ? getCurrentLevelProgress(stats.xp) : 0;

  // Check for level up and fire confetti
  useEffect(() => {
    if (previousLevelRef.current !== null && level > previousLevelRef.current) {
      // Level up detected!
      fireCelebration();
      toast.success(`🎉 Parabéns! Você subiu para o nível ${level}!`, {
        description: "Continue assim, você está arrasando!",
        duration: 5000,
      });
    }
    previousLevelRef.current = level;
  }, [level, fireCelebration]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-secondary/20 py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={isotipoGold} alt="Soberana" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]" />
              <div className="flex flex-col leading-tight">
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase">
                  Mentoring
                </span>
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase -mt-0.5">
                  Club
                </span>
                <span className="font-serif font-bold text-secondary text-sm tracking-wider mt-0.5">
                  SOBERANA
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 px-4">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          {/* XP & Level Card */}
          <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-2xl p-6 text-cream col-span-2 border border-secondary/20 glow-gold-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse-glow-gold">
                  <Star className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <p className="text-cream/60 text-sm">Nível</p>
                  <p className="text-4xl font-bold">{level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-cream/60 text-sm">Total XP</p>
                <p className="text-3xl font-bold text-secondary">{stats?.xp || 0}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cream/60">Progresso para o nível {level + 1}</span>
                <span className="text-secondary">{levelProgress}%</span>
              </div>
              <Progress value={levelProgress} className="h-3 bg-secondary/20" />
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-6 text-cream border border-orange-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <p className="font-medium text-orange-400">Streak</p>
            </div>
            <p className="text-5xl font-bold mb-1">{stats?.streak_days || 0}</p>
            <p className="text-cream/60">dias consecutivos</p>
          </div>
        </motion.div>

        {/* Leaderboard - Using XPLeaderboard component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-serif font-bold text-cream mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-secondary" />
            Ranking das Alunas
          </h2>
          
          <XPLeaderboard leaderboard={leaderboard} loading={loading} />
        </motion.div>

        {/* Desafios Diários & Calendário de Estudos */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10 grid md:grid-cols-2 gap-6"
        >
          <DailyChallenges />
          <StudyCalendar />
        </motion.section>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-serif font-bold text-cream mb-4 flex items-center gap-2">
            <Medal className="w-6 h-6 text-secondary" />
            Conquistas
          </h2>
          
          <p className="text-cream/50 mb-6">
            {earnedBadges.length} de {badges.length} conquistas desbloqueadas
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {badges.map((badge, index) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const IconComponent = iconMap[badge.icon] || Award;
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative bg-zinc-900 rounded-xl p-4 border text-center transition-all",
                    isEarned
                      ? "border-secondary/50 glow-gold-subtle"
                      : "border-secondary/10 opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                    isEarned
                      ? "bg-secondary/20 text-secondary"
                      : "bg-zinc-800 text-cream/40"
                  )}>
                    {isEarned ? (
                      <IconComponent className="w-8 h-8" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  
                  <h3 className={cn(
                    "font-semibold text-sm mb-1",
                    isEarned ? "text-cream" : "text-cream/50"
                  )}>
                    {badge.name}
                  </h3>
                  
                  <p className="text-xs text-cream/40 mb-2">
                    {badge.description}
                  </p>
                  
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    isEarned
                      ? "bg-secondary/20 text-secondary"
                      : "bg-zinc-800 text-cream/40"
                  )}>
                    +{badge.xp_reward} XP
                  </span>
                  
                  {isEarned && (
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StudentAchievements;
