-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'negotiating', 'converted', 'lost');

-- Create enum for lead temperature
CREATE TYPE public.lead_temperature AS ENUM ('cold', 'warm', 'hot');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2),
  is_subscription BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create lesson_materials table
CREATE TABLE public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  payment_id TEXT,
  payment_source TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, course_id)
);

-- Create progress table
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, lesson_id)
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT,
  status lead_status DEFAULT 'new',
  temperature lead_temperature DEFAULT 'cold',
  score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create lead_interactions table
CREATE TABLE public.lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ebook_downloads table
CREATE TABLE public.ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  ebook_name TEXT NOT NULL,
  email TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_downloads ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for courses (public read, admin write)
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for modules
CREATE POLICY "Anyone can view modules of published courses" ON public.modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = modules.course_id AND courses.is_published = true
    )
  );

CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lessons
CREATE POLICY "Enrolled users can view lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.course_id = e.course_id
      WHERE m.id = lessons.module_id AND e.user_id = auth.uid()
    )
    OR lessons.is_free = true
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lesson_materials
CREATE POLICY "Enrolled users can view materials" ON public.lesson_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.enrollments e ON e.course_id = m.course_id
      WHERE l.id = lesson_materials.lesson_id AND e.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage materials" ON public.lesson_materials
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for enrollments
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage enrollments" ON public.enrollments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for progress
CREATE POLICY "Users can manage own progress" ON public.progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.progress
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for leads (admin only)
CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- RLS Policies for lead_interactions
CREATE POLICY "Admins can manage lead interactions" ON public.lead_interactions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ebook_downloads
CREATE POLICY "Admins can view downloads" ON public.ebook_downloads
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert downloads" ON public.ebook_downloads
  FOR INSERT WITH CHECK (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();