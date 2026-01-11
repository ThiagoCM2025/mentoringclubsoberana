import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import VideoUrlInput from "./VideoUrlInput";
import LessonMaterialsSection from "./LessonMaterialsSection";
import {
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  FileText,
  ChevronUp,
  ChevronDown,
  Copy,
  Video,
  Youtube,
  Calendar,
  FileEdit,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

interface PendingFile {
  file: File;
  title: string;
}

interface PendingLink {
  title: string;
  url: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
  lesson_type?: string | null;
  action_url?: string | null;
  action_button_text?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
  deleted_at?: string | null;
  deleted_by?: string | null;
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
  onRefresh: () => void;
  showDeleted?: boolean;
  onToggleShowDeleted?: (show: boolean) => void;
}

const ModuleManager = ({ courseId, modules, onRefresh, showDeleted = false, onToggleShowDeleted }: ModuleManagerProps) => {
  const { toast } = useToast();
  
  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  
  // Lesson dialog
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  
  // Materials for new lessons (pending until lesson is saved)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);

  // Calculate counts
  const activeModules = modules.filter(m => !m.deleted_at);
  const deletedModules = modules.filter(m => m.deleted_at);
  const activeLessons = modules.reduce((acc, m) => acc + m.lessons.filter(l => !l.deleted_at).length, 0);
  const deletedLessons = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.deleted_at).length, 0);

  const getVideoTypeIcon = (url: string | null, lessonType?: string | null) => {
    if (lessonType === 'scheduling') {
      return <Calendar className="w-4 h-4 text-secondary" />;
    }
    if (lessonType === 'text') {
      return <FileEdit className="w-4 h-4 text-purple-500" />;
    }
    if (!url) return null;
    if (url.includes("youtube") || url.includes("youtu.be")) {
      return <Youtube className="w-4 h-4 text-red-500" />;
    }
    if (url.includes("vimeo")) {
      return <Video className="w-4 h-4 text-blue-500" />;
    }
    if (url.includes("calendar.google.com") || url.includes("calendly.com")) {
      return <Calendar className="w-4 h-4 text-secondary" />;
    }
    return <Video className="w-4 h-4 text-green-500" />;
  };

  // Module operations
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
      onRefresh();
      toast({ title: "Módulo salvo!" });
    } catch (error) {
      toast({ title: "Erro ao salvar módulo", variant: "destructive" });
    }
  };

  const moveModuleToBin = async (moduleId: string) => {
    if (!confirm("Mover este módulo e suas aulas para a lixeira?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // Soft delete module
      await supabase
        .from("modules")
        .update({ deleted_at: now, deleted_by: user?.id })
        .eq("id", moduleId);

      // Soft delete all lessons
      await supabase
        .from("lessons")
        .update({ deleted_at: now, deleted_by: user?.id })
        .eq("module_id", moduleId);

      toast({ 
        title: "Módulo movido para lixeira",
        description: "Você pode restaurá-lo a qualquer momento."
      });
      onRefresh();
    } catch (error) {
      toast({ title: "Erro ao mover para lixeira", variant: "destructive" });
    }
  };

  const restoreModule = async (moduleId: string) => {
    try {
      // Restore module
      await supabase
        .from("modules")
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", moduleId);

      // Restore all lessons
      await supabase
        .from("lessons")
        .update({ deleted_at: null, deleted_by: null })
        .eq("module_id", moduleId);

      toast({ title: "Módulo restaurado com sucesso!" });
      onRefresh();
    } catch (error) {
      toast({ title: "Erro ao restaurar", variant: "destructive" });
    }
  };

  const permanentlyDeleteModule = async (moduleId: string) => {
    if (!confirm("ATENÇÃO: Esta ação é irreversível! Excluir permanentemente este módulo e todas as suas aulas?")) return;

    try {
      // Delete lessons first (foreign key)
      await supabase.from("lessons").delete().eq("module_id", moduleId);
      // Delete module
      await supabase.from("modules").delete().eq("id", moduleId);

      toast({ title: "Módulo excluído permanentemente" });
      onRefresh();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const duplicateModule = async (module: Module) => {
    try {
      // Create new module
      const { data: newModule, error } = await supabase
        .from("modules")
        .insert({
          course_id: courseId,
          title: `${module.title} (cópia)`,
          description: module.description,
          order_index: modules.length,
        })
        .select()
        .single();

      if (error || !newModule) throw error;

      // Duplicate lessons (only active ones)
      for (const lesson of module.lessons.filter(l => !l.deleted_at)) {
        await supabase.from("lessons").insert({
          module_id: newModule.id,
          title: lesson.title,
          description: lesson.description,
          video_url: lesson.video_url,
          duration_minutes: lesson.duration_minutes,
          order_index: lesson.order_index,
          is_free: lesson.is_free,
        });
      }

      onRefresh();
      toast({ title: "Módulo duplicado!" });
    } catch (error) {
      toast({ title: "Erro ao duplicar", variant: "destructive" });
    }
  };

  const moveModule = async (moduleId: string, direction: "up" | "down") => {
    const activeModulesList = modules.filter(m => !m.deleted_at);
    const currentIndex = activeModulesList.findIndex(m => m.id === moduleId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= activeModulesList.length) return;

    const otherModule = activeModulesList[newIndex];
    
    await Promise.all([
      supabase.from("modules").update({ order_index: newIndex }).eq("id", moduleId),
      supabase.from("modules").update({ order_index: currentIndex }).eq("id", otherModule.id)
    ]);

    onRefresh();
  };

  // Lesson operations
  const saveLesson = async () => {
    if (!editingLesson?.title || !lessonModuleId) return;

    try {
      // Cast lesson_type properly for the database
      const lessonType = (editingLesson.lesson_type || 'video') as 'video' | 'text' | 'action' | 'diagnostic' | 'scheduling' | 'upload';
      
      let lessonId = editingLesson.id;
      
      if (lessonId) {
        // Update existing lesson
        await supabase
          .from("lessons")
          .update({
            title: editingLesson.title,
            description: editingLesson.description,
            video_url: lessonType === 'scheduling' ? null : editingLesson.video_url,
            duration_minutes: editingLesson.duration_minutes,
            is_free: editingLesson.is_free,
            lesson_type: lessonType,
            action_url: editingLesson.action_url,
            action_button_text: editingLesson.action_button_text,
          })
          .eq("id", lessonId);
      } else {
        // Create new lesson
        const module = modules.find(m => m.id === lessonModuleId);
        const activeLessonsCount = module?.lessons.filter(l => !l.deleted_at).length || 0;
        const { data: newLesson, error } = await supabase.from("lessons").insert({
          module_id: lessonModuleId,
          title: editingLesson.title,
          description: editingLesson.description,
          video_url: lessonType === 'scheduling' ? null : editingLesson.video_url,
          duration_minutes: editingLesson.duration_minutes,
          is_free: editingLesson.is_free || false,
          lesson_type: lessonType,
          action_url: editingLesson.action_url,
          action_button_text: editingLesson.action_button_text,
          order_index: activeLessonsCount,
        }).select().single();

        if (error) throw error;
        lessonId = newLesson.id;
      }

      // Save pending files for new lessons
      if (lessonId && pendingFiles.length > 0) {
        for (const { file, title } of pendingFiles) {
          const ext = file.name.split(".").pop();
          const filePath = `${lessonId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("course-materials")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: publicUrl } = supabase.storage
            .from("course-materials")
            .getPublicUrl(filePath);

          await supabase.from("lesson_materials").insert({
            lesson_id: lessonId,
            title,
            file_url: publicUrl.publicUrl,
            file_type: file.type,
          });
        }
      }

      // Save pending links for new lessons
      if (lessonId && pendingLinks.length > 0) {
        for (const { title, url } of pendingLinks) {
          await supabase.from("lesson_materials").insert({
            lesson_id: lessonId,
            title,
            file_url: url,
            file_type: "external_link",
          });
        }
      }

      // Reset states
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setLessonModuleId(null);
      setPendingFiles([]);
      setPendingLinks([]);
      onRefresh();
      
      const materialsCount = pendingFiles.length + pendingLinks.length;
      toast({ 
        title: "Aula salva!",
        description: materialsCount > 0 ? `${materialsCount} material(is) adicionado(s)` : undefined
      });
    } catch (error) {
      console.error("Save lesson error:", error);
      toast({ title: "Erro ao salvar aula", variant: "destructive" });
    }
  };

  const moveLessonToBin = async (lessonId: string) => {
    if (!confirm("Mover esta aula para a lixeira?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from("lessons")
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id 
        })
        .eq("id", lessonId);

      toast({ 
        title: "Aula movida para lixeira",
        description: "Você pode restaurá-la a qualquer momento."
      });
      onRefresh();
    } catch (error) {
      toast({ title: "Erro ao mover para lixeira", variant: "destructive" });
    }
  };

  const restoreLesson = async (lessonId: string) => {
    try {
      await supabase
        .from("lessons")
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", lessonId);

      toast({ title: "Aula restaurada com sucesso!" });
      onRefresh();
    } catch (error) {
      toast({ title: "Erro ao restaurar", variant: "destructive" });
    }
  };

  const permanentlyDeleteLesson = async (lessonId: string) => {
    if (!confirm("ATENÇÃO: Esta ação é irreversível! Excluir permanentemente?")) return;

    try {
      await supabase.from("lessons").delete().eq("id", lessonId);
      toast({ title: "Aula excluída permanentemente" });
      onRefresh();
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const moveLesson = async (lesson: Lesson, moduleId: string, direction: "up" | "down") => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const activeLessonsList = module.lessons.filter(l => !l.deleted_at);
    const currentIndex = activeLessonsList.findIndex(l => l.id === lesson.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= activeLessonsList.length) return;

    const otherLesson = activeLessonsList[newIndex];
    
    await Promise.all([
      supabase.from("lessons").update({ order_index: newIndex }).eq("id", lesson.id),
      supabase.from("lessons").update({ order_index: currentIndex }).eq("id", otherLesson.id)
    ]);

    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold">Módulos e Aulas</h3>
          <p className="text-sm text-muted-foreground">
            {activeModules.length} módulo(s), {activeLessons} aula(s) ativas
            {(deletedModules.length > 0 || deletedLessons > 0) && (
              <span className="text-destructive ml-2">
                • {deletedModules.length} módulo(s), {deletedLessons} aula(s) na lixeira
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {onToggleShowDeleted && (deletedModules.length > 0 || deletedLessons > 0) && (
            <div className="flex items-center gap-2">
              <Switch
                checked={showDeleted}
                onCheckedChange={onToggleShowDeleted}
                id="show-deleted-content"
              />
              <Label htmlFor="show-deleted-content" className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                Mostrar lixeira
              </Label>
            </div>
          )}
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
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            {showDeleted ? "Nenhum item na lixeira" : "Nenhum módulo ainda"}
          </p>
          {!showDeleted && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setEditingModule({ title: "", description: "" });
                setModuleDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro módulo
            </Button>
          )}
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {modules.map((module, moduleIndex) => {
            const isModuleDeleted = !!module.deleted_at;
            const activeLessonsInModule = module.lessons.filter(l => !l.deleted_at);
            const deletedLessonsInModule = module.lessons.filter(l => l.deleted_at);
            
            return (
              <AccordionItem
                key={module.id}
                value={module.id}
                className={cn(
                  "border rounded-xl overflow-hidden",
                  isModuleDeleted && "opacity-70 border-destructive/30 bg-destructive/5"
                )}
              >
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-3 text-left flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      isModuleDeleted ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}>
                      {moduleIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{module.title}</p>
                        {isModuleDeleted && (
                          <Badge variant="destructive" className="text-xs">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Lixeira
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activeLessonsInModule.length} aula(s)
                        {deletedLessonsInModule.length > 0 && (
                          <span className="text-destructive ml-1">
                            • {deletedLessonsInModule.length} na lixeira
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  {/* Module actions */}
                  <div className="flex flex-wrap gap-2 mb-4 pt-2 border-t">
                    {isModuleDeleted ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreModule(module.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restaurar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive ml-auto"
                          onClick={() => permanentlyDeleteModule(module.id)}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Excluir Definitivamente
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLessonModuleId(module.id);
                            setEditingLesson({ title: "", description: "", video_url: "", is_free: false, lesson_type: "video" });
                            setPendingFiles([]);
                            setPendingLinks([]);
                            setLessonDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nova Aula
                        </Button>
                        <Button
                          variant="ghost"
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
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateModule(module)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicar
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={moduleIndex === 0 || modules.slice(0, moduleIndex).every(m => m.deleted_at)}
                            onClick={() => moveModule(module.id, "up")}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={moduleIndex === modules.length - 1 || modules.slice(moduleIndex + 1).every(m => m.deleted_at)}
                            onClick={() => moveModule(module.id, "down")}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveModuleToBin(module.id)}
                          className="text-destructive hover:text-destructive ml-auto"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Lessons list */}
                  {module.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {isModuleDeleted ? "Este módulo não possui aulas" : "Nenhuma aula neste módulo"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isLessonDeleted = !!lesson.deleted_at;
                        const activeLessonIndex = activeLessonsInModule.findIndex(l => l.id === lesson.id);
                        
                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg group",
                              isLessonDeleted 
                                ? "bg-destructive/5 border border-destructive/20 opacity-70" 
                                : "bg-muted/50"
                            )}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                            
                            <div className="flex items-center gap-2">
                              {getVideoTypeIcon(lesson.video_url, lesson.lesson_type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">
                                  {!isLessonDeleted && `${moduleIndex + 1}.${activeLessonIndex + 1} - `}{lesson.title}
                                </p>
                                {isLessonDeleted && (
                                  <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded flex items-center gap-1 shrink-0">
                                    <Trash2 className="w-3 h-3" />
                                    Lixeira
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {lesson.lesson_type === 'scheduling' && (
                                  <span className="text-secondary">Agendamento</span>
                                )}
                                {lesson.lesson_type === 'text' && (
                                  <span className="text-purple-500">Texto</span>
                                )}
                                {lesson.duration_minutes && lesson.lesson_type !== 'scheduling' && (
                                  <span>{lesson.duration_minutes} min</span>
                                )}
                                {!lesson.video_url && lesson.lesson_type !== 'scheduling' && lesson.lesson_type !== 'text' && (
                                  <span className="text-yellow-600">Sem vídeo</span>
                                )}
                              </div>
                            </div>
                            
                            {lesson.is_free && !isLessonDeleted && (
                              <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded shrink-0">
                                Grátis
                              </span>
                            )}
                            
                            {isLessonDeleted ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-green-600 hover:text-green-700"
                                  onClick={() => restoreLesson(lesson.id)}
                                  title="Restaurar"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => permanentlyDeleteLesson(lesson.id)}
                                  title="Excluir definitivamente"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={activeLessonIndex === 0}
                                  onClick={() => moveLesson(lesson, module.id, "up")}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={activeLessonIndex === activeLessonsInModule.length - 1}
                                  onClick={() => moveLesson(lesson, module.id, "down")}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setLessonModuleId(module.id);
                                    setEditingLesson(lesson);
                                    setPendingFiles([]);
                                    setPendingLinks([]);
                                    setLessonDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => moveLessonToBin(lesson.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson?.id ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            {/* Lesson Type Selector */}
            <div>
              <Label>Tipo de Conteúdo</Label>
              <Select
                value={editingLesson?.lesson_type || "video"}
                onValueChange={(value) => setEditingLesson({ ...editingLesson, lesson_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <span className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-green-500" />
                      Vídeo
                    </span>
                  </SelectItem>
                  <SelectItem value="scheduling">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      Agendamento
                    </span>
                  </SelectItem>
                  <SelectItem value="text">
                    <span className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-purple-500" />
                      Texto/Leitura
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {editingLesson?.lesson_type === 'scheduling' 
                  ? "Exibe botão para agendar encontro via link externo"
                  : editingLesson?.lesson_type === 'text'
                  ? "Conteúdo em texto, sem vídeo"
                  : "Aula com vídeo do YouTube, Vimeo ou URL direta"
                }
              </p>
            </div>

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
            
            {/* Conditional: Video URL for video type */}
            {(!editingLesson?.lesson_type || editingLesson?.lesson_type === 'video') && (
              <VideoUrlInput
                value={editingLesson?.video_url || ""}
                onChange={(url) => setEditingLesson({ ...editingLesson, video_url: url })}
              />
            )}

            {/* Conditional: Action URL for scheduling type */}
            {editingLesson?.lesson_type === 'scheduling' && (
              <div className="space-y-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    Link do Calendário *
                  </Label>
                  <Input
                    value={editingLesson?.action_url || ""}
                    onChange={(e) => setEditingLesson({ ...editingLesson, action_url: e.target.value })}
                    placeholder="https://calendar.google.com/... ou https://calendly.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Calendar, Calendly, Cal.com, ou qualquer link de agendamento
                  </p>
                </div>
                <div>
                  <Label>Texto do Botão</Label>
                  <Input
                    value={editingLesson?.action_button_text || ""}
                    onChange={(e) => setEditingLesson({ ...editingLesson, action_button_text: e.target.value })}
                    placeholder="Agendar Agora"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {editingLesson?.lesson_type !== 'scheduling' && (
                <div>
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={editingLesson?.duration_minutes || ""}
                    onChange={(e) => setEditingLesson({ 
                      ...editingLesson, 
                      duration_minutes: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="0"
                  />
                </div>
              )}
              <div className={`flex items-center gap-2 ${editingLesson?.lesson_type !== 'scheduling' ? 'pt-6' : ''}`}>
                <Switch
                  checked={editingLesson?.is_free || false}
                  onCheckedChange={(checked) => setEditingLesson({ ...editingLesson, is_free: checked })}
                />
                <Label>Aula Gratuita (preview)</Label>
              </div>
            </div>

            {/* Materials Section */}
            <LessonMaterialsSection
              lessonId={editingLesson?.id}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              pendingLinks={pendingLinks}
              setPendingLinks={setPendingLinks}
            />
            
            <div className="flex justify-end gap-2 pt-4">
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
  );
};

export default ModuleManager;
