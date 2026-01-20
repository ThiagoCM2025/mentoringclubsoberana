-- Drop existing constraint and add expanded message types
ALTER TABLE public.whatsapp_messages 
DROP CONSTRAINT IF EXISTS whatsapp_messages_message_type_check;

ALTER TABLE public.whatsapp_messages 
ADD CONSTRAINT whatsapp_messages_message_type_check 
CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'sticker', 'conversation', 'extendedTextMessage'));