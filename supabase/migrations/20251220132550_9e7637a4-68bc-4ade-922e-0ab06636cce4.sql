-- Add is_free column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;

-- Create function to auto-enroll users in free courses
CREATE OR REPLACE FUNCTION public.auto_enroll_free_courses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course RECORD;
BEGIN
  -- Only run for student role
  IF NEW.role = 'student' THEN
    -- Enroll in all published free courses
    FOR v_course IN 
      SELECT id FROM public.courses 
      WHERE is_free = true AND is_published = true
    LOOP
      INSERT INTO public.enrollments (user_id, course_id)
      VALUES (NEW.user_id, v_course.id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-enroll on new student signup
DROP TRIGGER IF EXISTS on_new_student_auto_enroll ON public.user_roles;
CREATE TRIGGER on_new_student_auto_enroll
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enroll_free_courses();

-- Function to retroactively enroll existing students in free courses
CREATE OR REPLACE FUNCTION public.enroll_existing_students_in_free_courses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student RECORD;
  v_course RECORD;
BEGIN
  FOR v_student IN 
    SELECT user_id FROM public.user_roles WHERE role = 'student'
  LOOP
    FOR v_course IN 
      SELECT id FROM public.courses WHERE is_free = true AND is_published = true
    LOOP
      INSERT INTO public.enrollments (user_id, course_id)
      VALUES (v_student.user_id, v_course.id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;