-- 1. Criar tabela de histórico de submissões
CREATE TABLE public.mission_submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.weekly_missions(id) ON DELETE CASCADE,
  proof_content TEXT,
  proof_links TEXT[],
  proof_file_url TEXT,
  status TEXT NOT NULL,
  admin_feedback TEXT,
  reviewed_by UUID,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_submission_history_user ON mission_submission_history(user_id);
CREATE INDEX idx_submission_history_mission ON mission_submission_history(mission_id);
CREATE INDEX idx_submission_history_user_mission ON mission_submission_history(user_id, mission_id);

-- RLS
ALTER TABLE mission_submission_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunas veem seu proprio historico"
ON mission_submission_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins veem todo historico"
ON mission_submission_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Sistema pode inserir historico"
ON mission_submission_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Trigger para registrar histórico quando status muda
CREATE OR REPLACE FUNCTION public.record_mission_submission_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar quando status muda para submitted, approved ou rejected
  IF NEW.status IN ('submitted', 'approved', 'rejected') AND 
     (OLD.status IS NULL OR OLD.status != NEW.status OR 
      (NEW.status = 'submitted' AND OLD.status = 'rejected')) THEN
    
    INSERT INTO public.mission_submission_history (
      user_id, mission_id, proof_content, proof_links, proof_file_url,
      status, admin_feedback, reviewed_by, submitted_at, reviewed_at
    ) VALUES (
      NEW.user_id, NEW.mission_id, NEW.proof_content, NEW.proof_links, NEW.proof_file_url,
      NEW.status, NEW.admin_feedback, NEW.reviewed_by, NEW.submitted_at, NEW.reviewed_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_record_mission_history
AFTER INSERT OR UPDATE ON public.user_mission_completions
FOR EACH ROW EXECUTE FUNCTION record_mission_submission_history();

-- 3. Atualizar função de gamificação para notificar rejeições e incluir feedback
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
  -- Processar quando status muda para 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Buscar informações da missão
    SELECT wm.*, wm.course_id INTO v_mission
    FROM public.weekly_missions wm
    WHERE wm.id = NEW.mission_id;
    
    v_course_id := v_mission.course_id;
    v_week := v_mission.week_number;
    
    -- Calcular novo nível
    v_new_level := v_week + 1;
    
    -- Atualizar XP ganho
    NEW.xp_earned := v_mission.xp_reward;
    
    -- Buscar título para a semana
    SELECT title INTO v_new_title
    FROM public.program_titles
    WHERE course_id = v_course_id AND week_number = v_week;
    
    -- Upsert course_gamification
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
    
    -- Adicionar XP global
    UPDATE public.user_gamification
    SET xp = xp + v_mission.xp_reward,
        level = FLOOR((xp + v_mission.xp_reward) / 500) + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Notificação de aprovação COM feedback
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      '🎉 Missão Aprovada!',
      format('Parabéns! Sua missão da Semana %s foi aprovada. Você ganhou %s XP!%s', 
        v_week, 
        v_mission.xp_reward,
        CASE WHEN NEW.admin_feedback IS NOT NULL AND NEW.admin_feedback != '' THEN 
          format(' 💬 "%s"', LEFT(NEW.admin_feedback, 150)) 
        ELSE '' END
      ),
      'success'
    );
  END IF;
  
  -- Processar quando status muda para 'rejected'
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    -- Buscar semana da missão
    SELECT week_number INTO v_week
    FROM public.weekly_missions 
    WHERE id = NEW.mission_id;
    
    -- Notificação de rejeição COM feedback
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      '📝 Missão precisa de ajustes',
      format('Sua missão da Semana %s precisa de correções.%s Veja o feedback e reenvie!', 
        v_week,
        CASE WHEN NEW.admin_feedback IS NOT NULL AND NEW.admin_feedback != '' THEN 
          format(' 💬 "%s"', LEFT(NEW.admin_feedback, 150)) 
        ELSE '' END
      ),
      'warning'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;