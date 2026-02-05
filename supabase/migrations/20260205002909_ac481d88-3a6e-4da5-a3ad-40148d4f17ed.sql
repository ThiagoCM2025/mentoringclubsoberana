-- Table for storing inbound emails (inbox)
CREATE TABLE public.inbound_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  reply_to TEXT,
  message_id TEXT,
  in_reply_to TEXT,
  headers JSONB,
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  student_user_id UUID,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_inbound_emails_from_email ON public.inbound_emails(from_email);
CREATE INDEX idx_inbound_emails_received_at ON public.inbound_emails(received_at DESC);
CREATE INDEX idx_inbound_emails_is_read ON public.inbound_emails(is_read);
CREATE INDEX idx_inbound_emails_lead_id ON public.inbound_emails(lead_id);
CREATE INDEX idx_inbound_emails_student_user_id ON public.inbound_emails(student_user_id);

-- Enable RLS
ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin access (using user_roles table)
CREATE POLICY "Admins can view all inbound emails"
ON public.inbound_emails
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update inbound emails"
ON public.inbound_emails
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete inbound emails"
ON public.inbound_emails
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Enable realtime for inbox updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbound_emails;