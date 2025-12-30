-- Habilitar realtime para diagnóstico e missões
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_diagnostics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_mission_completions;

-- Configurar REPLICA IDENTITY para mudanças completas
ALTER TABLE student_diagnostics REPLICA IDENTITY FULL;
ALTER TABLE user_mission_completions REPLICA IDENTITY FULL;