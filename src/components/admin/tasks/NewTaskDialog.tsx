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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, User, Target, GraduationCap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Admin, CreateTaskInput, TaskPriority } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admins: Admin[];
  currentUserId?: string;
  onSubmit: (input: CreateTaskInput) => Promise<unknown>;
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

export function NewTaskDialog({
  open,
  onOpenChange,
  admins,
  currentUserId,
  onSubmit,
  defaultLeadId,
  defaultLeadName,
  defaultStudentId,
  defaultStudentName,
}: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentUserId || "");
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

  useEffect(() => {
    if (currentUserId && !assignedTo) {
      setAssignedTo(currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (defaultLeadId) {
      setLeadId(defaultLeadId);
      setLeadSearch(defaultLeadName || "");
    }
    if (defaultStudentId) {
      setStudentId(defaultStudentId);
      setStudentSearch(defaultStudentName || "");
    }
  }, [defaultLeadId, defaultLeadName, defaultStudentId, defaultStudentName]);

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
    if (!title.trim() || !dueDate || !assignedTo) return;

    setSubmitting(true);

    // Combine date and time
    const [hours, minutes] = dueTime.split(":").map(Number);
    const dueDateWithTime = new Date(dueDate);
    dueDateWithTime.setHours(hours, minutes, 0, 0);

    // Calculate reminder time
    let reminderAt: string | undefined;
    if (reminderMinutes !== "0") {
      const reminderDate = new Date(dueDateWithTime);
      reminderDate.setMinutes(reminderDate.getMinutes() - parseInt(reminderMinutes));
      reminderAt = reminderDate.toISOString();
    }

    const input: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      assigned_to: assignedTo,
      due_date: dueDateWithTime.toISOString(),
      priority,
      related_lead_id: leadId || undefined,
      related_student_id: studentId || undefined,
      reminder_at: reminderAt,
    };

    await onSubmit(input);
    setSubmitting(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setDueTime("12:00");
    setPriority("medium");
    setReminderMinutes("0");
    setLeadId("");
    setStudentId("");
    setLeadSearch("");
    setStudentSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          {/* Assigned To */}
          <div className="space-y-2">
            <Label>Atribuir para *</Label>
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
                      {admin.user_id === currentUserId && " (Você)"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data limite *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Priority & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={opt.color}>{opt.label}</span>
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
                  {reminderOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Link to Lead */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Vincular a Lead
            </Label>
            <div className="relative">
              <Input
                placeholder="Buscar lead pelo nome..."
                value={leadSearch}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  if (!e.target.value) setLeadId("");
                }}
              />
              {leadResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
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

          {/* Link to Student */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Vincular a Aluna
            </Label>
            <div className="relative">
              <Input
                placeholder="Buscar aluna pelo nome..."
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  if (!e.target.value) setStudentId("");
                }}
              />
              {studentResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
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

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !dueDate || !assignedTo || submitting}
          >
            {submitting ? "Criando..." : "Criar Tarefa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
