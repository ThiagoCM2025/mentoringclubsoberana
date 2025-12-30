-- Trigger function para notificar nova entrega de missão
CREATE OR REPLACE FUNCTION public.notify_new_mission_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_name TEXT;
  v_mission_title TEXT;
  v_week_number INTEGER;
BEGIN
  -- Apenas notificar quando status for 'submitted'
  IF NEW.status = 'submitted' THEN
    SELECT full_name INTO v_student_name FROM public.profiles WHERE user_id = NEW.user_id;
    SELECT title, week_number INTO v_mission_title, v_week_number FROM public.weekly_missions WHERE id = NEW.mission_id;
    
    PERFORM create_admin_notification(
      'mission_submission',
      'Nova Entrega de Missão',
      format('%s enviou a missão da Semana %s: %s', 
        COALESCE(v_student_name, 'Aluna'), 
        COALESCE(v_week_number::text, '?'),
        COALESCE(LEFT(v_mission_title, 40), 'Missão')),
      jsonb_build_object(
        'completion_id', NEW.id, 
        'user_id', NEW.user_id, 
        'mission_id', NEW.mission_id,
        'week_number', v_week_number
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para novas entregas de missão
CREATE TRIGGER on_new_mission_submission
AFTER INSERT ON public.user_mission_completions
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_mission_submission();