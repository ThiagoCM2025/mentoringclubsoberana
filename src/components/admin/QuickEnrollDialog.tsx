import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Student {
  user_id: string;
  full_name: string | null;
}

interface Course {
  id: string;
  title: string;
}

interface QuickEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickEnrollDialog = ({ open, onOpenChange }: QuickEnrollDialogProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch students (non-admin users)
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentRoles) {
        const studentIds = studentRoles.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", studentIds)
          .order("full_name");

        setStudents(profiles || []);
      }

      // Fetch published courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .eq("is_published", true)
        .order("title");

      setCourses(coursesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error("Selecione a aluna e o curso");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check existing enrollment
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", selectedStudent)
        .eq("course_id", selectedCourse)
        .single();

      if (existing) {
        toast.error("Esta aluna já está matriculada neste curso");
        return;
      }

      // Create enrollment
      const { error } = await supabase.from("enrollments").insert({
        user_id: selectedStudent,
        course_id: selectedCourse,
      });

      if (error) throw error;

      toast.success("Matrícula realizada com sucesso!");
      onOpenChange(false);
      setSelectedStudent("");
      setSelectedCourse("");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Erro ao realizar matrícula");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Matricular Aluna</DialogTitle>
          <DialogDescription>
            Selecione a aluna e o curso para realizar a matrícula.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Aluna</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a aluna" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.full_name || "Sem nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEnroll}
                disabled={isSubmitting || !selectedStudent || !selectedCourse}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Matricular
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
