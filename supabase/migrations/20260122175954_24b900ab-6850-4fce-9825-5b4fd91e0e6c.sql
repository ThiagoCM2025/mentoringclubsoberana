-- Permitir NULL na coluna email para leads
ALTER TABLE public.leads 
ALTER COLUMN email DROP NOT NULL;