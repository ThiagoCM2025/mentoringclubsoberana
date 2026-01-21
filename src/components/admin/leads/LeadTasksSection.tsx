import { useState, useEffect } from "react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string;
  assigned_to: string;
  assigned_name?: string;
}

interface LeadTasksSectionProps {
  leadId: string;
  leadName: string;
  onCreateTask: () => void;
}

const priorityConfig = {
  low: { label: "Baixa", class: "bg-muted text-muted-foreground" },
  medium: { label: "Média", class: "bg-blue-500/10 text-blue-500" },
  high: { label: "Alta", class: "bg-orange-500/10 text-orange-500" },
  urgent: { label: "Urgente", class: "bg-destructive/10 text-destructive" },
};

const statusConfig = {
  pending: { label: "Pendente", icon: Circle, class: "text-muted-foreground" },
  in_progress: { label: "Em andamento", icon: Clock, class: "text-blue-500" },
  completed: { label: "Concluída", icon: CheckCircle2, class: "text-green-500" },
  cancelled: { label: "Cancelada", icon: AlertCircle, class: "text-muted-foreground" },
};

export function LeadTasksSection({ leadId, leadName, onCreateTask }: LeadTasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const { data: tasksData, error } = await supabase
          .from("admin_tasks")
          .select("*")
          .eq("related_lead_id", leadId)
          .order("due_date", { ascending: true });

        if (error) throw error;

        if (tasksData && tasksData.length > 0) {
          // Fetch assigned admin names
          const adminIds = [...new Set(tasksData.map(t => t.assigned_to))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", adminIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

          setTasks(tasksData.map(task => ({
            ...task,
            assigned_name: profileMap.get(task.assigned_to) || "Admin"
          })));
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [leadId]);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    
    try {
      const { error } = await supabase
        .from("admin_tasks")
        .update({ 
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null
        })
        .eq("id", task.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: newStatus }
          : t
      ));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Tarefas Vinculadas
        </h4>
        <Button size="sm" variant="outline" onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Tarefa
        </Button>
      </div>

      <ScrollArea className="h-[250px]">
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Carregando tarefas...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Nenhuma tarefa vinculada
              <p className="text-xs mt-1">Clique em "Nova Tarefa" para criar</p>
            </div>
          ) : (
            <>
              {/* Pending tasks */}
              {pendingTasks.length > 0 && (
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggle={() => toggleTaskStatus(task)} 
                    />
                  ))}
                </div>
              )}

              {/* Completed tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-muted-foreground font-medium">
                    Concluídas ({completedTasks.length})
                  </p>
                  {completedTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggle={() => toggleTaskStatus(task)} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const StatusIcon = statusConfig[task.status].icon;
  const isOverdue = isPast(new Date(task.due_date)) && task.status !== "completed";
  const isDueToday = isToday(new Date(task.due_date));
  const isCompleted = task.status === "completed";

  return (
    <div 
      className={cn(
        "p-3 border rounded-lg transition-all",
        isCompleted && "opacity-60 bg-muted/30",
        isOverdue && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 shrink-0 transition-colors",
            statusConfig[task.status].class,
            !isCompleted && "hover:text-primary"
          )}
        >
          <StatusIcon className="h-5 w-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-sm font-medium",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </p>
            <Badge 
              variant="secondary" 
              className={cn("text-xs shrink-0", priorityConfig[task.priority].class)}
            >
              {priorityConfig[task.priority].label}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className={cn(
              "flex items-center gap-1",
              isOverdue && "text-destructive font-medium",
              isDueToday && !isOverdue && "text-orange-500 font-medium"
            )}>
              <Clock className="h-3 w-3" />
              {isOverdue ? "Atrasada: " : isDueToday ? "Hoje: " : ""}
              {format(new Date(task.due_date), "dd/MM HH:mm", { locale: ptBR })}
            </span>
            
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assigned_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
