-- Create lead_action_notes table for multiple action notes per lead
CREATE TABLE public.lead_action_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  action_type TEXT DEFAULT 'note',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_action_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access using user_roles
CREATE POLICY "Admins can view all lead action notes"
ON public.lead_action_notes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can create lead action notes"
ON public.lead_action_notes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete their own lead action notes"
ON public.lead_action_notes
FOR DELETE
TO authenticated
USING (
  admin_user_id = auth.uid()
);

-- Create indexes for faster lookups
CREATE INDEX idx_lead_action_notes_lead_id ON public.lead_action_notes(lead_id);
CREATE INDEX idx_lead_action_notes_created_at ON public.lead_action_notes(created_at DESC);