-- =========================================
-- ADMIN IMPROVEMENTS: Tags, Filters, Alerts, Widgets
-- =========================================

-- 1. Admin Tags - Tags customizáveis para entidades
CREATE TABLE public.admin_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('student', 'lead', 'course')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, entity_type)
);

-- 2. Entity Tags - Associação entre tags e entidades
CREATE TABLE public.entity_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id UUID NOT NULL REFERENCES public.admin_tags(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('student', 'lead', 'course')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tag_id, entity_id, entity_type)
);

-- 3. Saved Filters - Filtros salvos por admin
CREATE TABLE public.saved_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('student', 'lead', 'course')),
  filter_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Alert Rules - Regras de alertas configuráveis
CREATE TABLE public.admin_alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('lead_inactive', 'student_inactive', 'mission_pending', 'low_conversion', 'custom')),
  conditions JSONB NOT NULL DEFAULT '{}',
  threshold_value INTEGER DEFAULT 0,
  threshold_unit VARCHAR(20) DEFAULT 'days',
  severity VARCHAR(20) NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Alert Occurrences - Ocorrências de alertas
CREATE TABLE public.admin_alert_occurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.admin_alert_rules(id) ON DELETE CASCADE,
  entity_id UUID,
  entity_type VARCHAR(20),
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'warning',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Dashboard Layouts - Layouts personalizados do dashboard por admin
CREATE TABLE public.admin_dashboard_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL UNIQUE,
  layout_config JSONB NOT NULL DEFAULT '[]',
  favorite_metrics TEXT[] DEFAULT '{}',
  grid_columns INTEGER DEFAULT 3,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alert_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admins can manage tags" ON public.admin_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage entity tags" ON public.entity_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage own saved filters" ON public.saved_filters
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Admins can view all alert rules" ON public.admin_alert_rules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage alert rules" ON public.admin_alert_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage alert occurrences" ON public.admin_alert_occurrences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage own dashboard layout" ON public.admin_dashboard_layouts
  FOR ALL USING (admin_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_entity_tags_entity ON public.entity_tags(entity_id, entity_type);
CREATE INDEX idx_entity_tags_tag ON public.entity_tags(tag_id);
CREATE INDEX idx_saved_filters_admin ON public.saved_filters(admin_id);
CREATE INDEX idx_alert_occurrences_rule ON public.admin_alert_occurrences(rule_id);
CREATE INDEX idx_alert_occurrences_unresolved ON public.admin_alert_occurrences(is_resolved) WHERE is_resolved = false;

-- Insert default alert rules
INSERT INTO public.admin_alert_rules (name, description, alert_type, conditions, threshold_value, threshold_unit, severity) VALUES
  ('Lead Quente sem Contato', 'Alerta quando um lead quente não é contatado', 'lead_inactive', '{"temperature": "hot"}', 24, 'hours', 'critical'),
  ('Aluna Inativa', 'Alerta quando uma aluna fica inativa por muito tempo', 'student_inactive', '{}', 7, 'days', 'warning'),
  ('Missão Pendente de Revisão', 'Alerta quando há missões aguardando aprovação', 'mission_pending', '{}', 48, 'hours', 'warning'),
  ('Taxa de Conversão Baixa', 'Alerta quando a taxa de conversão está abaixo do esperado', 'low_conversion', '{"threshold_percentage": 5}', 5, 'percent', 'info');

-- Insert default tags
INSERT INTO public.admin_tags (name, color, entity_type) VALUES
  ('VIP', '#EAB308', 'student'),
  ('Risco de Churn', '#EF4444', 'student'),
  ('Alta Performance', '#22C55E', 'student'),
  ('Precisa Atenção', '#F97316', 'student'),
  ('VIP', '#EAB308', 'lead'),
  ('Urgente', '#EF4444', 'lead'),
  ('Indicação', '#8B5CF6', 'lead'),
  ('Retorno', '#3B82F6', 'lead');