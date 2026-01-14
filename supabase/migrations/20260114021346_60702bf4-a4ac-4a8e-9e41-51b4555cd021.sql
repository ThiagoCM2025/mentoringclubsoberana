-- Remove a constraint única que limita uma missão por semana/curso
-- Isso permite que várias aulas tenham missões na mesma semana
ALTER TABLE public.weekly_missions 
DROP CONSTRAINT IF EXISTS weekly_missions_course_id_week_number_key;