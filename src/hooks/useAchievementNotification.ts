/**
 * Hook to send push notifications when student is close to earning achievements
 * Standalone implementation to avoid circular dependencies
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const ACHIEVEMENT_NOTIFICATION_KEY = "last_achievement_notification";
const NOTIFICATION_COOLDOWN_HOURS = 24;

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
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  badge_id: string;
}

interface NearbyAchievement {
  type: "badge" | "level";
  name: string;
  progress: number;
  remaining: number | string;
}

export const useAchievementNotification = () => {
  const { user } = useAuth();
  const hasChecked = useRef(false);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);

  // Fetch data directly to avoid circular dependencies
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const [statsRes, badgesRes, earnedRes] = await Promise.all([
        supabase.from("user_gamification").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("badges").select("id, name, requirement_type, requirement_value"),
        supabase.from("user_badges").select("badge_id").eq("user_id", user.id)
      ]);
      
      if (statsRes.data) setStats(statsRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);
      if (earnedRes.data) setEarnedBadges(earnedRes.data);
    };
    
    fetchData();
  }, [user]);

  // Check for nearby achievements and send notification
  useEffect(() => {
    if (!user || hasChecked.current || !stats) return;
    
    // Check if push is supported and subscribed
    const checkPushAndNotify = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission !== "granted") return;
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;
        
        hasChecked.current = true;
        
        // Check cooldown
        const lastNotification = localStorage.getItem(ACHIEVEMENT_NOTIFICATION_KEY);
        if (lastNotification) {
          const lastTime = new Date(lastNotification).getTime();
          const hoursSinceNotification = (Date.now() - lastTime) / (1000 * 60 * 60);
          if (hoursSinceNotification < NOTIFICATION_COOLDOWN_HOURS) {
            return;
          }
        }

        const nearbyAchievements = getNearbyAchievements();
        
        if (nearbyAchievements.length > 0) {
          const achievement = nearbyAchievements[0];
          
          if (achievement.type === "level") {
            await registration.showNotification("Quase no próximo nível! 🚀", {
              body: `Faltam apenas ${achievement.remaining} XP para alcançar o nível ${achievement.name}!`,
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
              tag: "achievement-notification",
            });
          } else {
            await registration.showNotification("Conquista próxima! 🏆", {
              body: `Você está ${achievement.progress}% do caminho para conquistar "${achievement.name}"!`,
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
              tag: "achievement-notification",
            });
          }

          localStorage.setItem(ACHIEVEMENT_NOTIFICATION_KEY, new Date().toISOString());
        }
      } catch (error) {
        console.error("Error checking push notifications:", error);
      }
    };

    // Check after a delay to not block initial load
    const timeout = setTimeout(checkPushAndNotify, 3000);
    return () => clearTimeout(timeout);
  }, [user, stats, badges, earnedBadges]);

  const getNearbyAchievements = (): NearbyAchievement[] => {
    if (!stats) return [];
    
    const achievements: NearbyAchievement[] = [];
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));

    // Check level progress
    const currentLevel = stats.level || 1;
    const xpForNextLevel = currentLevel * 500;
    const xpProgress = stats.xp / xpForNextLevel;
    const xpRemaining = xpForNextLevel - stats.xp;
    
    if (xpProgress >= 0.8 && xpProgress < 1) {
      achievements.push({
        type: "level",
        name: String(currentLevel + 1),
        progress: Math.round(xpProgress * 100),
        remaining: xpRemaining,
      });
    }

    // Check badge progress
    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let currentValue = 0;
      
      switch (badge.requirement_type) {
        case "lessons_completed":
          currentValue = stats.total_lessons_completed;
          break;
        case "streak_days":
          currentValue = stats.streak_days;
          break;
        case "xp":
          currentValue = stats.xp;
          break;
        case "study_minutes":
          currentValue = stats.total_study_minutes;
          break;
        default:
          continue;
      }

      const progress = currentValue / badge.requirement_value;
      
      if (progress >= 0.8 && progress < 1) {
        const remaining = badge.requirement_value - currentValue;
        achievements.push({
          type: "badge",
          name: badge.name,
          progress: Math.round(progress * 100),
          remaining: remaining,
        });
      }
    }

    return achievements;
  };

  return {
    getNearbyAchievements,
  };
};
