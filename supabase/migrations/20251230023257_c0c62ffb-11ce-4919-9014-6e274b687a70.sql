-- RPC Function: get_student_dashboard_data
-- Consolida todas as queries do StudentDashboard em uma única chamada
-- Reduz de ~25 queries para 1 query

CREATE OR REPLACE FUNCTION public.get_student_dashboard_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_profile jsonb;
  v_enrollments jsonb;
  v_gamification jsonb;
  v_continue_watching jsonb;
  v_stats jsonb;
BEGIN
  -- 1. Buscar perfil do usuário
  SELECT jsonb_build_object(
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'bio', p.bio
  ) INTO v_profile
  FROM profiles p
  WHERE p.user_id = p_user_id;

  -- 2. Buscar matrículas com cursos e progresso calculado
  SELECT COALESCE(jsonb_agg(enrollment_data), '[]'::jsonb) INTO v_enrollments
  FROM (
    SELECT jsonb_build_object(
      'course_id', e.course_id,
      'enrolled_at', e.enrolled_at,
      'course', jsonb_build_object(
        'id', c.id,
        'title', c.title,
        'description', c.description,
        'thumbnail_url', c.thumbnail_url,
        'program_type', c.program_type,
        'duration_weeks', c.duration_weeks
      ),
      'progress_percentage', COALESCE(
        (SELECT 
          CASE 
            WHEN COUNT(l.id) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN pr.completed THEN 1 END)::numeric / COUNT(l.id)::numeric) * 100)
          END
        FROM modules m
        JOIN lessons l ON l.module_id = m.id
        LEFT JOIN progress pr ON pr.lesson_id = l.id AND pr.user_id = p_user_id
        WHERE m.course_id = c.id
        ), 0
      ),
      'total_lessons', (
        SELECT COUNT(l.id)
        FROM modules m
        JOIN lessons l ON l.module_id = m.id
        WHERE m.course_id = c.id
      ),
      'completed_lessons', (
        SELECT COUNT(pr.id)
        FROM modules m
        JOIN lessons l ON l.module_id = m.id
        JOIN progress pr ON pr.lesson_id = l.id AND pr.user_id = p_user_id AND pr.completed = true
        WHERE m.course_id = c.id
      )
    ) as enrollment_data
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id AND c.is_published = true
    WHERE e.user_id = p_user_id
    ORDER BY e.enrolled_at DESC
  ) sub;

  -- 3. Buscar dados de gamificação
  SELECT jsonb_build_object(
    'xp', COALESCE(ug.xp, 0),
    'level', COALESCE(ug.level, 1),
    'streak_days', COALESCE(ug.streak_days, 0),
    'total_lessons_completed', COALESCE(ug.total_lessons_completed, 0),
    'last_activity_date', ug.last_activity_date
  ) INTO v_gamification
  FROM user_gamification ug
  WHERE ug.user_id = p_user_id;

  IF v_gamification IS NULL THEN
    v_gamification := jsonb_build_object(
      'xp', 0,
      'level', 1,
      'streak_days', 0,
      'total_lessons_completed', 0,
      'last_activity_date', NULL
    );
  END IF;

  -- 4. Buscar "Continue Watching" - últimas aulas em progresso
  SELECT COALESCE(jsonb_agg(continue_data ORDER BY last_watched DESC), '[]'::jsonb) INTO v_continue_watching
  FROM (
    SELECT DISTINCT ON (c.id)
      jsonb_build_object(
        'course_id', c.id,
        'course_title', c.title,
        'course_thumbnail', c.thumbnail_url,
        'lesson_id', l.id,
        'lesson_title', l.title,
        'module_title', m.title,
        'watch_percentage', pr.watch_percentage,
        'last_watched', pr.updated_at
      ) as continue_data,
      pr.updated_at as last_watched
    FROM progress pr
    JOIN lessons l ON l.id = pr.lesson_id
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    JOIN enrollments e ON e.course_id = c.id AND e.user_id = p_user_id
    WHERE pr.user_id = p_user_id
      AND pr.completed = false
      AND pr.watch_percentage > 0
      AND c.is_published = true
    ORDER BY c.id, pr.updated_at DESC
  ) sub
  LIMIT 5;

  -- 5. Calcular estatísticas gerais
  SELECT jsonb_build_object(
    'active_courses', (
      SELECT COUNT(DISTINCT e.course_id)
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id AND c.is_published = true
      WHERE e.user_id = p_user_id
    ),
    'total_study_minutes', (
      SELECT COALESCE(SUM(pr.watch_time_seconds) / 60, 0)
      FROM progress pr
      WHERE pr.user_id = p_user_id
    ),
    'certificates_count', (
      SELECT COUNT(*)
      FROM certificates cert
      WHERE cert.user_id = p_user_id
    ),
    'badges_count', (
      SELECT COUNT(*)
      FROM user_badges ub
      WHERE ub.user_id = p_user_id
    )
  ) INTO v_stats;

  -- Montar resultado final
  v_result := jsonb_build_object(
    'profile', v_profile,
    'enrollments', v_enrollments,
    'gamification', v_gamification,
    'continue_watching', v_continue_watching,
    'stats', v_stats
  );

  RETURN v_result;
END;
$function$;

-- RPC Function: get_program_detail_data
-- Consolida todas as queries da página de detalhes do programa
-- Reduz de ~10 queries para 1 query

CREATE OR REPLACE FUNCTION public.get_program_detail_data(p_course_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_course jsonb;
  v_enrollment jsonb;
  v_modules jsonb;
  v_missions jsonb;
  v_gamification jsonb;
  v_titles jsonb;
  v_diagnostic jsonb;
  v_certificate jsonb;
  v_enrollment_date date;
  v_current_week integer;
BEGIN
  -- 1. Buscar dados do curso
  SELECT jsonb_build_object(
    'id', c.id,
    'title', c.title,
    'description', c.description,
    'thumbnail_url', c.thumbnail_url,
    'program_type', c.program_type,
    'duration_weeks', c.duration_weeks,
    'welcome_video_url', c.welcome_video_url
  ) INTO v_course
  FROM courses c
  WHERE c.id = p_course_id AND c.is_published = true;

  IF v_course IS NULL THEN
    RETURN jsonb_build_object('error', 'Course not found');
  END IF;

  -- 2. Buscar matrícula e calcular semana atual
  SELECT e.enrolled_at::date INTO v_enrollment_date
  FROM enrollments e
  WHERE e.course_id = p_course_id AND e.user_id = p_user_id;

  IF v_enrollment_date IS NOT NULL THEN
    v_current_week := get_current_program_week(v_enrollment_date);
    v_enrollment := jsonb_build_object(
      'enrolled_at', v_enrollment_date,
      'current_week', v_current_week
    );
  ELSE
    v_current_week := 1;
    v_enrollment := NULL;
  END IF;

  -- 3. Buscar módulos com lições e progresso
  SELECT COALESCE(jsonb_agg(module_data ORDER BY module_order), '[]'::jsonb) INTO v_modules
  FROM (
    SELECT 
      jsonb_build_object(
        'id', m.id,
        'title', m.title,
        'description', m.description,
        'order_index', m.order_index,
        'unlock_week', m.unlock_week,
        'is_dynamic', m.is_dynamic,
        'is_unlocked', is_module_unlocked(m.id, p_user_id),
        'lessons', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', l.id,
              'title', l.title,
              'duration_minutes', l.duration_minutes,
              'order_index', l.order_index,
              'video_url', l.video_url,
              'completed', COALESCE(pr.completed, false),
              'watch_percentage', COALESCE(pr.watch_percentage, 0)
            ) ORDER BY l.order_index
          ), '[]'::jsonb)
          FROM lessons l
          LEFT JOIN progress pr ON pr.lesson_id = l.id AND pr.user_id = p_user_id
          WHERE l.module_id = m.id
        ),
        'completed_lessons', (
          SELECT COUNT(*)
          FROM lessons l
          JOIN progress pr ON pr.lesson_id = l.id AND pr.user_id = p_user_id AND pr.completed = true
          WHERE l.module_id = m.id
        ),
        'total_lessons', (
          SELECT COUNT(*) FROM lessons l WHERE l.module_id = m.id
        )
      ) as module_data,
      m.order_index as module_order
    FROM modules m
    WHERE m.course_id = p_course_id
  ) sub;

  -- 4. Buscar missões semanais com status de conclusão
  SELECT COALESCE(jsonb_agg(mission_data ORDER BY week_num), '[]'::jsonb) INTO v_missions
  FROM (
    SELECT 
      jsonb_build_object(
        'id', wm.id,
        'week_number', wm.week_number,
        'title', wm.title,
        'description', wm.description,
        'xp_reward', wm.xp_reward,
        'is_active', wm.is_active,
        'status', COALESCE(umc.status, 'pending'),
        'submitted_at', umc.submitted_at,
        'is_current_week', wm.week_number = v_current_week,
        'is_future', wm.week_number > v_current_week
      ) as mission_data,
      wm.week_number as week_num
    FROM weekly_missions wm
    LEFT JOIN user_mission_completions umc ON umc.mission_id = wm.id AND umc.user_id = p_user_id
    WHERE wm.course_id = p_course_id AND wm.is_active = true
  ) sub;

  -- 5. Buscar gamificação do curso
  SELECT jsonb_build_object(
    'xp', COALESCE(cg.xp, 0),
    'level', COALESCE(cg.level, 1),
    'current_title', COALESCE(cg.current_title, 'Advogada Invisível'),
    'missions_completed', COALESCE(cg.missions_completed, 0),
    'week_progress', COALESCE(cg.week_progress, 0)
  ) INTO v_gamification
  FROM course_gamification cg
  WHERE cg.course_id = p_course_id AND cg.user_id = p_user_id;

  IF v_gamification IS NULL THEN
    v_gamification := jsonb_build_object(
      'xp', 0,
      'level', 1,
      'current_title', 'Advogada Invisível',
      'missions_completed', 0,
      'week_progress', 0
    );
  END IF;

  -- 6. Buscar títulos do programa
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'week_number', pt.week_number,
      'title', pt.title,
      'emoji', pt.emoji
    ) ORDER BY pt.week_number
  ), '[]'::jsonb) INTO v_titles
  FROM program_titles pt
  WHERE pt.course_id = p_course_id;

  -- 7. Verificar diagnóstico
  SELECT jsonb_build_object(
    'id', sd.id,
    'is_completed', sd.is_completed,
    'completed_at', sd.completed_at
  ) INTO v_diagnostic
  FROM student_diagnostics sd
  WHERE sd.user_id = p_user_id
  LIMIT 1;

  -- 8. Verificar certificado
  SELECT jsonb_build_object(
    'id', cert.id,
    'certificate_number', cert.certificate_number,
    'issued_at', cert.issued_at
  ) INTO v_certificate
  FROM certificates cert
  WHERE cert.user_id = p_user_id AND cert.course_id = p_course_id;

  -- Montar resultado final
  v_result := jsonb_build_object(
    'course', v_course,
    'enrollment', v_enrollment,
    'modules', v_modules,
    'missions', v_missions,
    'gamification', v_gamification,
    'titles', v_titles,
    'diagnostic', v_diagnostic,
    'certificate', v_certificate,
    'current_week', v_current_week
  );

  RETURN v_result;
END;
$function$;