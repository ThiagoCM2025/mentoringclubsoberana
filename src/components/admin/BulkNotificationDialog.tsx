import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Loader2, Megaphone, Users, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";

interface Course {
  id: string;
  title: string;
  student_count: number;
}

export function BulkNotificationDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info"
  });

  useEffect(() => {
    if (open) {
      fetchCoursesWithStudents();
    }
  }, [open]);

  const fetchCoursesWithStudents = async () => {
    setLoading(true);
    
    // Fetch all courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .order("title");

    if (coursesData) {
      // Fetch enrollment counts for each course
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id");

      const enrollmentCounts: Record<string, number> = {};
      enrollments?.forEach(e => {
        enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
      });

      const coursesWithCounts = coursesData.map(course => ({
        ...course,
        student_count: enrollmentCounts[course.id] || 0
      }));

      setCourses(coursesWithCounts);
    }
    
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCourseId) return;

    setSending(true);

    try {
      // Get all students enrolled in the selected course
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("user_id")
        .eq("course_id", selectedCourseId);

      if (enrollmentsError) throw enrollmentsError;

      if (!enrollments || enrollments.length === 0) {
        toast.error("Nenhum aluno matriculado neste curso");
        setSending(false);
        return;
      }

      // Create notifications for all enrolled students
      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.user_id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        created_by: user.id
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) throw insertError;

      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      toast.success(`Notificação enviada para ${enrollments.length} alunos do curso "${selectedCourse?.title}"`);
      
      setOpen(false);
      setFormData({ title: "", message: "", type: "info" });
      setSelectedCourseId("");
    } catch (error: any) {
      console.error("Error sending bulk notifications:", error);
      toast.error("Erro ao enviar notificações");
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: { title: string; message: string; type: string } | null) => {
    if (template) {
      setFormData({
        title: template.title,
        message: template.message,
        type: template.type,
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Megaphone className="w-4 h-4" />
          Notificação em Massa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Notificação em Massa
          </DialogTitle>
          <DialogDescription>
            Envie uma notificação para todos os alunos matriculados em um curso específico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Selecione o Curso *</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando cursos..." : "Escolha um curso..."} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{course.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.student_count}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourse && selectedCourse.student_count > 0 && (
              <p className="text-sm text-muted-foreground">
                Esta notificação será enviada para <strong>{selectedCourse.student_count}</strong> aluno(s).
              </p>
            )}
            {selectedCourse && selectedCourse.student_count === 0 && (
              <p className="text-sm text-yellow-600">
                Este curso não possui alunos matriculados.
              </p>
            )}
          </div>

          <TemplateSelector onSelect={handleTemplateSelect} />

          <div className="space-y-2">
            <Label htmlFor="bulk-title">Título *</Label>
            <Input
              id="bulk-title"
              placeholder="Ex: Nova aula disponível!"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-message">Mensagem *</Label>
            <Textarea
              id="bulk-message"
              placeholder="Escreva sua mensagem aqui..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Notificação</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('info')}
                    <span>Informação</span>
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('success')}
                    <span>Sucesso</span>
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('warning')}
                    <span>Aviso</span>
                  </div>
                </SelectItem>
                <SelectItem value="alert">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('alert')}
                    <span>Alerta</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={sending || !selectedCourseId || (selectedCourse?.student_count === 0)}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para {selectedCourse?.student_count || 0} aluno(s)
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}