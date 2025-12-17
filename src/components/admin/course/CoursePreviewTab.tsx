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
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle,
  Lock,
  Youtube,
  Video,
  FileText,
  Eye
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
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
}

const CoursePreviewTab = ({ course, modules }: CoursePreviewTabProps) => {
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  const getVideoTypeIcon = (url: string | null) => {
    if (!url) return <PlayCircle className="w-4 h-4 text-muted-foreground" />;
    if (url.includes("youtube") || url.includes("youtu.be")) {
      return <Youtube className="w-4 h-4 text-red-500" />;
    }
    if (url.includes("vimeo")) {
      return <Video className="w-4 h-4 text-blue-500" />;
    }
    return <Video className="w-4 h-4 text-green-500" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elegant p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{modules.length}</p>
          <p className="text-xs text-muted-foreground">Módulos</p>
        </div>
        <div className="card-elegant p-4 text-center">
          <PlayCircle className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold">{totalLessons}</p>
          <p className="text-xs text-muted-foreground">Aulas</p>
        </div>
        <div className="card-elegant p-4 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
          <p className="text-xs text-muted-foreground">Duração Total</p>
        </div>
        <div className="card-elegant p-4 text-center">
          <Video className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{lessonsWithVideo}/{totalLessons}</p>
          <p className="text-xs text-muted-foreground">Com Vídeo</p>
        </div>
      </div>

      {/* Status Info */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={course.is_published ? "default" : "secondary"}>
          {course.is_published ? "Publicado" : "Rascunho"}
        </Badge>
        <Badge variant="outline">
          {course.price ? `R$ ${course.price.toFixed(2)}` : "Gratuito"}
        </Badge>
        {course.is_subscription && (
          <Badge variant="outline">Assinatura</Badge>
        )}
        {freeLessons > 0 && (
          <Badge variant="outline" className="bg-secondary/10 text-secondary">
            {freeLessons} aula(s) grátis para preview
          </Badge>
        )}
      </div>

      {/* Course Structure */}
      <div className="card-elegant overflow-hidden">
        <div className="p-4 bg-muted/50 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview: Como o aluno verá
          </h3>
        </div>
        
        {modules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum módulo criado ainda</p>
          </div>
        ) : (
          <div className="divide-y">
            {modules.map((module, moduleIndex) => (
              <div key={module.id}>
                {/* Module Header */}
                <div className="px-4 py-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {moduleIndex + 1}
                    </div>
                    <div>
                      <p className="font-medium">{module.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {module.lessons.length} aula(s) • {module.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0)} min
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Lessons */}
                <div className="divide-y divide-border/50">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className={`px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors ${
                        lesson.is_free ? "cursor-pointer" : ""
                      }`}
                      onClick={() => {
                        if (lesson.is_free && lesson.video_url) {
                          setPreviewLesson(lesson);
                          setPreviewOpen(true);
                        }
                      }}
                    >
                      <div className="w-6 text-center text-sm text-muted-foreground">
                        {moduleIndex + 1}.{lessonIndex + 1}
                      </div>
                      
                      {getVideoTypeIcon(lesson.video_url)}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {lesson.duration_minutes && (
                            <span>{lesson.duration_minutes} min</span>
                          )}
                          {!lesson.video_url && (
                            <span className="text-yellow-600">Sem vídeo</span>
                          )}
                        </div>
                      </div>
                      
                      {lesson.is_free ? (
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary shrink-0">
                          Preview
                        </Badge>
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warnings */}
      {lessonsWithVideo < totalLessons && totalLessons > 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
            <Video className="w-4 h-4" />
            {totalLessons - lessonsWithVideo} aula(s) ainda sem vídeo configurado
          </p>
        </div>
      )}

      {freeLessons === 0 && totalLessons > 0 && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Dica: Marque algumas aulas como "Grátis" para permitir preview antes da compra
          </p>
        </div>
      )}

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
