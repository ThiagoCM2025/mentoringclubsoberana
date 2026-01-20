-- Drop old constraint and create new one with 'conversation' type
ALTER TABLE public.admin_tags 
DROP CONSTRAINT admin_tags_entity_type_check;

ALTER TABLE public.admin_tags 
ADD CONSTRAINT admin_tags_entity_type_check 
CHECK (entity_type::text = ANY (ARRAY['student'::text, 'lead'::text, 'course'::text, 'conversation'::text]));

-- Add conversation tags
INSERT INTO public.admin_tags (name, color, entity_type) VALUES
('🔥 Urgente', '#EF4444', 'conversation'),
('⭐ Importante', '#F59E0B', 'conversation'),
('💬 Em andamento', '#3B82F6', 'conversation'),
('✅ Resolvido', '#22C55E', 'conversation'),
('⏳ Aguardando', '#8B5CF6', 'conversation'),
('🎯 Vendas', '#EC4899', 'conversation'),
('❓ Dúvida', '#06B6D4', 'conversation'),
('📋 Suporte', '#6366F1', 'conversation')
ON CONFLICT DO NOTHING;