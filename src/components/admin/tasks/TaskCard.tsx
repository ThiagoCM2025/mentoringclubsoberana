import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Clock, 
  User, 
  Target, 
  GraduationCap, 
  Check, 
  MoreVertical,
  Trash2,
  Edit,
  Play,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdminTask, TaskPriority, TaskStatus } from "@/hooks/useTasks";

interface TaskCardProps {
  task: AdminTask;
  currentUserId?: string;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit?: (task: AdminTask) => void;
  onDelete: (id: string) => void;
  onViewLead?: (leadId: string) => void;
  onViewStudent?: (studentId: string) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  medium: { label: "Média", className: "bg-blue-500/10 text-blue-500" },
  high: { label: "Alta", className: "bg-orange-500/10 text-orange-500" },
  urgent: { label: "Urgente", className: "bg-destructive/10 text-destructive" },
};

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-600" },
  in_progress: { label: "Em andamento", className: "bg-blue-500/10 text-blue-500" },
  completed: { label: "Concluída", className: "bg-green-500/10 text-green-500" },
  cancelled: { label: "Cancelada", className: "bg-muted text-muted-foreground" },
};

export function TaskCard({
  task,
  currentUserId,
  onStatusChange,
  onEdit,
  onDelete,
  onViewLead,
  onViewStudent,
}: TaskCardProps) {
  const dueDate = new Date(task.due_date);
  const isOverdue = isPast(dueDate) && task.status !== "completed" && task.status !== "cancelled";
  const isCompleted = task.status === "completed";
  const isCancelled = task.status === "cancelled";

  const formatDueDate = () => {
    if (isToday(dueDate)) return `Hoje às ${format(dueDate, "HH:mm")}`;
    if (isTomorrow(dueDate)) return `Amanhã às ${format(dueDate, "HH:mm")}`;
    return format(dueDate, "dd MMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all hover:shadow-md",
        isCompleted && "opacity-60 bg-muted/30",
        isCancelled && "opacity-40",
        isOverdue && !isCompleted && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox + Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Completion button */}
          <button
            onClick={() => onStatusChange(task.id, isCompleted ? "pending" : "completed")}
            className={cn(
              "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              isCompleted
                ? "bg-green-500 border-green-500 text-white"
                : "border-muted-foreground/50 hover:border-primary"
            )}
          >
            {isCompleted && <Check className="h-3 w-3" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={cn("font-medium truncate", isCompleted && "line-through")}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {task.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Due date */}
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                )}
              >
                <Clock className="h-3 w-3" />
                {formatDueDate()}
                {isOverdue && " (atrasada)"}
              </div>

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {task.assignee.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {task.assigned_to === currentUserId ? "Você" : task.assignee.full_name}
                  </span>
                </div>
              )}

              {/* Related lead */}
              {task.lead && (
                <button
                  onClick={() => onViewLead?.(task.related_lead_id!)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Target className="h-3 w-3" />
                  {task.lead.full_name}
                </button>
              )}

              {/* Related student */}
              {task.student && (
                <button
                  onClick={() => onViewStudent?.(task.related_student_id!)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <GraduationCap className="h-3 w-3" />
                  {task.student.full_name}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Badges + Actions */}
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="flex flex-col gap-1 items-end">
            <Badge className={cn("text-xs", priorityConfig[task.priority].className)} variant="outline">
              {priorityConfig[task.priority].label}
            </Badge>
            <Badge className={cn("text-xs", statusConfig[task.status].className)} variant="outline">
              {statusConfig[task.status].label}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status === "pending" && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "in_progress")}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </DropdownMenuItem>
              )}
              {task.status === "in_progress" && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "completed")}>
                  <Check className="h-4 w-4 mr-2" />
                  Concluir
                </DropdownMenuItem>
              )}
              {task.status !== "cancelled" && task.status !== "completed" && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "cancelled")}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
