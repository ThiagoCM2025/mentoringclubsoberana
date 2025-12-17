-- Add tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS messages_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nurturing_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nurturing_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;

-- Create function to update lead message count when communication is logged
CREATE OR REPLACE FUNCTION public.update_lead_message_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if recipient is a lead
  IF NEW.recipient_type = 'lead' THEN
    UPDATE public.leads 
    SET 
      messages_sent = COALESCE(messages_sent, 0) + 1,
      last_contact_at = NOW(),
      nurturing_step = LEAST(COALESCE(nurturing_step, 0) + 1, 5),
      nurturing_active = true,
      updated_at = NOW()
    WHERE id = NEW.recipient_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update counts on communication insert
DROP TRIGGER IF EXISTS on_communication_insert ON public.communication_history;
CREATE TRIGGER on_communication_insert
AFTER INSERT ON public.communication_history
FOR EACH ROW EXECUTE FUNCTION public.update_lead_message_count();