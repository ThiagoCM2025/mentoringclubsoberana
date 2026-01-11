import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye,
  EyeOff,
  BookOpen,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  price: number | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

const AdminCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [showDeleted]);

  const fetchCourses = async () => {
    setLoading(true);
    
    let query = supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    // Filtrar por status de exclusão
    if (!showDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

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

  // Soft delete - move para lixeira
  const moveToBin = async (id: string) => {
    if (!confirm("Mover este curso para a lixeira?")) return;

    const { error } = await supabase
      .from("courses")
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id 
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao mover para lixeira", variant: "destructive" });
    } else {
      toast({ 
        title: "Curso movido para lixeira",
        description: "Você pode recuperá-lo a qualquer momento."
      });
      fetchCourses();
    }
  };

  // Restaurar da lixeira
  const restoreCourse = async (id: string) => {
    const { error } = await supabase
      .from("courses")
      .update({ deleted_at: null, deleted_by: null })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao restaurar", variant: "destructive" });
    } else {
      toast({ title: "Curso restaurado com sucesso!" });
      fetchCourses();
    }
  };

  // Exclusão permanente
  const permanentlyDeleteCourse = async (id: string) => {
    if (!confirm("⚠️ ATENÇÃO: Esta ação é irreversível!\n\nExcluir permanentemente este curso?")) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir permanentemente", variant: "destructive" });
    } else {
      toast({ title: "Curso excluído permanentemente" });
      fetchCourses();
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCoursesCount = courses.filter(c => !c.deleted_at).length;
  const deletedCoursesCount = courses.filter(c => c.deleted_at).length;

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

        {/* Search and Trash Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          {/* Toggle Lixeira */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/50">
            <Switch 
              id="show-deleted" 
              checked={showDeleted} 
              onCheckedChange={setShowDeleted}
              className="data-[state=checked]:bg-destructive"
            />
            <Label 
              htmlFor="show-deleted" 
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Lixeira
              {deletedCoursesCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {deletedCoursesCount}
                </Badge>
              )}
            </Label>
          </div>
        </div>

        {/* Info banner quando mostrando lixeira */}
        {showDeleted && deletedCoursesCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              Mostrando {deletedCoursesCount} curso(s) na lixeira. Itens podem ser restaurados ou excluídos permanentemente.
            </p>
          </motion.div>
        )}

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
                    <p className="text-sm text-muted-foreground">
                      {showDeleted ? "Nenhum curso na lixeira" : "Nenhum curso encontrado"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow 
                    key={course.id}
                    className={course.deleted_at ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{course.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                        {course.deleted_at && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5 gap-1">
                            <Trash2 className="w-2.5 h-2.5" />
                            Lixeira
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.deleted_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                          Excluído
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            course.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                          }`}
                        >
                          {course.is_published ? "Publicado" : "Rascunho"}
                        </span>
                      )}
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
                          {course.deleted_at ? (
                            // Ações para itens na lixeira
                            <>
                              <DropdownMenuItem onClick={() => restoreCourse(course.id)}>
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                Restaurar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => permanentlyDeleteCourse(course.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                Excluir Permanentemente
                              </DropdownMenuItem>
                            </>
                          ) : (
                            // Ações normais
                            <>
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => moveToBin(course.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Mover para Lixeira
                              </DropdownMenuItem>
                            </>
                          )}
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
