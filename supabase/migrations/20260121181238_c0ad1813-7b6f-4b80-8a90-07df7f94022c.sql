-- Adicionar colunas faltantes na tabela admin_alert_occurrences
ALTER TABLE public.admin_alert_occurrences 
  ADD COLUMN IF NOT EXISTS alert_type text,
  ADD COLUMN IF NOT EXISTS title text;

-- Criar índice para busca eficiente de deduplicação
CREATE INDEX IF NOT EXISTS idx_alert_occurrences_lookup 
  ON public.admin_alert_occurrences(alert_type, entity_id);

-- Função para limpar registro de alerta quando lead for atualizado (contato feito)
CREATE OR REPLACE FUNCTION public.clear_lead_alert_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.updated_at > OLD.updated_at OR NEW.last_contact_at IS DISTINCT FROM OLD.last_contact_at THEN
    DELETE FROM public.admin_alert_occurrences 
    WHERE entity_id = NEW.id::text AND alert_type = 'lead_inactive';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para limpar alerta quando lead é atualizado
DROP TRIGGER IF EXISTS tr_clear_lead_alert ON public.leads;
CREATE TRIGGER tr_clear_lead_alert
AFTER UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.clear_lead_alert_on_update();

-- Função para limpar registro de alerta quando aluna tiver atividade
CREATE OR REPLACE FUNCTION public.clear_student_alert_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.admin_alert_occurrences 
  WHERE entity_id = NEW.user_id::text AND alert_type = 'student_inactive';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para limpar alerta quando aluna completa progresso
DROP TRIGGER IF EXISTS tr_clear_student_alert ON public.progress;
CREATE TRIGGER tr_clear_student_alert
AFTER INSERT OR UPDATE ON public.progress
FOR EACH ROW EXECUTE FUNCTION public.clear_student_alert_on_activity();