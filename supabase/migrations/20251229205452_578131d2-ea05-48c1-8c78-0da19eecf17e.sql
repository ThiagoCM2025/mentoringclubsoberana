-- 1. Atualizar função get_leaderboard para excluir administradores
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  xp INTEGER,
  level INTEGER,
  streak_days INTEGER,
  rank BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = ug.user_id AND ur.role = 'admin'
  )
  ORDER BY ug.xp DESC
  LIMIT limit_count;
END;
$$;

-- 2. Remover dados de gamificação dos administradores existentes
DELETE FROM public.user_gamification 
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- 3. Atualizar trigger para não criar gamificação para admins futuros
CREATE OR REPLACE FUNCTION public.update_gamification_on_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_to_add integer := 25;
  v_current_xp integer;
  v_new_xp integer;
  v_new_level integer;
  v_is_admin boolean;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'admin'
  ) INTO v_is_admin;
  
  -- Só atualizar gamificação se NÃO for admin
  IF v_is_admin = false AND NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Get current XP
    SELECT xp INTO v_current_xp
    FROM user_gamification
    WHERE user_id = NEW.user_id;
    
    IF v_current_xp IS NULL THEN
      v_current_xp := 0;
    END IF;
    
    -- Calculate new XP and level
    v_new_xp := v_current_xp + v_xp_to_add;
    v_new_level := FLOOR(v_new_xp / 500) + 1;
    
    -- Upsert user_gamification with calculated level
    INSERT INTO user_gamification (user_id, xp, level, total_lessons_completed, streak_days, last_activity_date)
    VALUES (
      NEW.user_id, 
      v_xp_to_add, 
      1, 
      1, 
      1, 
      CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
      xp = user_gamification.xp + v_xp_to_add,
      level = FLOOR((user_gamification.xp + v_xp_to_add) / 500) + 1,
      total_lessons_completed = user_gamification.total_lessons_completed + 1,
      streak_days = CASE
        WHEN user_gamification.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN user_gamification.streak_days + 1
        WHEN user_gamification.last_activity_date = CURRENT_DATE THEN user_gamification.streak_days
        ELSE 1
      END,
      last_activity_date = CURRENT_DATE,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;