import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface AdminTask {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  related_lead_id: string | null;
  related_student_id: string | null;
  reminder_at: string | null;
  reminder_sent: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: { full_name: string; avatar_url: string | null };
  assignee?: { full_name: string; avatar_url: string | null };
  lead?: { full_name: string; email: string };
  student?: { full_name: string; avatar_url: string | null };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  related_lead_id?: string;
  related_student_id?: string;
  reminder_at?: string;
}

export interface Admin {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

export function useTasks() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_tasks")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Fetch related data
      const tasksWithRelations = await Promise.all(
        (data || []).map(async (task) => {
          const [creatorRes, assigneeRes, leadRes, studentRes] = await Promise.all([
            supabase.from("profiles").select("full_name, avatar_url").eq("user_id", task.created_by).single(),
            supabase.from("profiles").select("full_name, avatar_url").eq("user_id", task.assigned_to).single(),
            task.related_lead_id 
              ? supabase.from("leads").select("full_name, email").eq("id", task.related_lead_id).single()
              : Promise.resolve({ data: null }),
            task.related_student_id
              ? supabase.from("profiles").select("full_name, avatar_url").eq("user_id", task.related_student_id).single()
              : Promise.resolve({ data: null }),
          ]);

          return {
            ...task,
            priority: task.priority as TaskPriority,
            status: task.status as TaskStatus,
            creator: creatorRes.data || undefined,
            assignee: assigneeRes.data || undefined,
            lead: leadRes.data || undefined,
            student: studentRes.data || undefined,
          };
        })
      );

      setTasks(tasksWithRelations);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Erro ao carregar tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (error) throw error;

      const adminIds = data?.map((r) => r.user_id) || [];
      
      if (adminIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", adminIds);

        setAdmins(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const createTask = async (input: CreateTaskInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("admin_tasks")
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tarefa criada com sucesso!",
      });

      await fetchTasks();
      return data;
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Erro ao criar tarefa",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<AdminTask>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      
      // If marking as completed, set completed_at
      if (updates.status === "completed" && !updates.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("admin_tasks")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Tarefa atualizada!",
      });

      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Tarefa excluída!",
      });

      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro ao excluir tarefa",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAdmins();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("admin_tasks_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_tasks" },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Computed values
  const myTasks = tasks.filter((t) => t.assigned_to === user?.id);
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const todayTasks = tasks.filter((t) => {
    const today = new Date();
    const dueDate = new Date(t.due_date);
    return (
      dueDate.toDateString() === today.toDateString() &&
      (t.status === "pending" || t.status === "in_progress")
    );
  });
  const overdueTasks = tasks.filter((t) => {
    const now = new Date();
    const dueDate = new Date(t.due_date);
    return dueDate < now && (t.status === "pending" || t.status === "in_progress");
  });

  return {
    tasks,
    admins,
    loading,
    myTasks,
    pendingTasks,
    todayTasks,
    overdueTasks,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
