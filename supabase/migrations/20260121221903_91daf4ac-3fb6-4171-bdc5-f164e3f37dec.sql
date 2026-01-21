-- Create import_lists table for tracking named import batches
CREATE TABLE public.import_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  batch_id UUID UNIQUE NOT NULL,
  source_filter TEXT NOT NULL,
  lead_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.import_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage import lists
CREATE POLICY "Admins can manage import_lists"
ON public.import_lists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add index for faster lookups
CREATE INDEX idx_import_lists_batch_id ON public.import_lists(batch_id);
CREATE INDEX idx_import_lists_created_at ON public.import_lists(created_at DESC);