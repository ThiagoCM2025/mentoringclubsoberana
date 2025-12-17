import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  PlayCircle,
  FileText,
  Pencil
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
  is_published: boolean;
  is_subscription: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
}

const CourseEditor = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = courseId === "new";

  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    thumbnail_url: "",
    price: null,
    is_published: false,
    is_subscription: false,
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);

  // Lesson dialog
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    if (!courseId) return;

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseData) setCourse(courseData);

    const { data: modulesData } = await supabase
      .from("modules")
      .select(`
        id,
        title,
        description,
        order_index,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          is_free
        )
      `)
      .eq("course_id", courseId)
      .order("order_index");

    if (modulesData) {
      const sorted = modulesData.map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
      }));
      setModules(sorted as Module[]);
    }

    setLoading(false);
  };

  const saveCourse = async () => {
    if (!course.title) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("courses")
          .insert({
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            price: course.price,
            is_published: course.is_published,
            is_subscription: course.is_subscription,
          })
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Curso criado com sucesso!" });
        navigate(`/admin/courses/${data.id}`);
      } else {
        const { error } = await supabase
          .from("courses")
          .update({
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            price: course.price,
            is_published: course.is_published,
            is_subscription: course.is_subscription,
          })
          .eq("id", courseId);

        if (error) throw error;
        toast({ title: "Curso atualizado!" });
      }
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveModule = async () => {
    if (!editingModule?.title || !courseId) return;

    try {
      if (editingModule.id) {
        await supabase
          .from("modules")
          .update({
            title: editingModule.title,
            description: editingModule.description,
          })
          .eq("id", editingModule.id);
      } else {
        await supabase.from("modules").insert({
          course_id: courseId,
          title: editingModule.title,
          description: editingModule.description,
          order_index: modules.length,
        });
      }
      setModuleDialogOpen(false);
      setEditingModule(null);
      fetchCourse();
      toast({ title: "Módulo salvo!" });
    } catch (error) {
      toast({ title: "Erro ao salvar módulo", variant: "destructive" });
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Excluir este módulo e todas as suas aulas?")) return;

    await supabase.from("modules").delete().eq("id", moduleId);
    fetchCourse();
    toast({ title: "Módulo excluído" });
  };

  const saveLesson = async () => {
    if (!editingLesson?.title || !lessonModuleId) return;

    try {
      if (editingLesson.id) {
        await supabase
          .from("lessons")
          .update({
            title: editingLesson.title,
            description: editingLesson.description,
            video_url: editingLesson.video_url,
            duration_minutes: editingLesson.duration_minutes,
            is_free: editingLesson.is_free,
          })
          .eq("id", editingLesson.id);
      } else {
        const module = modules.find(m => m.id === lessonModuleId);
        await supabase.from("lessons").insert({
          module_id: lessonModuleId,
          title: editingLesson.title,
          description: editingLesson.description,
          video_url: editingLesson.video_url,
          duration_minutes: editingLesson.duration_minutes,
          is_free: editingLesson.is_free || false,
          order_index: module?.lessons.length || 0,
        });
      }
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setLessonModuleId(null);
      fetchCourse();
      toast({ title: "Aula salva!" });
    } catch (error) {
      toast({ title: "Erro ao salvar aula", variant: "destructive" });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Excluir esta aula?")) return;

    await supabase.from("lessons").delete().eq("id", lessonId);
    fetchCourse();
    toast({ title: "Aula excluída" });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/courses")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {isNew ? "Novo Curso" : "Editar Curso"}
            </h1>
          </div>
          <Button onClick={saveCourse} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </motion.div>

        {/* Course Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elegant p-6 mb-6"
        >
          <h2 className="text-lg font-serif font-semibold mb-4">Informações do Curso</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={course.title || ""}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Ex: Mentoria Soberana Completa"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={course.description || ""}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Descreva o curso..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="thumbnail">URL da Thumbnail</Label>
              <Input
                id="thumbnail"
                value={course.thumbnail_url || ""}
                onChange={(e) => setCourse({ ...course, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  value={course.price || ""}
                  onChange={(e) => setCourse({ ...course, price: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={course.is_subscription || false}
                    onCheckedChange={(checked) => setCourse({ ...course, is_subscription: checked })}
                  />
                  <Label>Assinatura</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={course.is_published || false}
                    onCheckedChange={(checked) => setCourse({ ...course, is_published: checked })}
                  />
                  <Label>Publicado</Label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modules & Lessons */}
        {!isNew && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elegant p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold">Módulos e Aulas</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingModule({ title: "", description: "" });
                  setModuleDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Módulo
              </Button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum módulo ainda. Crie o primeiro!</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {modules.map((module, moduleIndex) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {moduleIndex + 1}
                        </div>
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.lessons.length} aula(s)
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingModule(module);
                            setModuleDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLessonModuleId(module.id);
                            setEditingLesson({ title: "", description: "", video_url: "", is_free: false });
                            setLessonDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nova Aula
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteModule(module.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </div>

                      {module.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">Nenhuma aula ainda</p>
                      ) : (
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                            >
                              <PlayCircle className="w-5 h-5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {moduleIndex + 1}.{lessonIndex + 1} - {lesson.title}
                                </p>
                                {lesson.duration_minutes && (
                                  <p className="text-xs text-muted-foreground">
                                    {lesson.duration_minutes} min
                                  </p>
                                )}
                              </div>
                              {lesson.is_free && (
                                <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded">
                                  Grátis
                                </span>
                              )}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setLessonModuleId(module.id);
                                    setEditingLesson(lesson);
                                    setLessonDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => deleteLesson(lesson.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </motion.div>
        )}

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingModule?.id ? "Editar Módulo" : "Novo Módulo"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={editingModule?.title || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  placeholder="Ex: Módulo 1 - Fundamentos"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingModule?.description || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  placeholder="Descreva o módulo..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveModule} className="bg-primary hover:bg-primary/90">
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLesson?.id ? "Editar Aula" : "Nova Aula"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={editingLesson?.title || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  placeholder="Ex: Introdução ao Módulo"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingLesson?.description || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  placeholder="Descreva a aula..."
                />
              </div>
              <div>
                <Label>URL do Vídeo</Label>
                <Input
                  value={editingLesson?.video_url || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={editingLesson?.duration_minutes || ""}
                    onChange={(e) => setEditingLesson({ ...editingLesson, duration_minutes: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={editingLesson?.is_free || false}
                    onCheckedChange={(checked) => setEditingLesson({ ...editingLesson, is_free: checked })}
                  />
                  <Label>Aula Gratuita</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveLesson} className="bg-primary hover:bg-primary/90">
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CourseEditor;