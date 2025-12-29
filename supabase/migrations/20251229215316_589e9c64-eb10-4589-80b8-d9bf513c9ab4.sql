-- Criar tabela para rastrear conclusão de módulos
CREATE TABLE public.module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_earned INTEGER NOT NULL DEFAULT 50,
  UNIQUE(user_id, module_id)
);

-- Habilitar RLS
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own module completions"
ON public.module_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own module completions"
ON public.module_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage module completions"
ON public.module_completions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Inserir badges específicos para módulos
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primeiro Módulo', 'Completou seu primeiro módulo de estudo', 'BookCheck', 'modules', 'modules_completed', 1, 100),
('Exploradora', 'Completou 3 módulos de estudo', 'Compass', 'modules', 'modules_completed', 3, 200),
('Dedicada aos Estudos', 'Completou 5 módulos de estudo', 'GraduationCap', 'modules', 'modules_completed', 5, 350),
('Mestre dos Módulos', 'Completou 10 módulos de estudo', 'Award', 'modules', 'modules_completed', 10, 500),
('Conquistadora', 'Completou todos os módulos de um programa', 'Trophy', 'modules', 'program_completed', 1, 750),
('Soberana Completa', 'Completou todos os módulos de 2 programas', 'Crown', 'modules', 'programs_completed', 2, 1000);

-- Função para verificar e registrar conclusão de módulo
CREATE OR REPLACE FUNCTION public.check_module_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module_id UUID;
  v_course_id UUID;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_module_title TEXT;
  v_already_completed BOOLEAN;
  v_modules_completed INTEGER;
  v_badge RECORD;
BEGIN
  -- Só processar quando uma aula é marcada como completada
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Buscar módulo e curso da aula
    SELECT l.module_id, m.course_id, m.title
    INTO v_module_id, v_course_id, v_module_title
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE l.id = NEW.lesson_id;
    
    -- Contar total de aulas no módulo
    SELECT COUNT(*) INTO v_total_lessons
    FROM lessons WHERE module_id = v_module_id;
    
    -- Contar aulas completadas pelo usuário neste módulo
    SELECT COUNT(*) INTO v_completed_lessons
    FROM progress p
    JOIN lessons l ON l.id = p.lesson_id
    WHERE l.module_id = v_module_id
    AND p.user_id = NEW.user_id
    AND p.completed = true;
    
    -- Se todas as aulas do módulo foram completadas
    IF v_completed_lessons >= v_total_lessons THEN
      -- Verificar se já foi registrado
      SELECT EXISTS(
        SELECT 1 FROM module_completions 
        WHERE user_id = NEW.user_id AND module_id = v_module_id
      ) INTO v_already_completed;
      
      IF NOT v_already_completed THEN
        -- Registrar conclusão do módulo
        INSERT INTO module_completions (user_id, module_id, course_id, xp_earned)
        VALUES (NEW.user_id, v_module_id, v_course_id, 50);
        
        -- Adicionar XP ao user_gamification
        UPDATE user_gamification
        SET xp = xp + 50,
            level = FLOOR((xp + 50) / 500) + 1,
            updated_at = now()
        WHERE user_id = NEW.user_id;
        
        -- Criar notificação de parabéns
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          NEW.user_id,
          '🎉 Módulo Concluído!',
          format('Parabéns! Você completou o módulo "%s" e ganhou 50 XP!', v_module_title),
          'success'
        );
        
        -- Verificar badges de módulos
        SELECT COUNT(*) INTO v_modules_completed
        FROM module_completions WHERE user_id = NEW.user_id;
        
        FOR v_badge IN 
          SELECT * FROM badges 
          WHERE requirement_type = 'modules_completed'
          AND requirement_value <= v_modules_completed
          AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = NEW.user_id)
        LOOP
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.user_id, v_badge.id)
          ON CONFLICT DO NOTHING;
          
          UPDATE user_gamification
          SET xp = xp + v_badge.xp_reward,
              level = FLOOR((xp + v_badge.xp_reward) / 500) + 1
          WHERE user_id = NEW.user_id;
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para verificar conclusão de módulo
DROP TRIGGER IF EXISTS check_module_completion_trigger ON public.progress;
CREATE TRIGGER check_module_completion_trigger
AFTER INSERT OR UPDATE ON public.progress
FOR EACH ROW
EXECUTE FUNCTION public.check_module_completion();

-- Função para notificar sobre novo conteúdo liberado
CREATE OR REPLACE FUNCTION public.notify_weekly_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment RECORD;
  v_current_week INTEGER;
  v_new_modules RECORD;
BEGIN
  -- Para cada matrícula ativa
  FOR v_enrollment IN 
    SELECT e.user_id, e.course_id, e.enrolled_at::DATE as enrolled_date, c.title as course_title
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE c.is_published = true
  LOOP
    -- Calcular semana atual
    v_current_week := get_current_program_week(v_enrollment.enrolled_date);
    
    -- Buscar módulos liberados nesta semana
    FOR v_new_modules IN
      SELECT m.id, m.title
      FROM modules m
      WHERE m.course_id = v_enrollment.course_id
      AND m.unlock_week = v_current_week
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = v_enrollment.user_id
        AND n.title LIKE '%Novo Conteúdo%'
        AND n.message LIKE '%' || m.title || '%'
        AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
      )
    LOOP
      -- Criar notificação
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        v_enrollment.user_id,
        '📚 Novo Conteúdo Liberado!',
        format('O módulo "%s" do programa %s está disponível para você!', v_new_modules.title, v_enrollment.course_title),
        'info'
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Função para notificar sobre missões semanais disponíveis
CREATE OR REPLACE FUNCTION public.notify_weekly_missions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment RECORD;
  v_current_week INTEGER;
  v_mission RECORD;
BEGIN
  -- Para cada matrícula ativa
  FOR v_enrollment IN 
    SELECT e.user_id, e.course_id, e.enrolled_at::DATE as enrolled_date, c.title as course_title
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE c.is_published = true
  LOOP
    -- Calcular semana atual
    v_current_week := get_current_program_week(v_enrollment.enrolled_date);
    
    -- Buscar missão da semana atual
    SELECT wm.* INTO v_mission
    FROM weekly_missions wm
    WHERE wm.course_id = v_enrollment.course_id
    AND wm.week_number = v_current_week
    AND wm.is_active = true;
    
    IF v_mission.id IS NOT NULL THEN
      -- Verificar se já completou ou já foi notificada hoje
      IF NOT EXISTS (
        SELECT 1 FROM user_mission_completions umc
        WHERE umc.user_id = v_enrollment.user_id
        AND umc.mission_id = v_mission.id
        AND umc.status IN ('approved', 'pending')
      )
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = v_enrollment.user_id
        AND n.title LIKE '%Missão da Semana%'
        AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
      ) THEN
        -- Criar notificação
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
          v_enrollment.user_id,
          '🎯 Missão da Semana ' || v_current_week || '!',
          format('Sua missão "%s" está disponível. Complete e ganhe %s XP!', v_mission.title, v_mission.xp_reward),
          'info'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Habilitar realtime para module_completions
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_completions;