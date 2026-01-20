-- Adicionar colunas de mídia na tabela whatsapp_messages
ALTER TABLE public.whatsapp_messages
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT,
ADD COLUMN IF NOT EXISTS media_filename TEXT,
ADD COLUMN IF NOT EXISTS media_mimetype TEXT,
ADD COLUMN IF NOT EXISTS media_size INTEGER;