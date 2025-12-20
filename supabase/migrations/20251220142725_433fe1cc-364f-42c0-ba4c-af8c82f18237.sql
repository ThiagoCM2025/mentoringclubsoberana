-- Update trigger to automatically calculate level based on XP
CREATE OR REPLACE FUNCTION public.update_gamification_on_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_to_add integer := 25;
  v_current_xp integer;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;