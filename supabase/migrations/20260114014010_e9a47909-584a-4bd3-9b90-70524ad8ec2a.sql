-- Create table for Avatar Map forms
CREATE TABLE public.student_avatar_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  
  -- NICHO
  nicho TEXT,
  subnicho TEXT,
  roma TEXT,
  
  -- AVATAR - Características
  avatar_idade TEXT,
  avatar_sexo TEXT,
  avatar_salario TEXT,
  avatar_profissao TEXT,
  avatar_religiao TEXT,
  avatar_orientacao_politica TEXT,
  avatar_momento_vida TEXT,
  
  -- SEGMENTAÇÃO
  resumo_avatar TEXT,
  dores_pessoais TEXT[] DEFAULT '{}',
  dores_profissionais TEXT[] DEFAULT '{}',
  dores_emocionais TEXT[] DEFAULT '{}',
  dores_relacionamento TEXT[] DEFAULT '{}',
  
  -- DESEJOS
  desejos_pessoais TEXT[] DEFAULT '{}',
  desejos_profissionais TEXT[] DEFAULT '{}',
  desejos_financeiros TEXT[] DEFAULT '{}',
  
  -- Status
  current_step INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.student_avatar_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Students can view own avatar forms"
  ON public.student_avatar_forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own avatar forms"
  ON public.student_avatar_forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own avatar forms"
  ON public.student_avatar_forms FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all forms (using user_roles table)
CREATE POLICY "Admins can view all avatar forms"
  ON public.student_avatar_forms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_student_avatar_forms_updated_at
  BEFORE UPDATE ON public.student_avatar_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add form_type column to lessons table to identify special forms
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS form_type TEXT;