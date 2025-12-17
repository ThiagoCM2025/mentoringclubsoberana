import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GamificationStats {
  xp: number;
  level: number;
  streak_days: number;
  total_lessons_completed: number;
  total_study_minutes: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  xp: number;
  level: number;
  streak_days: number;
  rank: number;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;

    // Fetch user stats
    const { data: statsData } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (statsData) {
      setStats(statsData);
    } else {
      // Create initial record if doesn't exist
      const { data: newStats } = await supabase
        .from("user_gamification")
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (newStats) setStats(newStats);
    }

    // Fetch all badges
    const { data: badgesData } = await supabase
      .from("badges")
      .select("*")
      .order("requirement_value");

    if (badgesData) setBadges(badgesData);

    // Fetch earned badges
    const { data: earnedData } = await supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", user.id);

    if (earnedData) setEarnedBadges(earnedData);

    // Fetch leaderboard using RPC function
    const { data: leaderboardData } = await supabase
      .rpc("get_leaderboard", { limit_count: 10 });

    if (leaderboardData) setLeaderboard(leaderboardData);

    setLoading(false);
  };

  const calculateLevel = (xp: number): number => {
    // Level formula: every 500 XP = 1 level
    return Math.floor(xp / 500) + 1;
  };

  const getXpForNextLevel = (currentLevel: number): number => {
    return currentLevel * 500;
  };

  const getCurrentLevelProgress = (xp: number): number => {
    const level = calculateLevel(xp);
    const xpForCurrentLevel = (level - 1) * 500;
    const xpForNextLevel = level * 500;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
  };

  const checkAndAwardBadges = async () => {
    if (!user || !stats) return;

    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));
    const newBadgesToAward: string[] = [];

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let earned = false;

      switch (badge.requirement_type) {
        case "lessons_completed":
          earned = stats.total_lessons_completed >= badge.requirement_value;
          break;
        case "streak_days":
          earned = stats.streak_days >= badge.requirement_value;
          break;
      }

      if (earned) {
        newBadgesToAward.push(badge.id);
      }
    }

    // Award new badges
    if (newBadgesToAward.length > 0) {
      for (const badgeId of newBadgesToAward) {
        await supabase
          .from("user_badges")
          .insert({ user_id: user.id, badge_id: badgeId });
      }

      // Refetch earned badges
      const { data: earnedData } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      if (earnedData) setEarnedBadges(earnedData);
    }

    return newBadgesToAward;
  };

  const userRank = leaderboard.find(l => l.user_id === user?.id)?.rank || null;

  return {
    stats,
    badges,
    earnedBadges,
    leaderboard,
    loading,
    calculateLevel,
    getXpForNextLevel,
    getCurrentLevelProgress,
    checkAndAwardBadges,
    userRank,
    refresh: fetchGamificationData
  };
};
