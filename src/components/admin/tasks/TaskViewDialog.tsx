import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Clock, 
  User, 
  Target, 
  GraduationCap, 
  Calendar,
  UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdminTask, TaskPriority, TaskStatus } from "@/hooks/useTasks";

interface TaskViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: AdminTask | null;
  currentUserId?: string;
  onEdit?: (task: AdminTask) => void;
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

export function TaskViewDialog({
  open,
  onOpenChange,
  task,
  currentUserId,
  onEdit,
  onViewLead,
  onViewStudent,
}: TaskViewDialogProps) {
  if (!task) return null;

  const dueDate = new Date(task.due_date);
  const createdAt = new Date(task.created_at);

  const handleEdit = () => {
    onOpenChange(false);
    onEdit?.(task);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl pr-6">{task.title}</DialogTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className={cn("text-xs", priorityConfig[task.priority].className)} variant="outline">
              {priorityConfig[task.priority].label}
            </Badge>
            <Badge className={cn("text-xs", statusConfig[task.status].className)} variant="outline">
              {statusConfig[task.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            {/* Due date */}
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">Prazo: </span>
                <span className="font-medium">
                  {format(dueDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Responsável: </span>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {task.assignee.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {task.assigned_to === currentUserId ? "Você" : task.assignee.full_name}
                  </span>
                </div>
              </div>
            )}

            {/* Creator */}
            {task.creator && (
              <div className="flex items-center gap-3 text-sm">
                <UserPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Criado por: </span>
                  <span className="font-medium">{task.creator.full_name}</span>
                </div>
              </div>
            )}

            {/* Related lead */}
            {task.lead && (
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground">Lead: </span>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      onViewLead?.(task.related_lead_id!);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    {task.lead.full_name}
                  </button>
                </div>
              </div>
            )}

            {/* Related student */}
            {task.student && (
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground">Aluna: </span>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      onViewStudent?.(task.related_student_id!);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    {task.student.full_name}
                  </button>
                </div>
              </div>
            )}

            {/* Created at */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">Criada em: </span>
                <span>{format(createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            </div>

            {/* Completed at */}
            {task.completed_at && (
              <div className="flex items-center gap-3 text-sm text-green-600">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <div>
                  <span>Concluída em: </span>
                  <span className="font-medium">
                    {format(new Date(task.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={handleEdit}>
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
