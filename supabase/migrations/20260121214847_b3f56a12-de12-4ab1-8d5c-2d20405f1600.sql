-- Alterar entity_id de UUID para TEXT para compatibilidade com o código
ALTER TABLE public.admin_alert_occurrences 
  ALTER COLUMN entity_id TYPE text USING entity_id::text;

-- Inserir registro para parar emails duplicados da Jaqueline IMEDIATAMENTE
INSERT INTO public.admin_alert_occurrences (alert_type, severity, title, message, entity_id, entity_type)
VALUES (
  'lead_inactive', 
  'critical', 
  'Lead Quente sem Contato: Jaqueline', 
  'Lead quente Jaqueline está há mais de 24 horas sem contato.',
  '4eeacf80-63d6-427e-b663-6066b6d27576',
  'lead'
);