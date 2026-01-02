-- Tabela para logs de execução do nurturing
CREATE TABLE public.nurturing_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emails_sent INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  leads_processed JSONB DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  error_details TEXT
);

-- RLS para nurturing_executions
ALTER TABLE public.nurturing_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view nurturing executions"
ON public.nurturing_executions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow insert from edge functions"
ON public.nurturing_executions
FOR INSERT
WITH CHECK (true);

-- Habilitar as extensões necessárias para cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;