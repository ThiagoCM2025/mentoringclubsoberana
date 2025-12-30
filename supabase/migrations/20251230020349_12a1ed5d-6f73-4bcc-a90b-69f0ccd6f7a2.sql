-- Tabela para armazenar histórico de alterações do diagnóstico
CREATE TABLE public.diagnostic_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL,
  user_id UUID NOT NULL,
  changed_fields JSONB NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  change_type TEXT DEFAULT 'update'
);

-- Habilitar RLS
ALTER TABLE public.diagnostic_history ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem visualizar histórico
CREATE POLICY "Admins can view diagnostic history"
  ON public.diagnostic_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Índices para performance
CREATE INDEX idx_diagnostic_history_user_id ON public.diagnostic_history(user_id);
CREATE INDEX idx_diagnostic_history_changed_at ON public.diagnostic_history(changed_at DESC);

-- Tabela para notas do admin sobre alunos
CREATE TABLE public.admin_student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL,
  admin_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.admin_student_notes ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem gerenciar notas
CREATE POLICY "Admins can manage student notes"
  ON public.admin_student_notes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Índice para busca por aluno
CREATE INDEX idx_admin_student_notes_student ON public.admin_student_notes(student_user_id);

-- Trigger para updated_at
CREATE TRIGGER update_admin_student_notes_updated_at
  BEFORE UPDATE ON public.admin_student_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função que registra alterações no diagnóstico
CREATE OR REPLACE FUNCTION public.track_diagnostic_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changes JSONB := '{}';
BEGIN
  -- Comparar campos e registrar mudanças
  IF OLD.years_practicing IS DISTINCT FROM NEW.years_practicing THEN
    v_changes := v_changes || jsonb_build_object('years_practicing', jsonb_build_object('old', OLD.years_practicing, 'new', NEW.years_practicing));
  END IF;
  
  IF OLD.practice_area IS DISTINCT FROM NEW.practice_area THEN
    v_changes := v_changes || jsonb_build_object('practice_area', jsonb_build_object('old', OLD.practice_area, 'new', NEW.practice_area));
  END IF;
  
  IF OLD.practice_area_other IS DISTINCT FROM NEW.practice_area_other THEN
    v_changes := v_changes || jsonb_build_object('practice_area_other', jsonb_build_object('old', OLD.practice_area_other, 'new', NEW.practice_area_other));
  END IF;
  
  IF OLD.has_office IS DISTINCT FROM NEW.has_office THEN
    v_changes := v_changes || jsonb_build_object('has_office', jsonb_build_object('old', OLD.has_office, 'new', NEW.has_office));
  END IF;
  
  IF OLD.office_size IS DISTINCT FROM NEW.office_size THEN
    v_changes := v_changes || jsonb_build_object('office_size', jsonb_build_object('old', OLD.office_size, 'new', NEW.office_size));
  END IF;
  
  IF OLD.monthly_revenue IS DISTINCT FROM NEW.monthly_revenue THEN
    v_changes := v_changes || jsonb_build_object('monthly_revenue', jsonb_build_object('old', OLD.monthly_revenue, 'new', NEW.monthly_revenue));
  END IF;
  
  IF OLD.revenue_goal IS DISTINCT FROM NEW.revenue_goal THEN
    v_changes := v_changes || jsonb_build_object('revenue_goal', jsonb_build_object('old', OLD.revenue_goal, 'new', NEW.revenue_goal));
  END IF;
  
  IF OLD.main_challenges IS DISTINCT FROM NEW.main_challenges THEN
    v_changes := v_changes || jsonb_build_object('main_challenges', jsonb_build_object('old', OLD.main_challenges, 'new', NEW.main_challenges));
  END IF;
  
  IF OLD.main_goals IS DISTINCT FROM NEW.main_goals THEN
    v_changes := v_changes || jsonb_build_object('main_goals', jsonb_build_object('old', OLD.main_goals, 'new', NEW.main_goals));
  END IF;
  
  IF OLD.marketing_knowledge IS DISTINCT FROM NEW.marketing_knowledge THEN
    v_changes := v_changes || jsonb_build_object('marketing_knowledge', jsonb_build_object('old', OLD.marketing_knowledge, 'new', NEW.marketing_knowledge));
  END IF;
  
  IF OLD.digital_presence IS DISTINCT FROM NEW.digital_presence THEN
    v_changes := v_changes || jsonb_build_object('digital_presence', jsonb_build_object('old', OLD.digital_presence, 'new', NEW.digital_presence));
  END IF;
  
  IF OLD.referral_source IS DISTINCT FROM NEW.referral_source THEN
    v_changes := v_changes || jsonb_build_object('referral_source', jsonb_build_object('old', OLD.referral_source, 'new', NEW.referral_source));
  END IF;
  
  IF OLD.weekly_study_hours IS DISTINCT FROM NEW.weekly_study_hours THEN
    v_changes := v_changes || jsonb_build_object('weekly_study_hours', jsonb_build_object('old', OLD.weekly_study_hours, 'new', NEW.weekly_study_hours));
  END IF;
  
  -- Só registra se houve alterações
  IF v_changes != '{}' THEN
    INSERT INTO public.diagnostic_history (diagnostic_id, user_id, changed_fields, change_type)
    VALUES (NEW.id, NEW.user_id, v_changes, 'update');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para executar após UPDATE
CREATE TRIGGER trigger_diagnostic_history
  AFTER UPDATE ON public.student_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION public.track_diagnostic_changes();