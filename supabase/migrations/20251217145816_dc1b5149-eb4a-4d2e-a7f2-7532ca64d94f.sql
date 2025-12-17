-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'new_student', 'new_lead', 'new_enrollment', 'community_post'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policy - only admins can see notifications
CREATE POLICY "Admins can manage admin notifications" 
ON public.admin_notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin_notification_preferences table
CREATE TABLE public.admin_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  notify_new_students BOOLEAN DEFAULT true,
  notify_new_leads BOOLEAN DEFAULT true,
  notify_new_enrollments BOOLEAN DEFAULT true,
  notify_community_posts BOOLEAN DEFAULT true,
  notify_course_completions BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policy - admins can manage their own preferences
CREATE POLICY "Admins can manage own preferences" 
ON public.admin_notification_preferences 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

-- Function to create admin notification
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_event_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (event_type, title, message, metadata)
  VALUES (p_event_type, p_title, p_message, p_metadata);
END;
$$;

-- Trigger function for new student
CREATE OR REPLACE FUNCTION public.notify_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'student' THEN
    PERFORM create_admin_notification(
      'new_student',
      'Novo Aluno',
      'Um novo aluno se cadastrou na plataforma',
      jsonb_build_object('user_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for new student
CREATE TRIGGER on_new_student_role
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_student();

-- Trigger function for new lead
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'new_lead',
    'Novo Lead',
    format('Novo lead capturado: %s', NEW.full_name),
    jsonb_build_object('lead_id', NEW.id, 'name', NEW.full_name, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new lead
CREATE TRIGGER on_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_lead();

-- Trigger function for new enrollment
CREATE OR REPLACE FUNCTION public.notify_new_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title TEXT;
  v_student_name TEXT;
BEGIN
  SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;
  SELECT full_name INTO v_student_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  PERFORM create_admin_notification(
    'new_enrollment',
    'Nova Matrícula',
    format('%s se matriculou em %s', COALESCE(v_student_name, 'Aluno'), COALESCE(v_course_title, 'um curso')),
    jsonb_build_object('enrollment_id', NEW.id, 'user_id', NEW.user_id, 'course_id', NEW.course_id)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new enrollment
CREATE TRIGGER on_new_enrollment
AFTER INSERT ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_enrollment();

-- Trigger function for new community post
CREATE OR REPLACE FUNCTION public.notify_new_community_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_name TEXT;
BEGIN
  SELECT full_name INTO v_author_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  PERFORM create_admin_notification(
    'community_post',
    'Novo Post na Comunidade',
    format('%s publicou: %s', COALESCE(v_author_name, 'Alguém'), LEFT(NEW.title, 50)),
    jsonb_build_object('post_id', NEW.id, 'user_id', NEW.user_id, 'title', NEW.title)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new community post
CREATE TRIGGER on_new_community_post
AFTER INSERT ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_community_post();

-- Enable realtime for admin_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;