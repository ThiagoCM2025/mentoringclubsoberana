import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProgramProgress {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  currentWeek: number;
  totalWeeks: number;
  completedWeeks: number[];
  currentMission: {
    id: string;
    title: string;
    status: 'pending' | 'submitted' | 'approved';
  } | null;
  xpEarned: number;
}

export const useProgramProgress = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ProgramProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgramProgress();
    }
  }, [user]);

  const calculateCurrentWeek = (enrolledAt: string): number => {
    const enrolled = new Date(enrolledAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - enrolled.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(12, Math.floor(diffDays / 7) + 1));
  };

  const fetchProgramProgress = async () => {
    if (!user) return;

    try {
      // Buscar matrículas em programas (cursos com duration_weeks)
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          enrolled_at,
          courses (
            id,
            title,
            duration_weeks,
            program_type
          )
        `)
        .eq("user_id", user.id);

      if (!enrollments) {
        setPrograms([]);
        setLoading(false);
        return;
      }

      const programsData: ProgramProgress[] = [];

      for (const enrollment of enrollments) {
        const course = enrollment.courses as any;
        if (!course || !course.duration_weeks || course.duration_weeks < 2) continue;

        const currentWeek = calculateCurrentWeek(enrollment.enrolled_at);
        const totalWeeks = course.duration_weeks || 12;

        // Buscar missões completadas (semanas com missão aprovada)
        const { data: completions } = await supabase
          .from("user_mission_completions")
          .select(`
            mission_id,
            status,
            weekly_missions (
              week_number,
              title
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "approved");

        // Filtrar por missões deste curso
        const { data: courseMissions } = await supabase
          .from("weekly_missions")
          .select("id, week_number")
          .eq("course_id", course.id);

        const courseMissionIds = courseMissions?.map(m => m.id) || [];
        const completedWeeks = completions
          ?.filter(c => courseMissionIds.includes(c.mission_id))
          ?.map(c => (c.weekly_missions as any)?.week_number)
          ?.filter(Boolean) || [];

        // Buscar missão atual da semana
        const { data: currentMissionData } = await supabase
          .from("weekly_missions")
          .select("id, title")
          .eq("course_id", course.id)
          .eq("week_number", currentWeek)
          .eq("is_active", true)
          .maybeSingle();

        let currentMission = null;
        if (currentMissionData) {
          const { data: missionCompletion } = await supabase
            .from("user_mission_completions")
            .select("status")
            .eq("user_id", user.id)
            .eq("mission_id", currentMissionData.id)
            .maybeSingle();

          currentMission = {
            id: currentMissionData.id,
            title: currentMissionData.title,
            status: (missionCompletion?.status as 'pending' | 'submitted' | 'approved') || 'pending'
          };
        }

        // Buscar XP ganho no curso
        const { data: gamification } = await supabase
          .from("course_gamification")
          .select("xp")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .maybeSingle();

        programsData.push({
          courseId: course.id,
          courseTitle: course.title,
          enrolledAt: enrollment.enrolled_at,
          currentWeek,
          totalWeeks,
          completedWeeks: [...new Set(completedWeeks)],
          currentMission,
          xpEarned: gamification?.xp || 0
        });
      }

      setPrograms(programsData);
    } catch (error) {
      console.error("Error fetching program progress:", error);
    } finally {
      setLoading(false);
    }
  };

  return { programs, loading, refetch: fetchProgramProgress };
};
