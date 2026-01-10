-- 1. Add welcome video fields to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS welcome_video_url TEXT,
ADD COLUMN IF NOT EXISTS welcome_video_duration INTEGER;

-- 2. Create video library table
CREATE TABLE IF NOT EXISTS public.video_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'direct')),
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on video_library
ALTER TABLE public.video_library ENABLE ROW LEVEL SECURITY;

-- Admins can manage video library
CREATE POLICY "Admins can manage video library"
ON public.video_library
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students can view videos (for library picker in future)
CREATE POLICY "Students can view video library"
ON public.video_library
FOR SELECT
USING (public.has_role(auth.uid(), 'student'));

-- 3. Create video analytics table
CREATE TABLE IF NOT EXISTS public.video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  session_id TEXT,
  watched_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  drop_off_point INTEGER,
  play_events INTEGER DEFAULT 0,
  pause_events INTEGER DEFAULT 0,
  seek_events INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id, user_id, session_id)
);

-- Enable RLS on video_analytics
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;

-- Users can insert/update their own analytics
CREATE POLICY "Users can manage their video analytics"
ON public.video_analytics
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all video analytics"
ON public.video_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create lesson transcripts table
CREATE TABLE IF NOT EXISTS public.lesson_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE UNIQUE,
  transcript TEXT,
  language TEXT DEFAULT 'pt-BR',
  word_count INTEGER,
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Enable RLS on lesson_transcripts
ALTER TABLE public.lesson_transcripts ENABLE ROW LEVEL SECURITY;

-- Admins can manage transcripts
CREATE POLICY "Admins can manage transcripts"
ON public.lesson_transcripts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students can view transcripts for their enrolled courses
CREATE POLICY "Students can view transcripts for enrolled courses"
ON public.lesson_transcripts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE l.id = lesson_transcripts.lesson_id
    AND e.user_id = auth.uid()
  )
);

-- 5. Create lesson chapters table
CREATE TABLE IF NOT EXISTS public.lesson_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  timestamp_seconds INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on lesson_chapters
ALTER TABLE public.lesson_chapters ENABLE ROW LEVEL SECURITY;

-- Admins can manage chapters
CREATE POLICY "Admins can manage chapters"
ON public.lesson_chapters
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students can view chapters for enrolled courses
CREATE POLICY "Students can view chapters for enrolled courses"
ON public.lesson_chapters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE l.id = lesson_chapters.lesson_id
    AND e.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_analytics_lesson_user ON public.video_analytics(lesson_id, user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_lesson ON public.video_analytics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_chapters_lesson ON public.lesson_chapters(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_transcripts_lesson ON public.lesson_transcripts(lesson_id);

-- Trigger for updated_at on video_library
CREATE TRIGGER update_video_library_updated_at
BEFORE UPDATE ON public.video_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on video_analytics
CREATE TRIGGER update_video_analytics_updated_at
BEFORE UPDATE ON public.video_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();