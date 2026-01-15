-- Substituir \n literal por quebras de linha reais em whatsapp_message
UPDATE message_templates 
SET whatsapp_message = REPLACE(whatsapp_message, E'\\n', E'\n')
WHERE whatsapp_message IS NOT NULL;

-- Fazer o mesmo para email_body
UPDATE message_templates 
SET email_body = REPLACE(email_body, E'\\n', E'\n')
WHERE email_body IS NOT NULL;