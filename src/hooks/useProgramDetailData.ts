import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProgramCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  program_type: string | null;
  duration_weeks: number;
  calendar_link: string | null;
}

interface ProgramEnrollment {
  enrolled_at: string;
  current_week: number;
}

interface ProgramLesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  order_index: number;
  video_url: string | null;
  completed: boolean;
  watch_percentage: number;
}

interface ProgramModule {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  unlock_week: number | null;
  is_dynamic: boolean;
  is_unlocked: boolean;
  lessons: ProgramLesson[];
  completed_lessons: number;
  total_lessons: number;
}

interface ProgramMission {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  xp_reward: number;
  is_active: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submitted_at: string | null;
  is_current_week: boolean;
  is_future: boolean;
}

interface ProgramGamification {
  xp: number;
  level: number;
  current_title: string;
  missions_completed: number;
  week_progress: number;
}

interface ProgramTitle {
  week_number: number;
  title: string;
  emoji: string;
}

interface ProgramDiagnostic {
  id: string;
  is_completed: boolean;
  completed_at: string | null;
}

interface ProgramCertificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  student_name?: string;
  course_title?: string;
  completion_date?: string;
}

export interface ProgramDetailData {
  course: ProgramCourse | null;
  enrollment: ProgramEnrollment | null;
  modules: ProgramModule[];
  missions: ProgramMission[];
  gamification: ProgramGamification;
  titles: ProgramTitle[];
  diagnostic: ProgramDiagnostic | null;
  certificate: ProgramCertificate | null;
  current_week: number;
  error?: string;
}

/**
 * Hook otimizado que busca todos os dados de um programa
 * em uma única query RPC, reduzindo de ~10 queries para 1
 */
export const useProgramDetailData = (courseId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ["program-detail-data", courseId, userId],
    queryFn: async (): Promise<ProgramDetailData> => {
      if (!courseId || !userId) {
        throw new Error("Course ID and User ID are required");
      }

      const { data, error } = await supabase.rpc("get_program_detail_data", {
        p_course_id: courseId,
        p_user_id: userId,
      });

      if (error) {
        console.error("Error fetching program detail data:", error);
        throw error;
      }

      // Parse the JSONB response
      const result = data as unknown as ProgramDetailData;
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return {
        course: result.course || null,
        enrollment: result.enrollment || null,
        modules: result.modules || [],
        missions: result.missions || [],
        gamification: result.gamification || {
          xp: 0,
          level: 1,
          current_title: "Advogada Invisível",
          missions_completed: 0,
          week_progress: 0,
        },
        titles: result.titles || [],
        diagnostic: result.diagnostic || null,
        certificate: result.certificate || null,
        current_week: result.current_week || 1,
      };
    },
    enabled: !!courseId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos no garbage collection
    refetchOnWindowFocus: false,
  });
};
