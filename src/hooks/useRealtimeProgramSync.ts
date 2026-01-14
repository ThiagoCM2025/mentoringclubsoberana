import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook que sincroniza em tempo real as mudanças feitas pelo admin
 * nas tabelas de curso, módulos, aulas e missões
 */
export const useRealtimeProgramSync = (courseId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!courseId || !userId) return;

    const channel = supabase
      .channel(`program-sync-${courseId}`)
      // Mudanças em aulas
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
        },
        (payload) => {
          console.log('Lesson updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["program-detail-data", courseId, userId] });
        }
      )
      // Mudanças em módulos
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'modules',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          console.log('Module updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["program-detail-data", courseId, userId] });
        }
      )
      // Mudanças no curso
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `id=eq.${courseId}`,
        },
        (payload) => {
          console.log('Course updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["program-detail-data", courseId, userId] });
        }
      )
      // Mudanças em missões
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_missions',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          console.log('Mission updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["program-detail-data", courseId, userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, userId, queryClient]);
};
