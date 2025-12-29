-- Adicionar campo lesson_label para labels específicos de aulas
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS lesson_label TEXT;

-- Comentário explicativo
COMMENT ON COLUMN public.lessons.lesson_label IS 'Label visual da aula: estrategico, tecnico, material, acao';