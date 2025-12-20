import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
}

interface NewBadgeEvent {
  badge: Badge;
  earnedAt: string;
}

export const useRealtimeAchievements = () => {
  const { user } = useAuth();
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
    setNewBadge(null);
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log("[RealtimeAchievements] Setting up realtime listener for user:", user.id);

    const channel = supabase
      .channel('user-badges-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log("[RealtimeAchievements] New badge earned!", payload);
          
          // Fetch the badge details
          const { data: badge, error } = await supabase
            .from('badges')
            .select('*')
            .eq('id', payload.new.badge_id)
            .maybeSingle();

          if (error) {
            console.error("[RealtimeAchievements] Error fetching badge:", error);
            return;
          }

          if (badge) {
            console.log("[RealtimeAchievements] Badge details:", badge);
            
            // Show toast notification
            toast.success(`🏆 Nova Conquista: ${badge.name}!`, {
              description: badge.description,
              duration: 5000,
            });

            // Set the new badge and show celebration modal
            setNewBadge(badge);
            setShowCelebration(true);

            // Create in-app notification
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: '🏆 Nova Conquista Desbloqueada!',
              message: `Você conquistou: ${badge.name} - ${badge.description}. +${badge.xp_reward} XP!`,
              type: 'success'
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("[RealtimeAchievements] Subscription status:", status);
      });

    return () => {
      console.log("[RealtimeAchievements] Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    newBadge,
    showCelebration,
    closeCelebration
  };
};
