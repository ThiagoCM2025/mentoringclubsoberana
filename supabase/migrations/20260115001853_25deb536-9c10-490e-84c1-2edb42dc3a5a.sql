-- Step 1: Add new values to lead_status enum
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'qualified';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'meeting';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'discarded';

-- Step 2: Add qualification fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pain_points TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mentoring_goals TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS practice_area TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS product_interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS investment_range TEXT;

-- Step 3: Add meeting fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_scheduled_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_status TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_notes TEXT;

-- Step 4: Add discard fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS discard_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS discard_notes TEXT;

-- Step 5: Add student link field
ALTER TABLE leads ADD COLUMN IF NOT EXISTS student_user_id UUID REFERENCES auth.users(id);

-- Step 6: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_meeting_scheduled_at ON leads(meeting_scheduled_at) WHERE meeting_scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_student_user_id ON leads(student_user_id) WHERE student_user_id IS NOT NULL;