-- Atualizar constraint para incluir 'conversation' como entity_type válido
ALTER TABLE public.entity_tags
DROP CONSTRAINT IF EXISTS entity_tags_entity_type_check;

ALTER TABLE public.entity_tags
ADD CONSTRAINT entity_tags_entity_type_check
CHECK (
  (entity_type)::text = ANY (
    ARRAY[
      'student'::text,
      'lead'::text,
      'course'::text,
      'conversation'::text
    ]
  )
);