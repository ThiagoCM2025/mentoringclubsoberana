
-- =====================================================
-- FASE 1: ESTRUTURA COMPLETA PARA PROGRAMAS ESTRUTURADOS
-- =====================================================

-- 1. Criar ENUM para tipos de programa
CREATE TYPE program_type AS ENUM ('workshop-ia', 'experience-start', 'aceleracao', 'mentoria-360', 'elite');

-- 2. Criar ENUM para tipos de módulo
CREATE TYPE module_type AS ENUM ('onboarding', 'dynamic', 'pillar', 'recordings', 'individual');

-- 3. Criar ENUM para tipos de aula
CREATE TYPE lesson_type AS ENUM ('video', 'action', 'scheduling', 'upload', 'text', 'diagnostic');

-- 4. Criar ENUM para tipos de ação
CREATE TYPE action_type AS ENUM ('calendar', 'whatsapp', 'form', 'external', 'diagnostic');

-- 5. Criar ENUM para status de missão
CREATE TYPE mission_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');

-- 6. Modificar tabela courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS program_type program_type,
ADD COLUMN IF NOT EXISTS requires_diagnostic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calendar_link TEXT,
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 12;

-- 7. Modificar tabela modules
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS module_type module_type DEFAULT 'pillar',
ADD COLUMN IF NOT EXISTS unlock_week INTEGER,
ADD COLUMN IF NOT EXISTS unlock_date DATE,
ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT false;

-- 8. Modificar tabela lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS lesson_type lesson_type DEFAULT 'video',
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS action_type action_type,
ADD COLUMN IF NOT EXISTS action_button_text TEXT;

-- 9. Criar tabela weekly_missions (Missões Semanais)
CREATE TABLE IF NOT EXISTS public.weekly_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  month_number INTEGER DEFAULT 1,
  month_title TEXT,
  title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  why_do TEXT,
  gamification_emoji TEXT DEFAULT '🎯',
  gamification_title TEXT,
  gamification_reward TEXT,
  xp_reward INTEGER DEFAULT 100,
  badge_unlock_id UUID REFERENCES public.badges(id),
  requires_proof BOOLEAN DEFAULT true,
  proof_type TEXT DEFAULT 'comment',
  related_lesson_id UUID REFERENCES public.lessons(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, week_number)
);

-- 10. Criar tabela user_mission_completions
CREATE TABLE IF NOT EXISTS public.user_mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.weekly_missions(id) ON DELETE CASCADE,
  proof_content TEXT,
  proof_file_url TEXT,
  proof_links TEXT[],
  status mission_status DEFAULT 'pending',
  xp_earned INTEGER DEFAULT 0,
  admin_feedback TEXT,
  reviewed_by UUID,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- 11. Criar tabela course_gamification (Gamificação por Produto)
CREATE TABLE IF NOT EXISTS public.course_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_title TEXT DEFAULT 'Advogada Invisível',
  missions_completed INTEGER DEFAULT 0,
  week_progress INTEGER DEFAULT 1,
  badges_earned UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 12. Criar tabela program_titles (Títulos progressivos por programa)
CREATE TABLE IF NOT EXISTS public.program_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '🎯',
  requirement_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, week_number)
);

-- 13. Habilitar RLS nas novas tabelas
ALTER TABLE public.weekly_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_titles ENABLE ROW LEVEL SECURITY;

-- 14. Políticas RLS para weekly_missions
CREATE POLICY "Anyone can view active missions" ON public.weekly_missions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage missions" ON public.weekly_missions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 15. Políticas RLS para user_mission_completions
CREATE POLICY "Users can view own completions" ON public.user_mission_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON public.user_mission_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending completions" ON public.user_mission_completions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all completions" ON public.user_mission_completions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 16. Políticas RLS para course_gamification
CREATE POLICY "Users can view own course gamification" ON public.course_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course gamification" ON public.course_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course gamification" ON public.course_gamification
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all course gamification" ON public.course_gamification
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- 17. Políticas RLS para program_titles
CREATE POLICY "Anyone can view program titles" ON public.program_titles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage program titles" ON public.program_titles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 18. Função para calcular semana atual do programa
CREATE OR REPLACE FUNCTION public.get_current_program_week(p_enrollment_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(1, LEAST(12, FLOOR((CURRENT_DATE - p_enrollment_date) / 7) + 1));
END;
$$;

-- 19. Função para verificar se módulo está desbloqueado
CREATE OR REPLACE FUNCTION public.is_module_unlocked(
  p_module_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unlock_week INTEGER;
  v_enrollment_date DATE;
  v_current_week INTEGER;
  v_course_id UUID;
  v_is_dynamic BOOLEAN;
BEGIN
  -- Buscar informações do módulo
  SELECT m.unlock_week, m.is_dynamic, m.course_id 
  INTO v_unlock_week, v_is_dynamic, v_course_id
  FROM public.modules m
  WHERE m.id = p_module_id;
  
  -- Módulos dinâmicos sempre estão liberados
  IF v_is_dynamic THEN
    RETURN true;
  END IF;
  
  -- Se não tem semana de desbloqueio, está liberado
  IF v_unlock_week IS NULL THEN
    RETURN true;
  END IF;
  
  -- Buscar data de matrícula
  SELECT e.enrolled_at::DATE INTO v_enrollment_date
  FROM public.enrollments e
  WHERE e.user_id = p_user_id AND e.course_id = v_course_id
  LIMIT 1;
  
  -- Se não está matriculado, não tem acesso
  IF v_enrollment_date IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calcular semana atual
  v_current_week := public.get_current_program_week(v_enrollment_date);
  
  RETURN v_current_week >= v_unlock_week;
END;
$$;

-- 20. Função para atualizar gamificação do curso quando missão é aprovada
CREATE OR REPLACE FUNCTION public.update_course_gamification_on_mission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission RECORD;
  v_course_id UUID;
  v_new_title TEXT;
  v_week INTEGER;
BEGIN
  -- Só processar quando status muda para 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Buscar informações da missão
    SELECT wm.*, wm.course_id INTO v_mission
    FROM public.weekly_missions wm
    WHERE wm.id = NEW.mission_id;
    
    v_course_id := v_mission.course_id;
    v_week := v_mission.week_number;
    
    -- Atualizar XP ganho
    NEW.xp_earned := v_mission.xp_reward;
    
    -- Buscar título para a semana
    SELECT title INTO v_new_title
    FROM public.program_titles
    WHERE course_id = v_course_id AND week_number = v_week;
    
    -- Upsert course_gamification
    INSERT INTO public.course_gamification (
      user_id, course_id, xp, missions_completed, week_progress, current_title
    ) VALUES (
      NEW.user_id, v_course_id, v_mission.xp_reward, 1, v_week, COALESCE(v_new_title, 'Advogada Invisível')
    )
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      xp = course_gamification.xp + v_mission.xp_reward,
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
$$;

-- 21. Criar trigger para aprovação de missão
DROP TRIGGER IF EXISTS on_mission_approval ON public.user_mission_completions;
CREATE TRIGGER on_mission_approval
  BEFORE UPDATE ON public.user_mission_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_gamification_on_mission_approval();

-- 22. Índices para performance
CREATE INDEX IF NOT EXISTS idx_weekly_missions_course ON public.weekly_missions(course_id);
CREATE INDEX IF NOT EXISTS idx_weekly_missions_week ON public.weekly_missions(week_number);
CREATE INDEX IF NOT EXISTS idx_user_mission_completions_user ON public.user_mission_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_completions_status ON public.user_mission_completions(status);
CREATE INDEX IF NOT EXISTS idx_course_gamification_user ON public.course_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_course_gamification_course ON public.course_gamification(course_id);
