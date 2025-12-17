-- Tabela de permissões granulares para administradores
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Permissões por módulo
  can_manage_courses BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  can_manage_enrollments BOOLEAN DEFAULT false,
  can_manage_leads BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  can_send_notifications BOOLEAN DEFAULT false,
  can_manage_admins BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Admins podem ver permissões
CREATE POLICY "Admins can view permissions" ON public.admin_permissions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Super admins podem gerenciar permissões
CREATE POLICY "Super admins can manage permissions" ON public.admin_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_permissions ap 
      WHERE ap.user_id = auth.uid() AND ap.can_manage_admins = true
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();