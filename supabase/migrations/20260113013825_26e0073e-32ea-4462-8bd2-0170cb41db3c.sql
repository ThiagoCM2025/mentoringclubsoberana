-- Tabela para disparos agendados
CREATE TABLE public.scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuração do disparo
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'notification')),
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Filtros de destinatários
  source_filter TEXT,
  status_filter TEXT,
  temperature_filter TEXT,
  recipient_count INTEGER DEFAULT 0,
  
  -- Agendamento (horário de Brasília)
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status do disparo
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Auditoria
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Logs de erro
  error_message TEXT
);

-- Índices para performance
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);
CREATE INDEX idx_scheduled_messages_pending ON public.scheduled_messages(status, scheduled_for) WHERE status = 'pending';

-- Habilitar RLS
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para admins usando has_role
CREATE POLICY "Admins can view all scheduled messages"
ON public.scheduled_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert scheduled messages"
ON public.scheduled_messages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scheduled messages"
ON public.scheduled_messages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scheduled messages"
ON public.scheduled_messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));