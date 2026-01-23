import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, User, Target, GraduationCap, Clock, Users, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Admin, AdminTask, CreateTaskInput, TaskPriority } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admins: Admin[];
  currentUserId?: string;
  onSubmit: (input: CreateTaskInput) => Promise<unknown>;
  onUpdate?: (id: string, updates: Partial<AdminTask>) => Promise<void>;
  mode?: "create" | "edit";
  task?: AdminTask;
  defaultLeadId?: string;
  defaultLeadName?: string;
  defaultStudentId?: string;
  defaultStudentName?: string;
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Baixa", color: "text-muted-foreground" },
  { value: "medium", label: "Média", color: "text-blue-500" },
  { value: "high", label: "Alta", color: "text-orange-500" },
  { value: "urgent", label: "Urgente", color: "text-destructive" },
];

const reminderOptions = [
  { value: "0", label: "Sem lembrete" },
  { value: "15", label: "15 minutos antes" },
  { value: "30", label: "30 minutos antes" },
  { value: "60", label: "1 hora antes" },
  { value: "1440", label: "1 dia antes" },
];

// Multi-select component for admins
function MultiAdminSelect({
  admins,
  selected,
  onChange,
  currentUserId,
}: {
  admins: Admin[];
  selected: string[];
  onChange: (ids: string[]) => void;
  currentUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  const allSelected = admins.length > 0 && selected.length === admins.length;
  const someSelected = selected.length > 0 && selected.length < admins.length;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(admins.map(a => a.user_id));
    }
  };

  const toggleOne = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return "Selecione um ou mais admins";
    if (allSelected) return `Todos (${admins.length})`;
    if (selected.length === 1) {
      const admin = admins.find(a => a.user_id === selected[0]);
      return admin?.full_name || "1 pessoa selecionada";
    }
    return `${selected.length} pessoas selecionadas`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            {selected.length > 1 || allSelected ? (
              <Users className="h-4 w-4 shrink-0" />
            ) : (
              <User className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="max-h-64 overflow-auto">
          {/* Select All Option */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer"
            onClick={toggleAll}
          >
            <Checkbox
              checked={allSelected}
              className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
            />
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">Todos os Admins ({admins.length})</span>
          </div>
          
          <Separator />
          
          {/* Individual Admins */}
          {admins.map((admin) => (
            <div
              key={admin.user_id}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer"
              onClick={() => toggleOne(admin.user_id)}
            >
              <Checkbox checked={selected.includes(admin.user_id)} />
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {admin.full_name}
                {admin.user_id === currentUserId && (
                  <span className="text-muted-foreground ml-1">(Você)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TaskDialog({
  open,
  onOpenChange,
  admins,
  currentUserId,
  onSubmit,
  onUpdate,
  mode = "create",
  task,
  defaultLeadId,
  defaultLeadName,
  defaultStudentId,
  defaultStudentName,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // For create mode: array of selected admins; for edit mode: single admin
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [assignedTo, setAssignedTo] = useState(""); // For edit mode only
  const [dueDate, setDueDate] = useState<Date>();
  const [dueTime, setDueTime] = useState("12:00");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [leadId, setLeadId] = useState(defaultLeadId || "");
  const [studentId, setStudentId] = useState(defaultStudentId || "");
  const [leadSearch, setLeadSearch] = useState(defaultLeadName || "");
  const [studentSearch, setStudentSearch] = useState(defaultStudentName || "");
  const [leadResults, setLeadResults] = useState<Array<{ id: string; full_name: string }>>([]);
  const [studentResults, setStudentResults] = useState<Array<{ user_id: string; full_name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && task) {
      // Edit mode: fill with task data
      setTitle(task.title);
      setDescription(task.description || "");
      setAssignedTo(task.assigned_to);
      setSelectedAdmins([task.assigned_to]);
      const taskDate = new Date(task.due_date);
      setDueDate(taskDate);
      setDueTime(format(taskDate, "HH:mm"));
      setPriority(task.priority);
      setReminderMinutes("0"); // Reset reminder for edit
      setLeadId(task.related_lead_id || "");
      setStudentId(task.related_student_id || "");
      setLeadSearch(task.lead?.full_name || "");
      setStudentSearch(task.student?.full_name || "");
    } else {
      // Create mode: reset form or use defaults
      resetForm();
      if (currentUserId) {
        setSelectedAdmins([currentUserId]);
        setAssignedTo(currentUserId);
      }
      if (defaultLeadId) {
        setLeadId(defaultLeadId);
        setLeadSearch(defaultLeadName || "");
      }
      if (defaultStudentId) {
        setStudentId(defaultStudentId);
        setStudentSearch(defaultStudentName || "");
      }
    }
  }, [open, mode, task, currentUserId, defaultLeadId, defaultLeadName, defaultStudentId, defaultStudentName]);

  // Search leads
  useEffect(() => {
    if (leadSearch.length < 2) {
      setLeadResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, full_name")
        .ilike("full_name", `%${leadSearch}%`)
        .limit(5);
      setLeadResults(data || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [leadSearch]);

  // Search students
  useEffect(() => {
    if (studentSearch.length < 2) {
      setStudentResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .ilike("full_name", `%${studentSearch}%`)
        .limit(5);
      setStudentResults(data || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearch]);

  const handleSubmit = async () => {
    const hasAssignee = mode === "edit" ? !!assignedTo : selectedAdmins.length > 0;
    if (!title.trim() || !dueDate || !hasAssignee) return;

    setSubmitting(true);

    // Combine date and time
    const [hours, minutes] = dueTime.split(":").map(Number);
    const dueDateWithTime = new Date(dueDate);
    dueDateWithTime.setHours(hours, minutes, 0, 0);

    if (mode === "edit" && task && onUpdate) {
      // Update existing task (single assignee)
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: assignedTo,
        due_date: dueDateWithTime.toISOString(),
        priority,
        related_lead_id: leadId || null,
        related_student_id: studentId || null,
      });
    } else {
      // Create new task(s) - one for each selected admin
      let reminderAt: string | undefined;
      if (reminderMinutes !== "0") {
        const reminderDate = new Date(dueDateWithTime);
        reminderDate.setMinutes(reminderDate.getMinutes() - parseInt(reminderMinutes));
        reminderAt = reminderDate.toISOString();
      }

      const tasksToCreate = selectedAdmins.map(adminId => ({
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to: adminId,
        due_date: dueDateWithTime.toISOString(),
        priority,
        related_lead_id: leadId || undefined,
        related_student_id: studentId || undefined,
        reminder_at: reminderAt,
      }));

      // Create all tasks
      let successCount = 0;
      for (const input of tasksToCreate) {
        try {
          await onSubmit(input);
          successCount++;
        } catch (error) {
          console.error("Error creating task:", error);
        }
      }

      // Show success message
      if (successCount > 1) {
        toast.success(`${successCount} tarefas criadas com sucesso!`);
      }
    }

    setSubmitting(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedAdmins(currentUserId ? [currentUserId] : []);
    setAssignedTo(currentUserId || "");
    setDueDate(undefined);
    setDueTime("12:00");
    setPriority("medium");
    setReminderMinutes("0");
    setLeadId("");
    setStudentId("");
    setLeadSearch("");
    setStudentSearch("");
  };

  const isEdit = mode === "edit";
  const hasValidAssignee = isEdit ? !!assignedTo : selectedAdmins.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle>{isEdit ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Ligar para cliente"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Assigned To - Different UI for create vs edit */}
          <div className="space-y-2">
            <Label>Atribuir para *</Label>
            {isEdit ? (
              // Edit mode: single select
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um admin" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.user_id} value={admin.user_id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {admin.full_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // Create mode: multi-select with checkboxes
              <MultiAdminSelect
                admins={admins}
                selected={selectedAdmins}
                onChange={setSelectedAdmins}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Priority and Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lembrete</Label>
              <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Related Lead */}
          <div className="space-y-2">
            <Label>Vincular a Lead (opcional)</Label>
            <div className="relative">
              <Input
                placeholder="Buscar lead pelo nome..."
                value={leadSearch}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  if (!e.target.value) setLeadId(null);
                }}
              />
              {leadResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {leadResults.map((lead) => (
                    <button
                      key={lead.id}
                      className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                      onClick={() => {
                        setLeadId(lead.id);
                        setLeadSearch(lead.full_name);
                        setLeadResults([]);
                      }}
                    >
                      {lead.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Student */}
          <div className="space-y-2">
            <Label>Vincular a Aluna (opcional)</Label>
            <div className="relative">
              <Input
                placeholder="Buscar aluna pelo nome..."
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  if (!e.target.value) setStudentId(null);
                }}
              />
              {studentResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {studentResults.map((student) => (
                    <button
                      key={student.user_id}
                      className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                      onClick={() => {
                        setStudentId(student.user_id);
                        setStudentSearch(student.full_name);
                        setStudentResults([]);
                      }}
                    >
                      {student.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Fixed footer */}
        <div className="flex-shrink-0 border-t p-6 pt-4 flex justify-end gap-2 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !dueDate || !hasValidAssignee || submitting}
          >
            {submitting 
              ? (isEdit ? "Salvando..." : "Criando...") 
              : (isEdit 
                  ? "Salvar Alterações" 
                  : selectedAdmins.length > 1 
                    ? `Criar ${selectedAdmins.length} Tarefas`
                    : "Criar Tarefa"
                )
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export for backward compatibility
export { TaskDialog as NewTaskDialog };
