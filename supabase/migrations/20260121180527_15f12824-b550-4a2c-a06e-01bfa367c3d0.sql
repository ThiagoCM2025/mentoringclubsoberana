-- Create enum for task priority
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create admin_tasks table
CREATE TABLE public.admin_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  related_student_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  reminder_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can access tasks
CREATE POLICY "Admins can view all tasks"
ON public.admin_tasks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create tasks"
ON public.admin_tasks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tasks"
ON public.admin_tasks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tasks"
ON public.admin_tasks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_admin_tasks_updated_at
BEFORE UPDATE ON public.admin_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_admin_tasks_assigned_to ON public.admin_tasks(assigned_to);
CREATE INDEX idx_admin_tasks_due_date ON public.admin_tasks(due_date);
CREATE INDEX idx_admin_tasks_status ON public.admin_tasks(status);
CREATE INDEX idx_admin_tasks_related_lead ON public.admin_tasks(related_lead_id) WHERE related_lead_id IS NOT NULL;

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_tasks;