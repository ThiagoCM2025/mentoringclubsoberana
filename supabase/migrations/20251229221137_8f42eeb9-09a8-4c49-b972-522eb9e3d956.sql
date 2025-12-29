-- Create function to get program-specific leaderboard
CREATE OR REPLACE FUNCTION public.get_program_leaderboard(p_course_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  xp INTEGER,
  level INTEGER,
  current_title TEXT,
  missions_completed INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cg.user_id,
    p.full_name,
    p.avatar_url,
    cg.xp,
    cg.level,
    cg.current_title,
    cg.missions_completed,
    ROW_NUMBER() OVER (ORDER BY cg.xp DESC) as rank
  FROM public.course_gamification cg
  LEFT JOIN public.profiles p ON p.user_id = cg.user_id
  WHERE cg.course_id = p_course_id
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = cg.user_id AND ur.role = 'admin'
  )
  ORDER BY cg.xp DESC
  LIMIT limit_count;
END;
$$;