-- Tabela para rastrear eventos de engajamento dos leads
CREATE TABLE public.lead_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'email_opened', 'email_clicked', 'whatsapp_replied', 'page_visited', 'form_submitted'
  event_data JSONB,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lead_engagement_lead_id ON public.lead_engagement_events(lead_id);
CREATE INDEX idx_lead_engagement_event_type ON public.lead_engagement_events(event_type);
CREATE INDEX idx_lead_engagement_created_at ON public.lead_engagement_events(created_at);

-- Enable RLS
ALTER TABLE public.lead_engagement_events ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem gerenciar eventos
CREATE POLICY "Admins can manage lead engagement events" ON public.lead_engagement_events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Inserção pública para tracking (webhook/edge function)
CREATE POLICY "Allow public insert for tracking" ON public.lead_engagement_events
  FOR INSERT WITH CHECK (true);

-- Tabela para regras de follow-up automático
CREATE TABLE public.follow_up_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  days_without_contact INTEGER NOT NULL DEFAULT 3,
  target_status TEXT[] DEFAULT ARRAY['new', 'contacted'],
  target_temperature TEXT[] DEFAULT ARRAY['cold', 'warm', 'hot'],
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.follow_up_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem gerenciar regras
CREATE POLICY "Admins can manage follow up rules" ON public.follow_up_rules
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Function para calcular score do lead baseado em eventos
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  -- Soma todos os pontos dos eventos do lead
  SELECT COALESCE(SUM(points), 0) INTO v_score
  FROM public.lead_engagement_events
  WHERE lead_id = p_lead_id;
  
  -- Atualiza o score na tabela leads
  UPDATE public.leads SET score = v_score WHERE id = p_lead_id;
  
  RETURN v_score;
END;
$$;

-- Trigger para atualizar score automaticamente quando um evento é criado
CREATE OR REPLACE FUNCTION public.update_lead_score_on_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.calculate_lead_score(NEW.lead_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_lead_score
AFTER INSERT ON public.lead_engagement_events
FOR EACH ROW
EXECUTE FUNCTION public.update_lead_score_on_event();