import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Crown,
  Medal,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompletedUser {
  user_id: string;
  xp_earned: number;
  reviewed_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface WeekCompletionRankingProps {
  missionId: string;
  weekNumber: number;
  currentUserId: string;
}

export const WeekCompletionRanking = ({
  missionId,
  weekNumber,
  currentUserId
}: WeekCompletionRankingProps) => {
  const [completions, setCompletions] = useState<CompletedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompletions = async () => {
      setIsLoading(true);
      try {
        // Fetch approved completions
        const { data: completionsData, error: completionsError } = await supabase
          .from('user_mission_completions')
          .select('user_id, xp_earned, reviewed_at')
          .eq('mission_id', missionId)
          .eq('status', 'approved')
          .order('reviewed_at', { ascending: true })
          .limit(15);

        if (completionsError) throw completionsError;

        if (completionsData && completionsData.length > 0) {
          const userIds = [...new Set(completionsData.map(c => c.user_id))];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', userIds);

          const profilesMap = new Map(
            profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
          );

          const completionsWithProfiles: CompletedUser[] = completionsData.map(completion => ({
            user_id: completion.user_id,
            xp_earned: completion.xp_earned || 100,
            reviewed_at: completion.reviewed_at || '',
            profile: profilesMap.get(completion.user_id) || null
          }));

          setCompletions(completionsWithProfiles);
        } else {
          setCompletions([]);
        }
      } catch (error) {
        console.error('Error fetching week completions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`week-completions-${missionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_mission_completions',
          filter: `mission_id=eq.${missionId}`
        },
        () => {
          fetchCompletions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-300" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return "ring-2 ring-yellow-400 ring-offset-2 ring-offset-zinc-900";
    if (index === 1) return "ring-2 ring-gray-300 ring-offset-2 ring-offset-zinc-900";
    if (index === 2) return "ring-2 ring-amber-600 ring-offset-2 ring-offset-zinc-900";
    return "";
  };

  const currentUserCompleted = completions.some(c => c.user_id === currentUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-secondary animate-spin" />
      </div>
    );
  }

  if (completions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent rounded-xl p-4 border border-secondary/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h4 className="font-semibold text-cream text-sm">
              Quem Completou Esta Semana
            </h4>
            <p className="text-xs text-cream/50">
              Semana {weekNumber}
            </p>
          </div>
        </div>
        
        <Badge 
          className={cn(
            "text-xs font-semibold",
            currentUserCompleted 
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-secondary/20 text-secondary border-secondary/30"
          )}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {completions.length} Soberana{completions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Avatars Grid */}
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-wrap gap-3">
          {completions.map((completion, index) => {
            const isCurrentUser = completion.user_id === currentUserId;
            
            return (
              <Tooltip key={completion.user_id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Medal for top 3 */}
                    {index < 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        className="absolute -top-2 -right-1 z-10"
                      >
                        {getMedalIcon(index)}
                      </motion.div>
                    )}
                    
                    <Avatar 
                      className={cn(
                        "w-11 h-11 cursor-pointer transition-all hover:scale-110",
                        getMedalColor(index),
                        isCurrentUser && "ring-2 ring-green-400 ring-offset-2 ring-offset-zinc-900"
                      )}
                    >
                      <AvatarImage src={completion.profile?.avatar_url || undefined} />
                      <AvatarFallback className={cn(
                        "text-xs font-semibold",
                        index === 0 ? "bg-yellow-400/20 text-yellow-400" :
                        index === 1 ? "bg-gray-300/20 text-gray-300" :
                        index === 2 ? "bg-amber-600/20 text-amber-600" :
                        "bg-secondary/20 text-secondary"
                      )}>
                        {getInitials(completion.profile?.full_name || null)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Current user indicator */}
                    {isCurrentUser && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                      >
                        <Badge className="bg-green-500 text-white text-[8px] px-1 py-0 h-4">
                          Você
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="bg-zinc-900 border-secondary/30 text-cream"
                >
                  <div className="text-center">
                    <p className="font-semibold text-sm">
                      {completion.profile?.full_name || "Aluna"}
                      {isCurrentUser && " (Você)"}
                    </p>
                    <p className="text-xs text-secondary">
                      +{completion.xp_earned} XP
                    </p>
                    {index === 0 && (
                      <p className="text-xs text-yellow-400 mt-1">
                        🥇 Primeira a completar!
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Encouragement message */}
      {!currentUserCompleted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-cream/50 mt-3 text-center"
        >
          Complete a missão e apareça no ranking! 🎯
        </motion.p>
      )}
    </motion.div>
  );
};
