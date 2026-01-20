-- Drop the overly permissive policy and create a proper one
DROP POLICY IF EXISTS "Service role can manage typing status" ON public.whatsapp_typing_status;

-- Create proper admin-only policy for all operations
CREATE POLICY "Admins can manage typing status"
  ON public.whatsapp_typing_status FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));