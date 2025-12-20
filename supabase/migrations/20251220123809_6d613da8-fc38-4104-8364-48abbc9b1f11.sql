-- Tabela para rastrear conversões de leads
CREATE TABLE public.lead_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  product_name TEXT,
  converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revenue DECIMAL(10,2),
  notes TEXT,
  converted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_lead_conversions_lead_id ON public.lead_conversions(lead_id);
CREATE INDEX idx_lead_conversions_course_id ON public.lead_conversions(course_id);
CREATE INDEX idx_lead_conversions_converted_at ON public.lead_conversions(converted_at);

-- Enable RLS
ALTER TABLE public.lead_conversions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem gerenciar conversões
CREATE POLICY "Admins can manage lead conversions" ON public.lead_conversions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));