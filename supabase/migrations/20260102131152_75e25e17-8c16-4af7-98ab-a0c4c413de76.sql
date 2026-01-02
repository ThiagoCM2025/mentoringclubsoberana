-- Criar tabela para armazenar eventos comportamentais
CREATE TABLE public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  page_title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_lead_events_lead ON public.lead_events(lead_id);
CREATE INDEX idx_lead_events_session ON public.lead_events(session_id);
CREATE INDEX idx_lead_events_type ON public.lead_events(event_type);
CREATE INDEX idx_lead_events_created ON public.lead_events(created_at DESC);

-- Adicionar campo behavior_score na tabela leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS behavior_score INTEGER DEFAULT 0;

-- Habilitar RLS
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage lead events"
ON public.lead_events FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert lead events"
ON public.lead_events FOR INSERT
WITH CHECK (true);

-- Função para atualizar score comportamental automaticamente
CREATE OR REPLACE FUNCTION public.update_lead_behavior_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL THEN
    UPDATE public.leads SET 
      behavior_score = (
        SELECT COALESCE(SUM(
          CASE 
            WHEN event_type = 'cta_click' THEN 10
            WHEN event_type = 'scroll_depth' AND (event_data->>'depth')::int >= 75 THEN 5
            WHEN event_type = 'scroll_depth' AND (event_data->>'depth')::int >= 50 THEN 3
            WHEN event_type = 'form_complete' THEN 30
            WHEN event_type = 'form_start' THEN 5
            WHEN event_type = 'page_view' THEN 2
            ELSE 1
          END
        ), 0)
        FROM public.lead_events WHERE lead_id = NEW.lead_id
      ),
      score = COALESCE(score, 0) + CASE 
        WHEN NEW.event_type = 'cta_click' THEN 10
        WHEN NEW.event_type = 'form_complete' THEN 30
        WHEN NEW.event_type = 'form_start' THEN 5
        ELSE 0
      END,
      updated_at = now()
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para atualização automática
CREATE TRIGGER trigger_update_behavior_score
AFTER INSERT ON public.lead_events
FOR EACH ROW EXECUTE FUNCTION public.update_lead_behavior_score();