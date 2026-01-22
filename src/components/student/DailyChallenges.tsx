import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Target, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  Trophy,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getBrazilToday, formatBrazilDateISO } from "@/lib/dateUtils";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  is_active: boolean;
}

interface UserProgress {
  lessonsToday: number;
  studyMinutesToday: number;
  postsToday: number;
  currentStreak: number;
}

const CHALLENGE_ICONS: Record<string, typeof Target> = {
  complete_lessons: Target,
  study_minutes: Clock,
  community_post: MessageSquare,
  streak: Flame
};

export function DailyChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState<UserProgress>({
    lessonsToday: 0,
    studyMinutesToday: 0,
    postsToday: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchUserProgress();
      fetchCompletions();
    }
  }, [user]);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("is_active", true)
      .order("challenge_type", { ascending: true });

    if (data) setChallenges(data);
    setLoading(false);
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    const today = getBrazilToday();

    // Lessons completed today
    const { count: lessonsCount } = await supabase
      .from("progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("completed_at", today.toISOString());

    // Study minutes today (from gamification)
    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("total_study_minutes, streak_days")
      .eq("user_id", user.id)
      .maybeSingle();

    // Posts today
    const { count: postsCount } = await supabase
      .from("community_posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    setUserProgress({
      lessonsToday: lessonsCount || 0,
      studyMinutesToday: gamification?.total_study_minutes || 0,
      postsToday: postsCount || 0,
      currentStreak: gamification?.streak_days || 0
    });
  };

  const fetchCompletions = async () => {
    if (!user) return;

    const today = formatBrazilDateISO();

    const { data } = await supabase
      .from("user_challenge_completions")
      .select("challenge_id")
      .eq("user_id", user.id)
      .eq("completion_date", today);

    if (data) {
      setCompletedIds(new Set(data.map(c => c.challenge_id)));
    }
  };

  const getChallengeProgress = (challenge: Challenge): number => {
    switch (challenge.requirement_type) {
      case "complete_lessons":
        return Math.min(100, (userProgress.lessonsToday / challenge.requirement_value) * 100);
      case "study_minutes":
        return Math.min(100, (userProgress.studyMinutesToday / challenge.requirement_value) * 100);
      case "community_post":
        return Math.min(100, (userProgress.postsToday / challenge.requirement_value) * 100);
      case "streak":
        return Math.min(100, (userProgress.currentStreak / challenge.requirement_value) * 100);
      default:
        return 0;
    }
  };

  const getCurrentValue = (challenge: Challenge): number => {
    switch (challenge.requirement_type) {
      case "complete_lessons":
        return userProgress.lessonsToday;
      case "study_minutes":
        return userProgress.studyMinutesToday;
      case "community_post":
        return userProgress.postsToday;
      case "streak":
        return userProgress.currentStreak;
      default:
        return 0;
    }
  };

  const claimReward = async (challenge: Challenge) => {
    if (!user) return;

    const progress = getChallengeProgress(challenge);
    if (progress < 100 || completedIds.has(challenge.id)) return;

    const today = formatBrazilDateISO();

    // Insert completion
    const { error } = await supabase
      .from("user_challenge_completions")
      .insert({
        user_id: user.id,
        challenge_id: challenge.id,
        completion_date: today,
        xp_earned: challenge.xp_reward
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resgatar a recompensa",
        variant: "destructive"
      });
      return;
    }

    // Update gamification XP
    const { data: existing } = await supabase
      .from("user_gamification")
      .select("xp")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_gamification")
        .update({ xp: existing.xp + challenge.xp_reward })
        .eq("user_id", user.id);
    }

    setCompletedIds(prev => new Set([...prev, challenge.id]));

    toast({
      title: "🎉 Desafio Concluído!",
      description: `Você ganhou ${challenge.xp_reward} XP!`,
    });
  };

  const dailyChallenges = challenges.filter(c => c.challenge_type === "daily");
  const weeklyChallenges = challenges.filter(c => c.challenge_type === "weekly");

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-zinc-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-cream">Desafios Diários</h3>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {dailyChallenges.map((challenge, i) => {
              const Icon = CHALLENGE_ICONS[challenge.requirement_type] || Target;
              const progress = getChallengeProgress(challenge);
              const currentValue = getCurrentValue(challenge);
              const isCompleted = completedIds.has(challenge.id);
              const canClaim = progress >= 100 && !isCompleted;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    isCompleted 
                      ? "bg-green-500/10 border-green-500/30" 
                      : canClaim
                        ? "bg-secondary/10 border-secondary/50 shadow-lg shadow-secondary/10"
                        : "bg-zinc-900/50 border-secondary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isCompleted ? "bg-green-500/20" : "bg-secondary/20"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Icon className="w-5 h-5 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-cream text-sm">{challenge.title}</h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20">
                          <Sparkles className="w-3 h-3 text-secondary" />
                          <span className="text-xs font-medium text-secondary">
                            +{challenge.xp_reward} XP
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-cream/60 mt-0.5">
                        {challenge.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress 
                          value={progress} 
                          className="flex-1 h-1.5 bg-secondary/20" 
                        />
                        <span className="text-xs text-cream/70 whitespace-nowrap">
                          {currentValue}/{challenge.requirement_value}
                        </span>
                      </div>
                    </div>
                    {canClaim && (
                      <Button
                        size="sm"
                        onClick={() => claimReward(challenge)}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0"
                      >
                        Resgatar
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Weekly Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-cream">Desafios Semanais</h3>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {weeklyChallenges.map((challenge, i) => {
              const Icon = CHALLENGE_ICONS[challenge.requirement_type] || Target;
              const progress = getChallengeProgress(challenge);
              const currentValue = getCurrentValue(challenge);
              const isCompleted = completedIds.has(challenge.id);
              const canClaim = progress >= 100 && !isCompleted;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    isCompleted 
                      ? "bg-green-500/10 border-green-500/30" 
                      : canClaim
                        ? "bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10"
                        : "bg-zinc-900/50 border-orange-500/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isCompleted ? "bg-green-500/20" : "bg-orange-500/20"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Icon className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-cream text-sm">{challenge.title}</h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20">
                          <Sparkles className="w-3 h-3 text-orange-500" />
                          <span className="text-xs font-medium text-orange-500">
                            +{challenge.xp_reward} XP
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-cream/60 mt-0.5">
                        {challenge.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress 
                          value={progress} 
                          className="flex-1 h-1.5 bg-orange-500/20" 
                        />
                        <span className="text-xs text-cream/70 whitespace-nowrap">
                          {currentValue}/{challenge.requirement_value}
                        </span>
                      </div>
                    </div>
                    {canClaim && (
                      <Button
                        size="sm"
                        onClick={() => claimReward(challenge)}
                        className="bg-orange-500 hover:bg-orange-500/90 text-white shrink-0"
                      >
                        Resgatar
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
