import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye,
  EyeOff,
  BookOpen
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  price: number | null;
  created_at: string;
}

const AdminCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCourses(data);
    setLoading(false);
  };

  const togglePublish = async (course: Course) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      toast({ title: course.is_published ? "Curso despublicado" : "Curso publicado!" });
      fetchCourses();
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Curso excluído" });
      fetchCourses();
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-3 lg:p-6 admin-area">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
        >
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground title-premium mb-1">
              Cursos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todos os cursos da plataforma
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/courses/new")}
            className="h-8 text-sm gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground btn-glow-gold"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Curso
          </Button>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum curso encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {course.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          course.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                        }`}
                      >
                        {course.is_published ? "Publicado" : "Rascunho"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.price
                        ? `R$ ${course.price.toFixed(2)}`
                        : "Gratuito"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(course.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/courses/${course.id}`)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(course)}>
                            {course.is_published ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteCourse(course.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default AdminCourses;