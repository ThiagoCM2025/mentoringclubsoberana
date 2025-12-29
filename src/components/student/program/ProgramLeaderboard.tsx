import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Flame, Trophy, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_title: string | null;
  missions_completed: number;
  rank: number;
}

interface ProgramLeaderboardProps {
  courseId: string;
  className?: string;
}

export const ProgramLeaderboard = ({ courseId, className }: ProgramLeaderboardProps) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [courseId]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_program_leaderboard', {
        p_course_id: courseId,
        limit_count: 10
      });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching program leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-cream/50">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 border-yellow-500/30";
      case 2:
        return "bg-gray-400/20 border-gray-400/30";
      case 3:
        return "bg-amber-600/20 border-amber-600/30";
      default:
        return "bg-zinc-800 border-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-zinc-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <Users className="w-12 h-12 text-cream/20 mb-3" />
        <p className="text-cream/50 text-sm">
          Ainda não há participantes no ranking
        </p>
        <p className="text-cream/30 text-xs mt-1">
          Complete missões para aparecer aqui!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {entries.map((entry, index) => {
        const isCurrentUser = entry.user_id === user?.id;
        
        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-colors",
              isCurrentUser 
                ? "bg-secondary/10 border-secondary/30" 
                : "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800"
            )}
          >
            {/* Rank */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              getRankBadgeClass(entry.rank)
            )}>
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar */}
            <Avatar className="w-10 h-10 border-2 border-secondary/20">
              <AvatarImage src={entry.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary/20 text-secondary text-sm">
                {entry.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium truncate text-sm",
                isCurrentUser ? "text-secondary" : "text-cream"
              )}>
                {entry.full_name || "Anônima"}
                {isCurrentUser && <span className="text-xs text-cream/50 ml-2">(você)</span>}
              </p>
              <p className="text-xs text-cream/50">
                {entry.current_title || "Advogada Invisível"}
              </p>
            </div>

            {/* XP and Stats */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-secondary font-bold text-sm">
                <Flame className="w-4 h-4" />
                {entry.xp.toLocaleString()}
              </div>
              <p className="text-xs text-cream/40">
                {entry.missions_completed} missões
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
