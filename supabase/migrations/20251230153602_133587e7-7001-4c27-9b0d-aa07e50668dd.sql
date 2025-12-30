-- Corrigir o trigger para também atualizar o nível quando uma missão é aprovada
-- Nível = Semana do Título + 1 (Semana 0 = Nível 1, Semana 1 = Nível 2, etc.)

CREATE OR REPLACE FUNCTION public.update_course_gamification_on_mission_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_mission RECORD;
  v_course_id UUID;
  v_new_title TEXT;
  v_week INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Só processar quando status muda para 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Buscar informações da missão
    SELECT wm.*, wm.course_id INTO v_mission
    FROM public.weekly_missions wm
    WHERE wm.id = NEW.mission_id;
    
    v_course_id := v_mission.course_id;
    v_week := v_mission.week_number;
    
    -- Calcular novo nível: Semana + 1 (Semana 0 = Nível 1, Semana 1 = Nível 2, etc.)
    v_new_level := v_week + 1;
    
    -- Atualizar XP ganho
    NEW.xp_earned := v_mission.xp_reward;
    
    -- Buscar título para a semana
    SELECT title INTO v_new_title
    FROM public.program_titles
    WHERE course_id = v_course_id AND week_number = v_week;
    
    -- Upsert course_gamification com nível atualizado
    INSERT INTO public.course_gamification (
      user_id, course_id, xp, level, missions_completed, week_progress, current_title
    ) VALUES (
      NEW.user_id, v_course_id, v_mission.xp_reward, v_new_level, 1, v_week, COALESCE(v_new_title, 'Advogada Invisível')
    )
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      xp = course_gamification.xp + v_mission.xp_reward,
      level = GREATEST(course_gamification.level, v_new_level),
      missions_completed = course_gamification.missions_completed + 1,
      week_progress = GREATEST(course_gamification.week_progress, v_week),
      current_title = COALESCE(v_new_title, course_gamification.current_title),
      updated_at = now();
    
    -- Também adicionar XP global
    UPDATE public.user_gamification
    SET xp = xp + v_mission.xp_reward,
        level = FLOOR((xp + v_mission.xp_reward) / 500) + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Criar notificação
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      '🎉 Missão Aprovada!',
      format('Parabéns! Sua missão da Semana %s foi aprovada. Você ganhou %s XP!', v_week, v_mission.xp_reward),
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Corrigir níveis existentes baseado no título atual
-- Nível = week_number do título + 1
UPDATE public.course_gamification cg
SET level = (
  SELECT COALESCE(pt.week_number + 1, 1)
  FROM public.program_titles pt
  WHERE pt.course_id = cg.course_id 
  AND pt.title = cg.current_title
),
updated_at = now()
WHERE current_title != 'Advogada Invisível'
AND current_title IS NOT NULL;