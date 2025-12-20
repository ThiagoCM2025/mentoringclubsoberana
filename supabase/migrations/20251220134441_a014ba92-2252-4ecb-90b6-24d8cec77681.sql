
-- ============================================
-- FASE 2: Learning Paths, Daily Challenges, Mentoring
-- ============================================

-- Learning Paths (Trilhas de Aprendizado)
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_hours INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction table for learning path courses
CREATE TABLE public.learning_path_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(learning_path_id, course_id)
);

-- User learning path progress
CREATE TABLE public.user_learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, learning_path_id)
);

-- Daily Challenges
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  badge_reward_id UUID REFERENCES public.badges(id),
  is_active BOOLEAN DEFAULT true,
  starts_at DATE,
  ends_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User challenge completions (using completion_date column instead of cast)
CREATE TABLE public.user_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, challenge_id, completion_date)
);

-- Mentoring Sessions
CREATE TABLE public.mentoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  mentor_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT DEFAULT 'one_on_one',
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  notes TEXT,
  student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
  student_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Chat History for student assistant
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  context_type TEXT,
  context_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin Insights/Alerts
CREATE TABLE public.admin_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies

CREATE POLICY "Anyone can view published learning paths" ON public.learning_paths
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage learning paths" ON public.learning_paths
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view learning path courses" ON public.learning_path_courses
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.learning_paths WHERE id = learning_path_id AND is_published = true));
CREATE POLICY "Admins can manage learning path courses" ON public.learning_path_courses
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own learning path progress" ON public.user_learning_paths
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning path progress" ON public.user_learning_paths
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all learning path progress" ON public.user_learning_paths
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active challenges" ON public.daily_challenges
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage challenges" ON public.daily_challenges
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own completions" ON public.user_challenge_completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.user_challenge_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all completions" ON public.user_challenge_completions
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own mentoring sessions" ON public.mentoring_sessions
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = mentor_id);
CREATE POLICY "Users can update own session feedback" ON public.mentoring_sessions
  FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage all mentoring sessions" ON public.mentoring_sessions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage own chat history" ON public.ai_chat_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage insights" ON public.admin_insights
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_learning_path_courses_path ON public.learning_path_courses(learning_path_id);
CREATE INDEX idx_user_learning_paths_user ON public.user_learning_paths(user_id);
CREATE INDEX idx_daily_challenges_active ON public.daily_challenges(is_active, challenge_type);
CREATE INDEX idx_user_challenge_completions_user ON public.user_challenge_completions(user_id);
CREATE INDEX idx_mentoring_sessions_student ON public.mentoring_sessions(student_id);
CREATE INDEX idx_mentoring_sessions_scheduled ON public.mentoring_sessions(scheduled_at);
CREATE INDEX idx_ai_chat_history_user_session ON public.ai_chat_history(user_id, session_id);
CREATE INDEX idx_admin_insights_unread ON public.admin_insights(is_read, is_dismissed);

-- Triggers
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentoring_sessions_updated_at
  BEFORE UPDATE ON public.mentoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default daily challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, requirement_type, requirement_value, xp_reward) VALUES
  ('Aula do Dia', 'Complete 1 aula hoje', 'daily', 'complete_lessons', 1, 50),
  ('Estudante Dedicada', 'Estude por 30 minutos hoje', 'daily', 'study_minutes', 30, 75),
  ('Maratonista', 'Complete 5 aulas esta semana', 'weekly', 'complete_lessons', 5, 200),
  ('Hora do Foco', 'Estude por 2 horas esta semana', 'weekly', 'study_minutes', 120, 150),
  ('Voz Ativa', 'Faça uma publicação na comunidade', 'daily', 'community_post', 1, 100),
  ('Constância', 'Mantenha uma sequência de 7 dias', 'weekly', 'streak', 7, 300);
