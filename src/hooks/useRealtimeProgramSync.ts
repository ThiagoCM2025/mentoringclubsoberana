import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook que sincroniza em tempo real as mudanças feitas pelo admin
 * nas tabelas de curso, módulos, aulas e missões.
 * Mostra um toast quando o conteúdo é atualizado.
 */
export const useRealtimeProgramSync = (courseId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const lastToastRef = useRef<number>(0);

  useEffect(() => {
    if (!courseId || !userId) return;

    const showUpdateToast = () => {
      const now = Date.now();
      // Debounce: show toast at most once every 5 seconds
      if (now - lastToastRef.current > 5000) {
        lastToastRef.current = now;
        toast({
          title: "Conteúdo Atualizado ✨",
          description: "Novos conteúdos foram adicionados ao programa.",
          duration: 4000,
        });
      }
    };

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
          queryClient.invalidateQueries({ queryKey: ["course-data", courseId] });
          showUpdateToast();
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
          queryClient.invalidateQueries({ queryKey: ["course-data", courseId] });
          showUpdateToast();
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
          queryClient.invalidateQueries({ queryKey: ["course-data", courseId] });
          showUpdateToast();
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
          showUpdateToast();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, userId, queryClient, toast]);
};
