-- Corrigir títulos para usuários com missões aprovadas
-- Atualiza current_title baseado na última missão aprovada

UPDATE public.course_gamification cg
SET current_title = (
  SELECT COALESCE(
    (SELECT pt.title 
     FROM public.program_titles pt
     WHERE pt.course_id = cg.course_id
     AND pt.week_number = (
       SELECT MAX(wm.week_number)
       FROM public.user_mission_completions umc
       JOIN public.weekly_missions wm ON umc.mission_id = wm.id
       WHERE umc.user_id = cg.user_id
       AND wm.course_id = cg.course_id
       AND umc.status = 'approved'
     )
    ),
    'Advogada Invisível'
  )
),
updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM public.user_mission_completions umc
  JOIN public.weekly_missions wm ON umc.mission_id = wm.id
  WHERE umc.user_id = cg.user_id
  AND wm.course_id = cg.course_id
  AND umc.status = 'approved'
);