import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
}

interface StudyReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Seg" },
  { key: "tuesday", label: "Ter" },
  { key: "wednesday", label: "Qua" },
  { key: "thursday", label: "Qui" },
  { key: "friday", label: "Sex" },
  { key: "saturday", label: "Sáb" },
  { key: "sunday", label: "Dom" },
];

const StudyReminderDialog = ({ open, onOpenChange }: StudyReminderDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Form state
  const [title, setTitle] = useState("Hora de estudar!");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState("19:00");

  useEffect(() => {
    if (open && user) {
      fetchCourses();
      resetForm();
    }
  }, [open, user]);

  const fetchCourses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        courses (
          id,
          title
        )
      `)
      .eq("user_id", user.id);

    if (data) {
      const enrolledCourses = data
        .map((e: any) => e.courses)
        .filter(Boolean) as Course[];
      setCourses(enrolledCourses);
    }
  };

  const resetForm = () => {
    setStep(1);
    setTitle("Hora de estudar!");
    setSelectedCourses([]);
    setSelectedDays([]);
    setReminderTime("19:00");
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleCreate = async () => {
    if (!user || selectedDays.length === 0) return;

    setLoading(true);

    const { error } = await supabase
      .from("study_reminders")
      .insert({
        user_id: user.id,
        title,
        reminder_days: selectedDays,
        reminder_time: reminderTime,
        course_ids: selectedCourses.length > 0 ? selectedCourses : null,
        is_enabled: true,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o lembrete.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lembrete criado! ⏰",
        description: "Você receberá notificações nos horários definidos.",
      });
      onOpenChange(false);
    }

    setLoading(false);
  };

  const canProceed = step === 1 ? title.trim().length > 0 : selectedDays.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Criar um lembrete de estudo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              step === 1 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            )}>
              1
            </div>
            <div className="w-8 h-0.5 bg-muted" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              step === 2 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Hora de estudar!"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Selecione os cursos para estudar</Label>
                  <span className="text-xs text-muted-foreground">Opcional</span>
                </div>
                
                {courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Você ainda não está matriculado em nenhum curso.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {courses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={() => toggleCourse(course.id)}
                        />
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">{course.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Dias da semana</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedDays.includes(day.key)
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {step === 2 ? (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="bg-secondary hover:bg-secondary/90"
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canProceed || loading}
              className="bg-secondary hover:bg-secondary/90"
            >
              {loading ? "Criando..." : "Criar Lembrete"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyReminderDialog;
