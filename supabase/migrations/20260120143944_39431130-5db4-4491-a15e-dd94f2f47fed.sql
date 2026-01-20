-- Create typing status table for real-time typing indicators
CREATE TABLE public.whatsapp_typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE UNIQUE,
  phone TEXT NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_typing_status;

-- RLS
ALTER TABLE public.whatsapp_typing_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view typing status"
  ON public.whatsapp_typing_status FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage typing status"
  ON public.whatsapp_typing_status FOR ALL
  USING (true)
  WITH CHECK (true);