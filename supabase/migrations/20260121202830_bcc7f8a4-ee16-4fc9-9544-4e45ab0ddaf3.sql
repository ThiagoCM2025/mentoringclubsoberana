-- Parte 1: Tornar rule_id opcional para alertas automáticos
ALTER TABLE admin_alert_occurrences 
ALTER COLUMN rule_id DROP NOT NULL;

-- Parte 2: Trigger para limpar alerta quando lead é atualizada (contato feito)
CREATE OR REPLACE FUNCTION clear_lead_alert()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM admin_alert_occurrences 
  WHERE alert_type = 'lead_inactive' 
  AND entity_id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_clear_lead_alert ON leads;
CREATE TRIGGER tr_clear_lead_alert
AFTER UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION clear_lead_alert();

-- Parte 3: Trigger para limpar alerta quando aluna acessa/é atualizada
CREATE OR REPLACE FUNCTION clear_student_alert()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM admin_alert_occurrences 
  WHERE alert_type = 'student_inactive' 
  AND entity_id = NEW.user_id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_clear_student_alert ON profiles;
CREATE TRIGGER tr_clear_student_alert
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION clear_student_alert();