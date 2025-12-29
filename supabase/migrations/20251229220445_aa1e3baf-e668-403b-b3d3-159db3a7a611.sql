-- Adicionar coluna para identificar de qual programa o diagnóstico foi preenchido
ALTER TABLE public.student_diagnostics 
ADD COLUMN IF NOT EXISTS filled_from_course_id UUID REFERENCES public.courses(id);