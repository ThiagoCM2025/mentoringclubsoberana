-- Create email_tracking table for tracking opens and clicks
CREATE TABLE public.email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID REFERENCES public.communication_history(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  tracking_id TEXT UNIQUE NOT NULL,
  subject TEXT,
  campaign_source TEXT,
  channel TEXT DEFAULT 'email',
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  opened_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  clicked_count INTEGER DEFAULT 0,
  clicked_links JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for fast lookups
CREATE INDEX idx_email_tracking_id ON public.email_tracking(tracking_id);
CREATE INDEX idx_email_tracking_lead ON public.email_tracking(lead_id);
CREATE INDEX idx_email_tracking_campaign ON public.email_tracking(campaign_source);
CREATE INDEX idx_email_tracking_sent_at ON public.email_tracking(sent_at);

-- Enable RLS
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Policies using user_roles table for admin check
CREATE POLICY "Admins can read email tracking"
ON public.email_tracking
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert email tracking"
ON public.email_tracking
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update email tracking"
ON public.email_tracking
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Service role bypass for edge functions
CREATE POLICY "Service role can do everything"
ON public.email_tracking
FOR ALL
USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE public.email_tracking IS 'Tracks email opens and clicks for campaign analytics';