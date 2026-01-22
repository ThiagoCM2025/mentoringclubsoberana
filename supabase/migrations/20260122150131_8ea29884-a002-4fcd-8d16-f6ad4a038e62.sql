-- Add new columns for WhatsApp conversation management features
ALTER TABLE public.whatsapp_conversations
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS muted_until TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance on pinned conversations
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_pinned ON public.whatsapp_conversations(is_pinned DESC, last_message_at DESC) WHERE status = 'active';

-- Create index for favorite conversations
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_favorite ON public.whatsapp_conversations(is_favorite) WHERE is_favorite = true;