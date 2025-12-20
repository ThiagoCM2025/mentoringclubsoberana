import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  xp: number;
  level: number;
  streak_days: number;
  rank: number;
}

interface XPLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  loading?: boolean;
}

export function XPLeaderboard({ leaderboard, loading }: XPLeaderboardProps) {
  const { user } = useAuth();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-cream/50">{rank}º</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/40";
      case 2:
        return "bg-gradient-to-br from-gray-300/20 to-gray-400/10 border-gray-300/40";
      case 3:
        return "bg-gradient-to-br from-amber-600/20 to-amber-700/10 border-amber-600/40";
      default:
        return "bg-zinc-800/50 border-secondary/20";
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-cream">Top Alunas</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-zinc-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-zinc-700 rounded w-24" />
                <div className="h-2 bg-zinc-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-cream">Top Alunas</h3>
        </div>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-cream/20 mx-auto mb-2" />
          <p className="text-cream/50 text-sm">Nenhum ranking disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-cream">Top Alunas</h3>
        </div>
        <span className="text-xs text-cream/50">Por XP</span>
      </div>

      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry, index) => {
          const isCurrentUser = entry.user_id === user?.id;
          const initials = entry.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "??";

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                getRankBadgeClass(entry.rank),
                isCurrentUser && "ring-2 ring-secondary/50 bg-secondary/5"
              )}
            >
              {/* Rank Badge */}
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Name and XP */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate",
                  isCurrentUser ? "text-secondary" : "text-cream"
                )}>
                  {entry.full_name || "Aluna"}
                  {isCurrentUser && " (você)"}
                </p>
                <div className="flex items-center gap-2 text-xs text-cream/50">
                  <span>{entry.xp.toLocaleString()} XP</span>
                  <span>•</span>
                  <span>Nível {entry.level}</span>
                </div>
              </div>

              {/* Streak */}
              {entry.streak_days > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-medium">{entry.streak_days}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
