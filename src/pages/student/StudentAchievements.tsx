import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
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
import brandLogo from "@/assets/brand-logo.png";

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

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));
  const level = stats ? calculateLevel(stats.xp) : 1;
  const levelProgress = stats ? getCurrentLevelProgress(stats.xp) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={brandLogo} alt="Soberana" className="w-8 h-8 object-contain" />
              <span className="font-serif font-bold">Conquistas</span>
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
          <div className="bg-gradient-to-br from-primary to-marsala-light rounded-2xl p-6 text-primary-foreground col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Star className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <p className="text-primary-foreground/70 text-sm">Nível</p>
                  <p className="text-4xl font-bold">{level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/70 text-sm">Total XP</p>
                <p className="text-3xl font-bold">{stats?.xp || 0}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para o nível {level + 1}</span>
                <span>{levelProgress}%</span>
              </div>
              <Progress value={levelProgress} className="h-3 bg-primary-foreground/20" />
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <p className="font-medium">Streak</p>
            </div>
            <p className="text-5xl font-bold mb-1">{stats?.streak_days || 0}</p>
            <p className="text-white/70">dias consecutivos</p>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-secondary" />
            Ranking
          </h2>
          
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.user_id === user?.id;
              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-4 p-4 border-b border-border/50 last:border-b-0",
                    isCurrentUser && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-600",
                    index === 1 && "bg-gray-300/30 text-gray-500",
                    index === 2 && "bg-orange-500/20 text-orange-600",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index === 0 ? <Crown className="w-5 h-5" /> : entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isCurrentUser ? "text-primary" : "text-foreground"
                    )}>
                      {entry.full_name || "Estudante"}
                      {isCurrentUser && " (você)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nível {calculateLevel(entry.xp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{entry.xp} XP</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {entry.streak_days} dias
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <Medal className="w-6 h-6 text-secondary" />
            Conquistas
          </h2>
          
          <p className="text-muted-foreground mb-6">
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
                    "relative bg-card rounded-xl p-4 border text-center transition-all",
                    isEarned
                      ? "border-secondary/50 shadow-lg"
                      : "border-border/50 opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                    isEarned
                      ? "bg-secondary/20 text-secondary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isEarned ? (
                      <IconComponent className="w-8 h-8" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  
                  <h3 className={cn(
                    "font-semibold text-sm mb-1",
                    isEarned ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {badge.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {badge.description}
                  </p>
                  
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    isEarned
                      ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
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
