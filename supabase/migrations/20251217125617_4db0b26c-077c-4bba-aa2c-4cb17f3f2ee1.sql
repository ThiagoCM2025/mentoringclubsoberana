-- Certificates and Notes tables for Phase 4

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates" 
ON public.certificates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all certificates" 
ON public.certificates 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public verification policy (anyone can verify by certificate number)
CREATE POLICY "Anyone can verify certificates" 
ON public.certificates 
FOR SELECT 
USING (true);

-- Notes table for lesson annotations
CREATE TABLE public.lesson_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" 
ON public.lesson_notes 
FOR ALL 
USING (auth.uid() = user_id);

-- Favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" 
ON public.user_favorites 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to generate certificate
CREATE OR REPLACE FUNCTION public.generate_certificate(
  p_user_id UUID,
  p_course_id UUID,
  p_student_name TEXT,
  p_course_title TEXT
)
RETURNS UUID AS $$
DECLARE
  v_certificate_id UUID;
  v_cert_number TEXT;
BEGIN
  -- Generate unique certificate number
  v_cert_number := 'SOB-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)) || '-' || TO_CHAR(NOW(), 'YYYY');
  
  INSERT INTO public.certificates (
    user_id, 
    course_id, 
    certificate_number, 
    student_name, 
    course_title
  ) VALUES (
    p_user_id, 
    p_course_id, 
    v_cert_number, 
    p_student_name, 
    p_course_title
  )
  ON CONFLICT (user_id, course_id) DO NOTHING
  RETURNING id INTO v_certificate_id;
  
  RETURN v_certificate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;