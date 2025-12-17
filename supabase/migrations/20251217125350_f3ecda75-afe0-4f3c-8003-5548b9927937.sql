-- Gamification System for Soberana

-- User Gamification Stats table
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_lessons_completed INTEGER NOT NULL DEFAULT 0,
  total_study_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- Policies for user_gamification
CREATE POLICY "Users can view own gamification stats" 
ON public.user_gamification 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification stats" 
ON public.user_gamification 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification stats" 
ON public.user_gamification 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all gamification stats" 
ON public.user_gamification 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Badges definition table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for badges (public read)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" 
ON public.badges 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage badges" 
ON public.badges 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User badges (earned badges)
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user badges" 
ON public.user_badges 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primeira Aula', 'Complete sua primeira aula', 'play-circle', 'lessons', 'lessons_completed', 1, 50),
('Estudante Dedicada', 'Complete 10 aulas', 'book-open', 'lessons', 'lessons_completed', 10, 100),
('Maratonista', 'Complete 25 aulas', 'flame', 'lessons', 'lessons_completed', 25, 200),
('Expert', 'Complete 50 aulas', 'trophy', 'lessons', 'lessons_completed', 50, 500),
('Mestre', 'Complete 100 aulas', 'crown', 'lessons', 'lessons_completed', 100, 1000),
('Primeiro Curso', 'Complete um curso inteiro', 'award', 'courses', 'courses_completed', 1, 300),
('Colecionadora', 'Complete 3 cursos', 'star', 'courses', 'courses_completed', 3, 750),
('Streak 7 dias', 'Estude por 7 dias consecutivos', 'zap', 'streak', 'streak_days', 7, 150),
('Streak 30 dias', 'Estude por 30 dias consecutivos', 'flame', 'streak', 'streak_days', 30, 500),
('Streak 100 dias', 'Estude por 100 dias consecutivos', 'sparkles', 'streak', 'streak_days', 100, 2000);

-- Function to update gamification stats and check badges
CREATE OR REPLACE FUNCTION public.update_gamification_on_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_streak_days INTEGER;
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_xp_to_add INTEGER := 25;
  v_total_completed INTEGER;
BEGIN
  -- Only process when lesson is marked as completed
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    
    -- Get or create gamification record
    INSERT INTO public.user_gamification (user_id, xp, last_activity_date, total_lessons_completed)
    VALUES (NEW.user_id, v_xp_to_add, v_today, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      xp = user_gamification.xp + v_xp_to_add,
      total_lessons_completed = user_gamification.total_lessons_completed + 1,
      streak_days = CASE 
        WHEN user_gamification.last_activity_date = v_today - 1 THEN user_gamification.streak_days + 1
        WHEN user_gamification.last_activity_date = v_today THEN user_gamification.streak_days
        ELSE 1
      END,
      last_activity_date = v_today,
      updated_at = now();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER on_progress_completed
  AFTER INSERT OR UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gamification_on_progress();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  xp INTEGER,
  level INTEGER,
  streak_days INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ug.user_id,
    p.full_name,
    ug.xp,
    ug.level,
    ug.streak_days,
    ROW_NUMBER() OVER (ORDER BY ug.xp DESC) as rank
  FROM public.user_gamification ug
  LEFT JOIN public.profiles p ON p.user_id = ug.user_id
  ORDER BY ug.xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;