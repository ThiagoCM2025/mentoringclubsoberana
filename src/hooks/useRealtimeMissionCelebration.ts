import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useConfetti } from "./useConfetti";
import { toast } from "sonner";


export interface CelebrationData {
  missionTitle: string;
  weekNumber: number;
  xpEarned: number;
  emoji: string;
}

export interface RejectionData {
  missionTitle: string;
  weekNumber: number;
  feedback: string | null;
}

const getMotivationalMessage = (week: number): string => {
  if (week <= 3) {
    return "Você está construindo a fundação do seu sucesso! Continue firme!";
  } else if (week <= 6) {
    return "A transformação está acontecendo! Você está dominando a arte da conversão!";
  } else if (week <= 9) {
    return "Você está brilhando! A escala do seu escritório está cada vez mais próxima!";
  } else {
    return "Incrível! Você está na reta final para se tornar uma Advogada Soberana!";
  }
};

export const useRealtimeMissionCelebration = (
  userId: string | undefined,
  courseId: string | undefined
) => {
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [rejection, setRejection] = useState<RejectionData | null>(null);
  const { fireGoldConfetti, fireCelebration } = useConfetti();

  const clearCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const clearRejection = useCallback(() => {
    setRejection(null);
  }, []);

  useEffect(() => {
    if (!userId || !courseId) return;

    const channel = supabase
      .channel(`mission-celebration-${userId}-${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_mission_completions",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Trigger celebration when status changes to 'approved'
          if (newData.status === "approved" && oldData?.status !== "approved") {
            console.log("Mission approved! Triggering celebration:", newData);

            try {
              // Fetch mission details
              const { data: mission, error } = await supabase
                .from("weekly_missions")
                .select("title, week_number, xp_reward, gamification_emoji, course_id")
                .eq("id", newData.mission_id)
                .single();

              if (error) throw error;

              if (mission && mission.course_id === courseId) {
                // Fire confetti!
                fireGoldConfetti();
                setTimeout(() => fireCelebration(), 500);

                // Set celebration data for modal
                setCelebration({
                  missionTitle: mission.title,
                  weekNumber: mission.week_number,
                  xpEarned: mission.xp_reward || newData.xp_earned || 100,
                  emoji: mission.gamification_emoji || "🏆",
                });

                // Show toast
                toast.success(
                  `🎉 Semana ${mission.week_number} Completa! +${mission.xp_reward || 100} XP`,
                  {
                    description: getMotivationalMessage(mission.week_number),
                    duration: 5000,
                  }
                );
              }
            } catch (error) {
              console.error("Error fetching mission details:", error);
            }
          }

          // Trigger alert when status changes to 'rejected'
          if (newData.status === "rejected" && oldData?.status !== "rejected") {
            console.log("Mission rejected! Triggering alert:", newData);

            try {
              // Fetch mission details
              const { data: mission, error } = await supabase
                .from("weekly_missions")
                .select("title, week_number, course_id")
                .eq("id", newData.mission_id)
                .single();

              if (error) throw error;

              if (mission && mission.course_id === courseId) {
                // Set rejection data
                setRejection({
                  missionTitle: mission.title,
                  weekNumber: mission.week_number,
                  feedback: newData.admin_feedback,
                });

                // Show warning toast
                toast.warning(
                  `📝 Semana ${mission.week_number}: Ajustes necessários`,
                  {
                    description: newData.admin_feedback 
                      ? `"${newData.admin_feedback.substring(0, 100)}${newData.admin_feedback.length > 100 ? '...' : ''}"`
                      : "Veja o feedback da mentora e reenvie sua missão.",
                    duration: 8000,
                  }
                );
              }
            } catch (error) {
              console.error("Error fetching mission details:", error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, courseId, fireGoldConfetti, fireCelebration]);

  return { celebration, clearCelebration, rejection, clearRejection };
};
