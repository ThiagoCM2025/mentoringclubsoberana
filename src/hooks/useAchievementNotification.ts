import { useEffect, useRef } from "react";
import { useGamification } from "./useGamification";
import { usePushNotifications } from "./usePushNotifications";
import { useAuth } from "./useAuth";

const ACHIEVEMENT_NOTIFICATION_KEY = "last_achievement_notification";
const NOTIFICATION_COOLDOWN_HOURS = 24; // Only notify once per day

interface NearbyAchievement {
  type: "badge" | "level";
  name: string;
  progress: number;
  remaining: number | string;
}

export const useAchievementNotification = () => {
  const { user } = useAuth();
  const { stats, badges, earnedBadges, loading } = useGamification();
  const { isSubscribed, isSupported } = usePushNotifications();
  const hasChecked = useRef(false);

  // Check for nearby achievements and send notification
  useEffect(() => {
    if (!user || loading || hasChecked.current) return;
    if (!isSupported || !isSubscribed) return;
    if (!stats) return;

    hasChecked.current = true;

    const checkAndNotify = async () => {
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
        
        // Show browser notification
        if (Notification.permission === "granted") {
          try {
            const registration = await navigator.serviceWorker.ready;
            
            if (achievement.type === "level") {
              await registration.showNotification("Quase no próximo nível! 🚀", {
                body: `Faltam apenas ${achievement.remaining} XP para alcançar o nível ${achievement.name}!`,
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                tag: "achievement-notification",
                renotify: true,
              });
            } else {
              await registration.showNotification("Conquista próxima! 🏆", {
                body: `Você está ${achievement.progress}% do caminho para conquistar "${achievement.name}"!`,
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                tag: "achievement-notification",
                renotify: true,
              });
            }

            localStorage.setItem(ACHIEVEMENT_NOTIFICATION_KEY, new Date().toISOString());
          } catch (error) {
            console.error("Error showing notification:", error);
          }
        }
      }
    };

    // Check after a delay to not block initial load
    const timeout = setTimeout(checkAndNotify, 3000);
    return () => clearTimeout(timeout);
  }, [user, loading, stats, badges, earnedBadges, isSubscribed, isSupported]);

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
