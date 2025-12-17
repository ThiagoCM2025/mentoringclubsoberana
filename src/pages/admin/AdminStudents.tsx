import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BulkNotificationDialog } from "@/components/admin/BulkNotificationDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, Users, UserPlus, Loader2, Eye, EyeOff, GraduationCap, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  enrollment_count?: number;
  diagnostic_completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  is_published: boolean;
}

const AdminStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    const adminUserIds = adminRoles?.map(r => r.user_id) || [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select(`id, user_id, full_name, phone, created_at`)
      .order("created_at", { ascending: false });

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id");

    const { data: diagnostics } = await supabase
      .from("student_diagnostics")
      .select("user_id, completed");

    const enrollmentCounts: Record<string, number> = {};
    enrollments?.forEach(e => {
      enrollmentCounts[e.user_id] = (enrollmentCounts[e.user_id] || 0) + 1;
    });

    const diagnosticStatus: Record<string, boolean> = {};
    diagnostics?.forEach(d => {
      diagnosticStatus[d.user_id] = d.completed || false;
    });

    if (profiles) {
      const studentsOnly = profiles
        .filter(p => !adminUserIds.includes(p.user_id))
        .map(p => ({ 
          ...p, 
          enrollment_count: enrollmentCounts[p.user_id] || 0,
          diagnostic_completed: diagnosticStatus[p.user_id] || false
        }));
      setStudents(studentsOnly);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, is_published")
      .order("title");
    
    if (data) setCourses(data);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('create-student', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar aluna');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({ title: "Sucesso!", description: "Aluna cadastrada com sucesso." });
      setIsDialogOpen(false);
      setFormData({ full_name: "", email: "", password: "", phone: "" });
      fetchStudents();
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: error.message || "Não foi possível cadastrar a aluna.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent || !selectedCourseId) return;
    
    setIsSubmitting(true);

    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", selectedStudent.user_id)
        .eq("course_id", selectedCourseId)
        .maybeSingle();

      if (existing) {
        toast({ 
          title: "Aviso", 
          description: "Esta aluna já está matriculada neste curso.", 
          variant: "destructive" 
        });
        return;
      }

      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: selectedStudent.user_id,
          course_id: selectedCourseId,
          payment_source: "admin_manual",
        });

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Aluna matriculada com sucesso." });
      setIsEnrollDialogOpen(false);
      setSelectedStudent(null);
      setSelectedCourseId("");
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: error.message || "Não foi possível matricular a aluna.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEnrollDialog = (student: Student) => {
    setSelectedStudent(student);
    setSelectedCourseId("");
    setIsEnrollDialogOpen(true);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 admin-area">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-serif font-bold text-cream title-premium mb-2">
              Alunos
            </h1>
            <p className="text-cream/80">
              Gerencie todos os alunos cadastrados na plataforma
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BulkNotificationDialog />
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-black btn-glow-gold">
                  <UserPlus className="w-4 h-4" />
                  Nova Aluna
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Aluna</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova conta de aluna.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Nome da aluna"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha inicial *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar Aluna"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </motion.div>

        {/* Enroll Dialog */}
        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Matricular Aluna</DialogTitle>
              <DialogDescription>
                Matriculando: <strong>{selectedStudent?.full_name || "Aluna"}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Selecione o curso</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um curso..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} {!course.is_published && "(Rascunho)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEnrollDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleEnrollStudent} 
                  disabled={isSubmitting || !selectedCourseId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Matriculando...
                    </>
                  ) : (
                    "Confirmar Matrícula"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <Input
            placeholder="Buscar alunos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-secondary/30 text-cream placeholder:text-cream/40"
          />
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <Table>
            <TableHeader>
              <TableRow className="border-secondary/20 hover:bg-zinc-800/50">
                <TableHead>Aluno</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cursos</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-cream/70">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="w-12 h-12 text-cream/40 mx-auto mb-3" />
                    <p className="text-cream/70">Nenhum aluno encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="border-secondary/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center">
                          <span className="text-black font-semibold">
                            {student.full_name?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-cream">{student.full_name || "Sem nome"}</p>
                          <p className="text-xs text-cream/60">{student.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-cream/80">{student.phone || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.enrollment_count ? 'bg-secondary/20 text-secondary' : 'bg-zinc-800 text-cream/60'
                      }`}>
                        {student.enrollment_count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.diagnostic_completed ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-cream/70">
                      {new Date(student.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/students/${student.user_id}`)}
                          className="gap-2 text-cream/80 hover:text-cream hover:bg-zinc-800"
                        >
                          <User className="w-4 h-4" />
                          Ver Perfil
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEnrollDialog(student)}
                          className="gap-2 border-secondary/30 text-cream hover:bg-secondary/10 hover:border-secondary/50"
                        >
                          <GraduationCap className="w-4 h-4" />
                          Matricular
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;