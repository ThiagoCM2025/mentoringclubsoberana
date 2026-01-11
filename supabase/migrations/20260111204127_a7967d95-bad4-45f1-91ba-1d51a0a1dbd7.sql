-- Create jornada_access table to control video access
CREATE TABLE public.jornada_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  jornada_slug TEXT NOT NULL DEFAULT 'jornada-imobiliaria-2026',
  access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_email_jornada UNIQUE (email, jornada_slug)
);

-- Enable RLS
ALTER TABLE public.jornada_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can check access by token" 
ON public.jornada_access 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage jornada access" 
ON public.jornada_access 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow public insert for lead registration" 
ON public.jornada_access 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_jornada_access_token ON public.jornada_access(access_token);
CREATE INDEX idx_jornada_access_email ON public.jornada_access(email);

-- Function to automatically create jornada access when a lead registers
CREATE OR REPLACE FUNCTION public.create_jornada_access_on_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the source indicates it's from a jornada landing page
  IF NEW.source ILIKE 'jornada%' THEN
    INSERT INTO public.jornada_access (lead_id, email, jornada_slug)
    VALUES (
      NEW.id, 
      LOWER(TRIM(NEW.email)), 
      COALESCE(
        CASE 
          WHEN NEW.source = 'jornada_imobiliaria_2026' THEN 'jornada-imobiliaria-2026'
          ELSE REPLACE(NEW.source, '_', '-')
        END,
        'jornada-imobiliaria-2026'
      )
    )
    ON CONFLICT (email, jornada_slug) 
    DO UPDATE SET 
      lead_id = EXCLUDED.lead_id,
      last_accessed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create access on lead insert
CREATE TRIGGER trg_create_jornada_access_on_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.create_jornada_access_on_lead();

-- Also create access for existing leads with jornada source
INSERT INTO public.jornada_access (lead_id, email, jornada_slug)
SELECT id, LOWER(TRIM(email)), 'jornada-imobiliaria-2026'
FROM public.leads
WHERE source ILIKE 'jornada%'
ON CONFLICT (email, jornada_slug) DO NOTHING;