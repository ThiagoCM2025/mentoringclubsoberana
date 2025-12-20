-- =====================================================
-- FASE 1: Popular tabelas existentes + FASE 2 & 3: Novas tabelas
-- =====================================================

-- 1. Popular daily_challenges com desafios variados
INSERT INTO public.daily_challenges (id, title, description, challenge_type, requirement_type, requirement_value, xp_reward, is_active, starts_at, ends_at) VALUES
  (gen_random_uuid(), 'Primeira Aula do Dia', 'Complete pelo menos 1 aula hoje para ganhar XP extra!', 'daily', 'lessons_completed', 1, 50, true, CURRENT_DATE, CURRENT_DATE),
  (gen_random_uuid(), 'Maratona de Estudo', 'Complete 3 aulas em um único dia', 'daily', 'lessons_completed', 3, 150, true, CURRENT_DATE, CURRENT_DATE),
  (gen_random_uuid(), 'Streak de 7 Dias', 'Mantenha um streak de 7 dias consecutivos', 'weekly', 'streak_days', 7, 300, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
  (gen_random_uuid(), 'Participação na Comunidade', 'Faça uma postagem na comunidade', 'daily', 'community_posts', 1, 75, true, CURRENT_DATE, CURRENT_DATE),
  (gen_random_uuid(), 'Engajamento Social', 'Comente em 3 posts da comunidade', 'daily', 'comments_made', 3, 100, true, CURRENT_DATE, CURRENT_DATE),
  (gen_random_uuid(), 'Estudante Dedicada', 'Estude por 30 minutos hoje', 'daily', 'study_minutes', 30, 100, true, CURRENT_DATE, CURRENT_DATE),
  (gen_random_uuid(), 'Mestre do Conhecimento', 'Complete 5 aulas nesta semana', 'weekly', 'lessons_completed', 5, 250, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
  (gen_random_uuid(), 'Quiz Champion', 'Acerte 3 quizzes com nota máxima', 'weekly', 'quizzes_passed', 3, 200, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- 2. Popular badges com conquistas variadas
INSERT INTO public.badges (id, name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
  -- Badges de Progresso
  (gen_random_uuid(), 'Primeira Aula', 'Completou sua primeira aula na plataforma', 'play-circle', 'progress', 'lessons_completed', 1, 50),
  (gen_random_uuid(), 'Estudante Dedicada', 'Completou 10 aulas', 'book-open', 'progress', 'lessons_completed', 10, 150),
  (gen_random_uuid(), 'Especialista em Estudos', 'Completou 25 aulas', 'graduation-cap', 'progress', 'lessons_completed', 25, 300),
  (gen_random_uuid(), 'Mestre do Conhecimento', 'Completou 50 aulas', 'award', 'progress', 'lessons_completed', 50, 500),
  (gen_random_uuid(), 'Doutora Soberana', 'Completou 100 aulas', 'crown', 'progress', 'lessons_completed', 100, 1000),
  
  -- Badges de Streak
  (gen_random_uuid(), 'Primeiro Dia', 'Iniciou sua jornada de estudos', 'flame', 'streak', 'streak_days', 1, 25),
  (gen_random_uuid(), 'Semana Consistente', 'Manteve streak de 7 dias', 'zap', 'streak', 'streak_days', 7, 100),
  (gen_random_uuid(), 'Mês de Fogo', 'Manteve streak de 30 dias', 'fire', 'streak', 'streak_days', 30, 500),
  (gen_random_uuid(), 'Disciplina de Ouro', 'Manteve streak de 60 dias', 'trophy', 'streak', 'streak_days', 60, 1000),
  
  -- Badges de Comunidade
  (gen_random_uuid(), 'Primeiro Post', 'Fez sua primeira postagem na comunidade', 'message-square', 'community', 'community_posts', 1, 50),
  (gen_random_uuid(), 'Voz Ativa', 'Fez 10 postagens na comunidade', 'users', 'community', 'community_posts', 10, 200),
  (gen_random_uuid(), 'Influenciadora', 'Fez 25 postagens na comunidade', 'star', 'community', 'community_posts', 25, 400),
  (gen_random_uuid(), 'Comentarista', 'Fez 10 comentários em posts', 'message-circle', 'community', 'comments_made', 10, 150),
  
  -- Badges de XP/Level
  (gen_random_uuid(), 'Nível 5', 'Alcançou o nível 5', 'trending-up', 'level', 'level_reached', 5, 100),
  (gen_random_uuid(), 'Nível 10', 'Alcançou o nível 10', 'target', 'level', 'level_reached', 10, 250),
  (gen_random_uuid(), 'Nível 25', 'Alcançou o nível 25', 'rocket', 'level', 'level_reached', 25, 500),
  (gen_random_uuid(), 'Nível 50', 'Alcançou o nível 50', 'medal', 'level', 'level_reached', 50, 1000),
  
  -- Badges Especiais
  (gen_random_uuid(), 'Early Adopter', 'Um dos primeiros membros da plataforma', 'gift', 'special', 'special', 1, 100),
  (gen_random_uuid(), 'Completou Curso', 'Finalizou um curso completo', 'check-circle', 'course', 'courses_completed', 1, 250),
  (gen_random_uuid(), 'Certificada', 'Obteve seu primeiro certificado', 'award', 'certificate', 'certificates_earned', 1, 300),
  (gen_random_uuid(), 'Quiz Master', 'Acertou 10 quizzes com nota máxima', 'brain', 'quiz', 'quizzes_passed', 10, 400)
ON CONFLICT DO NOTHING;

-- 3. Criar tabela de quizzes por aula
CREATE TABLE IF NOT EXISTS public.lesson_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela de perguntas do quiz
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Criar tabela de tentativas de quiz
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, quiz_id, completed_at)
);

-- 6. Criar tabela de recompensas por nível
CREATE TABLE IF NOT EXISTS public.level_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  reward_type TEXT NOT NULL,
  reward_value TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  icon TEXT DEFAULT 'gift',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Criar tabela de recompensas ganhas pelos usuários
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.level_rewards(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, reward_id)
);

-- 8. Popular recompensas por nível
INSERT INTO public.level_rewards (level, reward_type, reward_value, reward_description, icon) VALUES
  (2, 'badge', 'early_starter', 'Badge exclusiva de início', 'award'),
  (5, 'discount', '10', '10% de desconto em qualquer curso', 'percent'),
  (10, 'ebook', 'guia_marketing', 'E-book Guia Completo de Marketing Jurídico', 'book'),
  (15, 'discount', '15', '15% de desconto em qualquer curso', 'percent'),
  (20, 'mentoring', '30min', '30 minutos de mentoria individual', 'video'),
  (25, 'badge', 'gold_member', 'Badge Gold Member exclusiva', 'medal'),
  (30, 'discount', '20', '20% de desconto em qualquer curso', 'percent'),
  (40, 'mentoring', '60min', '1 hora de mentoria individual', 'video'),
  (50, 'vip', 'access', 'Acesso VIP a conteúdos exclusivos', 'crown')
ON CONFLICT DO NOTHING;

-- 9. Habilitar RLS nas novas tabelas
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para quizzes
CREATE POLICY "Admins can manage quizzes"
  ON public.lesson_quizzes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled users can view quizzes"
  ON public.lesson_quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN enrollments e ON e.course_id = m.course_id
      WHERE l.id = lesson_quizzes.lesson_id AND e.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 11. Políticas RLS para perguntas
CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lesson_quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN enrollments e ON e.course_id = m.course_id
      WHERE q.id = quiz_questions.quiz_id AND e.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 12. Políticas RLS para tentativas
CREATE POLICY "Users can manage own quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 13. Políticas RLS para recompensas
CREATE POLICY "Anyone can view level rewards"
  ON public.level_rewards FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage level rewards"
  ON public.level_rewards FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own rewards"
  ON public.user_rewards FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user rewards"
  ON public.user_rewards FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 14. Função para verificar e conceder badges automaticamente
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_count INTEGER;
BEGIN
  -- Check lessons_completed badges
  FOR v_badge IN 
    SELECT * FROM badges 
    WHERE requirement_type = 'lessons_completed' 
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = NEW.user_id)
  LOOP
    SELECT total_lessons_completed INTO v_count 
    FROM user_gamification WHERE user_id = NEW.user_id;
    
    IF v_count >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      
      -- Add XP reward
      UPDATE user_gamification 
      SET xp = xp + v_badge.xp_reward 
      WHERE user_id = NEW.user_id;
    END IF;
  END LOOP;

  -- Check streak badges
  FOR v_badge IN 
    SELECT * FROM badges 
    WHERE requirement_type = 'streak_days' 
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = NEW.user_id)
  LOOP
    SELECT streak_days INTO v_count 
    FROM user_gamification WHERE user_id = NEW.user_id;
    
    IF v_count >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      
      -- Add XP reward
      UPDATE user_gamification 
      SET xp = xp + v_badge.xp_reward 
      WHERE user_id = NEW.user_id;
    END IF;
  END LOOP;

  -- Check level badges
  FOR v_badge IN 
    SELECT * FROM badges 
    WHERE requirement_type = 'level_reached' 
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = NEW.user_id)
  LOOP
    SELECT level INTO v_count 
    FROM user_gamification WHERE user_id = NEW.user_id;
    
    IF v_count >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      
      -- Add XP reward
      UPDATE user_gamification 
      SET xp = xp + v_badge.xp_reward 
      WHERE user_id = NEW.user_id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 15. Trigger para verificar badges após atualização de gamificação
DROP TRIGGER IF EXISTS check_badges_on_gamification_update ON public.user_gamification;
CREATE TRIGGER check_badges_on_gamification_update
  AFTER UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_badges();

-- 16. Função para verificar e desbloquear recompensas por nível
CREATE OR REPLACE FUNCTION public.check_level_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward RECORD;
BEGIN
  -- Se o nível aumentou
  IF NEW.level > COALESCE(OLD.level, 0) THEN
    -- Verificar recompensas disponíveis para o novo nível
    FOR v_reward IN 
      SELECT * FROM level_rewards 
      WHERE level <= NEW.level 
      AND id NOT IN (SELECT reward_id FROM user_rewards WHERE user_id = NEW.user_id)
    LOOP
      INSERT INTO user_rewards (user_id, reward_id, is_claimed)
      VALUES (NEW.user_id, v_reward.id, false)
      ON CONFLICT DO NOTHING;
      
      -- Criar notificação
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        NEW.user_id,
        'Nova Recompensa Desbloqueada! 🎁',
        format('Você desbloqueou: %s', v_reward.reward_description),
        'reward'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- 17. Trigger para verificar recompensas
DROP TRIGGER IF EXISTS check_rewards_on_level_up ON public.user_gamification;
CREATE TRIGGER check_rewards_on_level_up
  AFTER UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.check_level_rewards();

-- 18. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quizzes_lesson ON public.lesson_quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON public.user_rewards(user_id);