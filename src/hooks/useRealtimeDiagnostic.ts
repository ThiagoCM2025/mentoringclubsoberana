import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticStatus {
  completed: boolean;
  progress: number;
  currentStep: number;
}

const TOTAL_STEPS = 6;

const calculateProgress = (diagnostic: any): { progress: number; currentStep: number } => {
  if (!diagnostic) return { progress: 0, currentStep: 1 };

  const fields = [
    diagnostic.practice_area,
    diagnostic.years_practicing,
    diagnostic.has_office !== null ? 'filled' : null,
    diagnostic.monthly_revenue,
    diagnostic.main_goals?.length > 0 ? 'filled' : null,
    diagnostic.main_challenges?.length > 0 ? 'filled' : null,
  ];

  const filledCount = fields.filter(Boolean).length;
  const progress = Math.round((filledCount / TOTAL_STEPS) * 100);
  const currentStep = filledCount + 1;

  return { progress, currentStep };
};

export const useRealtimeDiagnostic = (userId: string | undefined) => {
  const [status, setStatus] = useState<DiagnosticStatus>({
    completed: false,
    progress: 0,
    currentStep: 1,
  });
  const [loading, setLoading] = useState(true);

  const fetchDiagnosticStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("student_diagnostics")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const { progress, currentStep } = calculateProgress(data);
        setStatus({
          completed: data.completed || false,
          progress,
          currentStep,
        });
      } else {
        setStatus({ completed: false, progress: 0, currentStep: 1 });
      }
    } catch (error) {
      console.error("Error fetching diagnostic status:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchDiagnosticStatus();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`diagnostic-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_diagnostics",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Diagnostic realtime update:", payload);
          const newData = payload.new as any;
          if (newData) {
            const { progress, currentStep } = calculateProgress(newData);
            setStatus({
              completed: newData.completed || false,
              progress,
              currentStep,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchDiagnosticStatus]);

  return { ...status, loading, refetch: fetchDiagnosticStatus };
};
