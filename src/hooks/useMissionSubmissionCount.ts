import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMissionSubmissionCount = (missionId: string | undefined, userId: string | undefined) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!missionId || !userId) {
      setCount(0);
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      try {
        const { count: historyCount, error } = await supabase
          .from("mission_submission_history")
          .select("*", { count: "exact", head: true })
          .eq("mission_id", missionId)
          .eq("user_id", userId);

        if (error) throw error;
        setCount(historyCount || 0);
      } catch (error) {
        console.error("Error fetching submission count:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [missionId, userId]);

  return { count, loading };
};
