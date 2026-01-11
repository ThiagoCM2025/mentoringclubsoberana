import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle,
  Lock,
  Youtube,
  Video,
  FileText,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Maximize,
  ChevronDown,
  ChevronRight,
  Calendar,
  PenTool,
  Target,
  Paperclip,
  AlertCircle,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface CoursePreviewTabProps {
  course: {
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    price: number | null;
    is_published: boolean;
    is_subscription: boolean;
  };
  modules: Module[];
  materialsCount?: number;
  missionsCount?: number;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const CoursePreviewTab = ({ course, modules, materialsCount = 0, missionsCount = 0 }: CoursePreviewTabProps) => {
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [fullscreen, setFullscreen] = useState(false);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0),
    0
  );
  const freeLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.is_free).length,
    0
  );
  const lessonsWithVideo = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.video_url).length,
    0
  );
  const schedulingLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.lesson_type === "scheduling").length,
    0
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    modules.forEach(m => { allExpanded[m.id] = true; });
    setExpandedModules(allExpanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const getVideoEmbedUrl = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  const getLessonTypeIcon = (lesson: Lesson) => {
    if (lesson.lesson_type === "scheduling" || lesson.action_url) {
      return <Calendar className="w-4 h-4 text-blue-500" />;
    }
    if (lesson.lesson_type === "text") {
      return <PenTool className="w-4 h-4 text-purple-500" />;
    }
    if (!lesson.video_url) {
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
    if (lesson.video_url.includes("youtube") || lesson.video_url.includes("youtu.be")) {
      return <Youtube className="w-4 h-4 text-red-500" />;
    }
    if (lesson.video_url.includes("vimeo")) {
      return <Video className="w-4 h-4 text-blue-500" />;
    }
    return <Video className="w-4 h-4 text-green-500" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  const deviceWidths: Record<DeviceType, string> = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]"
  };

  return (
    <div className={cn("space-y-6", fullscreen && "fixed inset-0 z-50 bg-background p-6 overflow-y-auto")}>
      {/* Device Toggle Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Visualização:</span>
          <Button
            variant={device === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("desktop")}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </Button>
          <Button
            variant={device === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("tablet")}
            className="gap-2"
          >
            <Tablet className="w-4 h-4" />
            Tablet
          </Button>
          <Button
            variant={device === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("mobile")}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFullscreen(!fullscreen)}
          className="gap-2"
        >
          <Maximize className="w-4 h-4" />
          {fullscreen ? "Sair" : "Tela Cheia"}
        </Button>
      </div>

      {/* Preview Container */}
      <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
        {/* Hero Card - Student View */}
        <div className="rounded-2xl overflow-hidden bg-foreground text-background mb-6 shadow-xl">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-foreground to-primary/30">
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-secondary/30" />
              </div>
            )}
            {/* Overlay with course info */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="mb-3 bg-secondary text-secondary-foreground">
                {course.is_published ? "CURSO ATIVO" : "RASCUNHO"}
              </Badge>
              <h2 className={cn("font-serif font-bold text-background mb-2", 
                device === "mobile" ? "text-xl" : "text-3xl"
              )}>
                {course.title}
              </h2>
              {course.description && (
                <p className={cn("text-background/70 line-clamp-2", 
                  device === "mobile" ? "text-sm" : "text-base"
                )}>
                  {course.description}
                </p>
              )}
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="px-6 py-4 flex flex-wrap gap-4 border-t border-background/10">
            <div className="flex items-center gap-2 text-secondary">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{modules.length} módulos</span>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <PlayCircle className="w-4 h-4" />
              <span className="text-sm">{totalLessons} aulas</span>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatDuration(totalDuration)}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={cn("px-6 pb-6 flex gap-3", device === "mobile" ? "flex-col" : "flex-row")}>
            <Button variant="cta" className="flex-1 gap-2">
              <PlayCircle className="w-5 h-5" />
              Continuar de Onde Parou
            </Button>
            <Button variant="outline" className="border-background/30 text-background hover:bg-background/10 gap-2">
              <Award className="w-5 h-5" />
              Ver Certificado
            </Button>
          </div>
        </div>

        {/* Content Grid - Dark Theme Like Student */}
        <div className="rounded-2xl overflow-hidden bg-foreground border border-border/20 shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-background/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-background">
              <Eye className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">Conteúdo do Curso</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs text-background/60 hover:text-background hover:bg-background/10">
                Expandir Tudo
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs text-background/60 hover:text-background hover:bg-background/10">
                Recolher Tudo
              </Button>
            </div>
          </div>

          {/* Modules Accordion */}
          {modules.length === 0 ? (
            <div className="p-8 text-center text-background/50">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum módulo criado ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-background/10">
              {modules.map((module, moduleIndex) => {
                const moduleDuration = module.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0);
                const isExpanded = expandedModules[module.id] ?? false;
                const completedLessons = 0; // Simulated
                
                return (
                  <Collapsible key={module.id} open={isExpanded} onOpenChange={() => toggleModule(module.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="px-4 py-4 flex items-center gap-4 hover:bg-background/5 transition-colors cursor-pointer">
                        {/* Module Number */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold text-sm shrink-0">
                          {moduleIndex + 1}
                        </div>
                        
                        {/* Module Info */}
                        <div className="flex-1 text-left">
                          <p className="font-medium text-background">{module.title}</p>
                          <p className="text-xs text-background/50">
                            {module.lessons.length} aula(s) • {moduleDuration > 0 ? formatDuration(moduleDuration) : "Sem duração"}
                          </p>
                        </div>

                        {/* Progress Badge */}
                        <Badge variant="outline" className="border-background/20 text-background/60 shrink-0">
                          {completedLessons}/{module.lessons.length}
                        </Badge>

                        {/* Expand Icon */}
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-background/50" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-background/50" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="bg-background/5 divide-y divide-background/5">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className={cn(
                              "px-4 py-3 flex items-center gap-3 hover:bg-background/10 transition-colors",
                              lesson.is_free ? "cursor-pointer" : ""
                            )}
                            onClick={() => {
                              if (lesson.is_free && lesson.video_url) {
                                setPreviewLesson(lesson);
                                setPreviewOpen(true);
                              }
                            }}
                          >
                            {/* Lesson Number */}
                            <div className="w-6 text-center text-xs text-background/40">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </div>

                            {/* Status Icon */}
                            {lessonIndex === 0 ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : lesson.is_free ? (
                              <div className="w-4 h-4 rounded-full border-2 border-background/30" />
                            ) : (
                              <Lock className="w-4 h-4 text-background/30" />
                            )}

                            {/* Type Icon */}
                            {getLessonTypeIcon(lesson)}

                            {/* Lesson Title */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-background truncate">
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-background/40">
                                {lesson.duration_minutes && (
                                  <span>{lesson.duration_minutes} min</span>
                                )}
                                {!lesson.video_url && lesson.lesson_type !== "scheduling" && lesson.lesson_type !== "text" && (
                                  <span className="text-yellow-500">Sem vídeo</span>
                                )}
                                {lesson.lesson_type === "scheduling" && (
                                  <span className="text-blue-400">Agendamento</span>
                                )}
                              </div>
                            </div>

                            {/* Has Materials Icon */}
                            <Paperclip className="w-4 h-4 text-secondary/50 shrink-0" />

                            {/* Free Badge */}
                            {lesson.is_free && (
                              <Badge variant="secondary" className="bg-secondary/20 text-secondary shrink-0 text-xs">
                                Preview
                              </Badge>
                            )}
                          </div>
                        ))}

                        {/* Empty Module */}
                        {module.lessons.length === 0 && (
                          <div className="py-6 text-center text-background/30 text-sm">
                            <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                            Módulo sem aulas
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Cards - Student Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{materialsCount}</p>
              <p className="text-xs text-muted-foreground">Materiais de apoio</p>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{missionsCount}</p>
              <p className="text-xs text-muted-foreground">Missões configuradas</p>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{freeLessons}</p>
              <p className="text-xs text-muted-foreground">Aulas gratuitas (preview)</p>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {lessonsWithVideo < totalLessons && totalLessons > 0 && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-6">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
              <Video className="w-4 h-4" />
              {totalLessons - lessonsWithVideo - schedulingLessons} aula(s) ainda sem vídeo configurado
            </p>
          </div>
        )}

        {freeLessons === 0 && totalLessons > 0 && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-4">
            <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Dica: Marque algumas aulas como "Grátis" para permitir preview antes da compra
            </p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewLesson?.title}</DialogTitle>
          </DialogHeader>
          {previewLesson?.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              {previewLesson.video_url.includes("youtube") || previewLesson.video_url.includes("vimeo") ? (
                <iframe
                  src={getVideoEmbedUrl(previewLesson.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewLesson.video_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
          )}
          {previewLesson?.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {previewLesson.description}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursePreviewTab;
