-- Create table to store alert email recipients
CREATE TABLE public.admin_alert_email_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notify_critical BOOLEAN DEFAULT true,
  notify_warning BOOLEAN DEFAULT true,
  notify_info BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_alert_email_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email config
CREATE POLICY "Admins can manage alert email config"
ON public.admin_alert_email_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Insert the fixed email recipients
INSERT INTO public.admin_alert_email_config (email, name, is_primary, is_active, notify_critical, notify_warning, notify_info) VALUES
  ('fabianaaugustoduarte@gmail.com', 'Fabiana Augusto Duarte', true, true, true, true, true),
  ('deh.tripoli@hotmail.com', 'Deh Tripoli', false, true, true, true, true);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_alert_email_config_updated_at
BEFORE UPDATE ON public.admin_alert_email_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();