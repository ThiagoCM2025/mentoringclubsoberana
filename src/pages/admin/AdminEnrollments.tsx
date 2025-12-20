import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, UserCheck } from "lucide-react";
interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  payment_source: string | null;
  profiles: {
    full_name: string | null;
  } | null;
  courses: {
    title: string;
  } | null;
}
interface Course {
  id: string;
  title: string;
}
interface Profile {
  user_id: string;
  full_name: string | null;
}
const AdminEnrollments = () => {
  const {
    toast
  } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({
    userId: "",
    courseId: ""
  });
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    // Fetch enrollments
    const {
      data: enrollmentsData
    } = await supabase.from("enrollments").select(`
        id,
        user_id,
        course_id,
        enrolled_at,
        payment_source,
        profiles!enrollments_user_id_fkey (full_name),
        courses (title)
      `).order("enrolled_at", {
      ascending: false
    });

    // Note: The foreign key might not work directly, so we'll fetch separately
    const {
      data: enrollmentsRaw
    } = await supabase.from("enrollments").select("*").order("enrolled_at", {
      ascending: false
    });
    if (enrollmentsRaw) {
      // Fetch profiles and courses separately
      const userIds = [...new Set(enrollmentsRaw.map(e => e.user_id))];
      const courseIds = [...new Set(enrollmentsRaw.map(e => e.course_id))];
      const {
        data: profilesData
      } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const {
        data: coursesData
      } = await supabase.from("courses").select("id, title").in("id", courseIds);
      const enrichedEnrollments = enrollmentsRaw.map(e => ({
        ...e,
        profiles: profilesData?.find(p => p.user_id === e.user_id) || null,
        courses: coursesData?.find(c => c.id === e.course_id) || null
      }));
      setEnrollments(enrichedEnrollments);
    }

    // Fetch all courses for dropdown
    const {
      data: allCourses
    } = await supabase.from("courses").select("id, title").order("title");
    if (allCourses) setCourses(allCourses);

    // Fetch all profiles for dropdown
    const {
      data: allProfiles
    } = await supabase.from("profiles").select("user_id, full_name").order("full_name");
    if (allProfiles) setProfiles(allProfiles);
    setLoading(false);
  };
  const createEnrollment = async () => {
    if (!newEnrollment.userId || !newEnrollment.courseId) {
      toast({
        title: "Selecione aluno e curso",
        variant: "destructive"
      });
      return;
    }

    // Check if enrollment exists
    const {
      data: existing
    } = await supabase.from("enrollments").select("id").eq("user_id", newEnrollment.userId).eq("course_id", newEnrollment.courseId).maybeSingle();
    if (existing) {
      toast({
        title: "Aluno já está matriculado neste curso",
        variant: "destructive"
      });
      return;
    }
    const {
      error
    } = await supabase.from("enrollments").insert({
      user_id: newEnrollment.userId,
      course_id: newEnrollment.courseId,
      payment_source: "manual"
    });
    if (error) {
      toast({
        title: "Erro ao criar matrícula",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Matrícula criada com sucesso!"
      });
      setDialogOpen(false);
      setNewEnrollment({
        userId: "",
        courseId: ""
      });
      fetchData();
    }
  };
  const deleteEnrollment = async (id: string) => {
    if (!confirm("Excluir esta matrícula?")) return;
    const {
      error
    } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erro ao excluir",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Matrícula excluída"
      });
      fetchData();
    }
  };
  const filteredEnrollments = enrollments.filter(e => e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || e.courses?.title?.toLowerCase().includes(search.toLowerCase()));
  return <AdminLayout>
      <div className="p-6 lg:p-8 admin-area">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Matrículas
            </h1>
            <p className="text-muted-foreground">
              Gerencie as matrículas dos alunos
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-secondary hover:bg-secondary/90 text-black btn-glow-gold">
            <Plus className="w-4 h-4 mr-2" />
            Nova Matrícula
          </Button>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar matrículas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground" />
        </div>

        {/* Table */}
        <div className="admin-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-foreground">Aluno</TableHead>
                <TableHead className="text-foreground">Curso</TableHead>
                <TableHead className="text-foreground">Origem</TableHead>
                <TableHead className="text-foreground">Data</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow> : filteredEnrollments.length === 0 ? <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma matrícula encontrada</p>
                  </TableCell>
                </TableRow> : filteredEnrollments.map(enrollment => <TableRow key={enrollment.id} className="border-secondary/10">
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {enrollment.profiles?.full_name || "Sem nome"}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{enrollment.courses?.title || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${enrollment.payment_source === "manual" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                        {enrollment.payment_source === "manual" ? "Manual" : enrollment.payment_source || "Automático"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteEnrollment(enrollment.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>)}
            </TableBody>
          </Table>
        </div>

        {/* New Enrollment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Matrícula</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Aluno *</Label>
                <Select value={newEnrollment.userId} onValueChange={value => setNewEnrollment({
                ...newEnrollment,
                userId: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.full_name || profile.user_id}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Curso *</Label>
                <Select value={newEnrollment.courseId} onValueChange={value => setNewEnrollment({
                ...newEnrollment,
                courseId: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createEnrollment} className="bg-primary hover:bg-primary/90">
                  Criar Matrícula
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>;
};
export default AdminEnrollments;