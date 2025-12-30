import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProfile {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface DashboardCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  program_type: string | null;
  duration_weeks: number | null;
}

interface DashboardEnrollment {
  course_id: string;
  enrolled_at: string;
  course: DashboardCourse;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
}

interface DashboardGamification {
  xp: number;
  level: number;
  streak_days: number;
  total_lessons_completed: number;
  last_activity_date: string | null;
}

interface ContinueWatchingItem {
  course_id: string;
  course_title: string;
  course_thumbnail: string | null;
  lesson_id: string;
  lesson_title: string;
  module_title: string;
  watch_percentage: number;
  last_watched: string;
}

interface DashboardStats {
  active_courses: number;
  total_study_minutes: number;
  certificates_count: number;
  badges_count: number;
}

export interface StudentDashboardData {
  profile: DashboardProfile | null;
  enrollments: DashboardEnrollment[];
  gamification: DashboardGamification;
  continue_watching: ContinueWatchingItem[];
  stats: DashboardStats;
}

/**
 * Hook otimizado que busca todos os dados do dashboard do estudante
 * em uma única query RPC, reduzindo de ~25 queries para 1
 */
export const useStudentDashboardData = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["student-dashboard-data", userId],
    queryFn: async (): Promise<StudentDashboardData> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase.rpc("get_student_dashboard_data", {
        p_user_id: userId,
      });

      if (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
      }

      // Parse the JSONB response
      const result = data as unknown as StudentDashboardData;
      
      return {
        profile: result.profile || null,
        enrollments: result.enrollments || [],
        gamification: result.gamification || {
          xp: 0,
          level: 1,
          streak_days: 0,
          total_lessons_completed: 0,
          last_activity_date: null,
        },
        continue_watching: result.continue_watching || [],
        stats: result.stats || {
          active_courses: 0,
          total_study_minutes: 0,
          certificates_count: 0,
          badges_count: 0,
        },
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos - dados mudam com frequência
    gcTime: 10 * 60 * 1000, // 10 minutos no garbage collection
    refetchOnWindowFocus: false,
  });
};
