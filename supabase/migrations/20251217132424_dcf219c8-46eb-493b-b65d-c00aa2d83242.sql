-- Create student_diagnostics table
CREATE TABLE public.student_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Professional data
  years_practicing TEXT,
  practice_area TEXT,
  practice_area_other TEXT,
  has_office BOOLEAN,
  office_size TEXT,
  
  -- Financial data
  monthly_revenue TEXT,
  revenue_goal TEXT,
  
  -- Challenges and goals
  main_challenges TEXT[],
  main_goals TEXT[],
  
  -- Knowledge
  marketing_knowledge TEXT,
  digital_presence TEXT,
  
  -- Referral
  referral_source TEXT,
  
  -- Availability
  weekly_study_hours TEXT,
  
  -- Metadata
  completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_diagnostics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own diagnostic" ON public.student_diagnostics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic" ON public.student_diagnostics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostic" ON public.student_diagnostics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all diagnostics" ON public.student_diagnostics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_student_diagnostics_updated_at
  BEFORE UPDATE ON public.student_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();