import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  Lock, 
  Unlock, 
  Trophy,
  Percent,
  Book,
  Video,
  Crown,
  Award,
  Medal,
  CheckCircle,
  Loader2
} from "lucide-react";

interface LevelReward {
  id: string;
  level: number;
  reward_type: string;
  reward_value: string;
  reward_description: string;
  icon: string;
}

interface UserReward {
  id: string;
  reward_id: string;
  is_claimed: boolean;
  claimed_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  award: Award,
  percent: Percent,
  book: Book,
  video: Video,
  medal: Medal,
  crown: Crown,
  gift: Gift
};

export function RewardsCenter() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<LevelReward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [user]);

  const fetchRewards = async () => {
    if (!user) return;

    try {
      // Get user level
      const { data: gamificationData } = await supabase
        .from("user_gamification")
        .select("level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (gamificationData) {
        setUserLevel(gamificationData.level);
      }

      // Get all rewards
      const { data: rewardsData } = await supabase
        .from("level_rewards")
        .select("*")
        .order("level");

      if (rewardsData) {
        setRewards(rewardsData);
      }

      // Get user's claimed rewards
      const { data: userRewardsData } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", user.id);

      if (userRewardsData) {
        setUserRewards(userRewardsData);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (reward: LevelReward) => {
    if (!user) return;
    setClaiming(reward.id);

    try {
      // Check if already claimed
      const existingReward = userRewards.find(ur => ur.reward_id === reward.id);
      
      if (existingReward) {
        // Update to claimed
        await supabase
          .from("user_rewards")
          .update({ is_claimed: true, claimed_at: new Date().toISOString() })
          .eq("id", existingReward.id);
      } else {
        // Insert new claimed reward
        await supabase.from("user_rewards").insert({
          user_id: user.id,
          reward_id: reward.id,
          is_claimed: true
        });
      }

      // Update local state
      setUserRewards(prev => {
        const existing = prev.find(ur => ur.reward_id === reward.id);
        if (existing) {
          return prev.map(ur => ur.reward_id === reward.id ? { ...ur, is_claimed: true } : ur);
        }
        return [...prev, { id: '', reward_id: reward.id, is_claimed: true, claimed_at: new Date().toISOString() }];
      });

      toast.success(`Recompensa resgatada: ${reward.reward_description}`);
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Erro ao resgatar recompensa");
    } finally {
      setClaiming(null);
    }
  };

  const getRewardStatus = (reward: LevelReward) => {
    const userReward = userRewards.find(ur => ur.reward_id === reward.id);
    const isUnlocked = userLevel >= reward.level;
    const isClaimed = userReward?.is_claimed || false;

    return { isUnlocked, isClaimed };
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-secondary/30">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cream">
          <Gift className="w-5 h-5 text-secondary" />
          Central de Recompensas
        </CardTitle>
        <p className="text-sm text-cream/60">
          Desbloqueie recompensas exclusivas conforme você sobe de nível!
        </p>
      </CardHeader>

      <CardContent>
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-cream/60 text-sm">Seu Nível Atual</p>
              <p className="text-2xl font-bold text-cream">Nível {userLevel}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {rewards.map((reward, index) => {
              const { isUnlocked, isClaimed } = getRewardStatus(reward);
              const IconComponent = iconMap[reward.icon] || Gift;

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? isClaimed
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-secondary/10 border-secondary/30 hover:border-secondary"
                      : "bg-zinc-800/50 border-zinc-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isUnlocked
                        ? isClaimed
                          ? "bg-green-500/20"
                          : "bg-secondary/20"
                        : "bg-zinc-700/50"
                    }`}>
                      {isUnlocked ? (
                        <IconComponent className={`w-7 h-7 ${
                          isClaimed ? "text-green-500" : "text-secondary"
                        }`} />
                      ) : (
                        <Lock className="w-7 h-7 text-cream/30" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            isUnlocked ? "border-secondary text-secondary" : "border-cream/30 text-cream/50"
                          }`}
                        >
                          Nível {reward.level}
                        </Badge>
                        {isClaimed && (
                          <Badge className="bg-green-500/20 text-green-500 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resgatado
                          </Badge>
                        )}
                      </div>
                      <p className={`font-medium ${isUnlocked ? "text-cream" : "text-cream/50"}`}>
                        {reward.reward_description}
                      </p>
                    </div>

                    {/* Action */}
                    {isUnlocked && !isClaimed && (
                      <Button
                        onClick={() => handleClaimReward(reward)}
                        disabled={claiming === reward.id}
                        size="sm"
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      >
                        {claiming === reward.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 mr-1" />
                            Resgatar
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Progress indicator for locked rewards */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                      <span className="text-sm text-cream/70">
                        Faltam {reward.level - userLevel} níveis
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
