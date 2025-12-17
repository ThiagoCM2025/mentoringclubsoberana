import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  PlayCircle,
  Clock,
  BookOpen
} from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  module_id: string;
  order_index: number;
}

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

interface Module {
  id: string;
  title: string;
  course_id: string;
}

interface LessonNav {
  id: string;
  title: string;
}

const LessonPlayer = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [prevLesson, setPrevLesson] = useState<LessonNav | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonNav | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId && user) {
      fetchLessonData();
    }
  }, [lessonId, user]);

  const fetchLessonData = async () => {
    if (!lessonId || !user) return;

    // Fetch lesson
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonData) {
      setLesson(lessonData);

      // Fetch module
      const { data: moduleData } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("id", lessonData.module_id)
        .single();

      if (moduleData) {
        setModule(moduleData);
        fetchNavigation(moduleData.course_id, lessonData.module_id, lessonData.order_index);
      }

      // Fetch materials
      const { data: materialsData } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", lessonId);

      if (materialsData) setMaterials(materialsData);

      // Fetch progress
      const { data: progressData } = await supabase
        .from("progress")
        .select("completed, progress_seconds")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (progressData) {
        setIsCompleted(progressData.completed);
        setProgressSeconds(progressData.progress_seconds || 0);
      }
    }

    setLoading(false);
  };

  const fetchNavigation = async (courseId: string, currentModuleId: string, currentOrder: number) => {
    // Get all lessons for the course
    const { data: modules } = await supabase
      .from("modules")
      .select("id, order_index")
      .eq("course_id", courseId)
      .order("order_index");

    if (!modules) return;

    const allLessons: { id: string; title: string; moduleOrder: number; lessonOrder: number }[] = [];

    for (const m of modules) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, order_index")
        .eq("module_id", m.id)
        .order("order_index");

      if (lessons) {
        lessons.forEach(l => {
          allLessons.push({
            id: l.id,
            title: l.title,
            moduleOrder: m.order_index,
            lessonOrder: l.order_index
          });
        });
      }
    }

    // Sort lessons
    allLessons.sort((a, b) => {
      if (a.moduleOrder !== b.moduleOrder) return a.moduleOrder - b.moduleOrder;
      return a.lessonOrder - b.lessonOrder;
    });

    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    if (currentIndex > 0) setPrevLesson(allLessons[currentIndex - 1]);
    if (currentIndex < allLessons.length - 1) setNextLesson(allLessons[currentIndex + 1]);
  };

  const saveProgress = async (seconds: number, completed = false) => {
    if (!user || !lessonId) return;

    const { data: existing } = await supabase
      .from("progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("progress")
        .update({
          progress_seconds: seconds,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("progress")
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_seconds: seconds,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      if (currentTime > 0 && currentTime % 10 === 0) {
        saveProgress(currentTime);
      }
    }
  };

  const handleVideoEnded = () => {
    markAsComplete();
  };

  const markAsComplete = async () => {
    if (!user || !lessonId) return;

    const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : progressSeconds;
    await saveProgress(currentTime, true);
    setIsCompleted(true);
    
    toast({
      title: "Aula concluída! 🎉",
      description: "Seu progresso foi salvo.",
    });
  };

  const goBack = () => {
    if (module?.course_id) {
      navigate(`/student/course/${module.course_id}`);
    } else {
      navigate("/student");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground">
      {/* Header */}
      <header className="bg-foreground text-background py-3 px-4 sticky top-0 z-50 border-b border-background/10">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="text-background/80 hover:text-background hover:bg-background/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={brandLogo} alt="Soberana" className="w-8 h-8 object-contain brightness-0 invert" />
              <div className="hidden sm:block">
                <p className="text-xs text-background/60">{module?.title}</p>
                <p className="font-medium text-background text-sm line-clamp-1">{lesson?.title}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={markAsComplete}
            disabled={isCompleted}
            variant={isCompleted ? "secondary" : "default"}
            size="sm"
            className={isCompleted ? "bg-green-600 hover:bg-green-600 text-white" : "bg-secondary hover:bg-secondary/90"}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluída
              </>
            ) : (
              "Marcar como concluída"
            )}
          </Button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Video Player */}
        <main className="lg:flex-1">
          <div className="aspect-video bg-black relative">
            {lesson?.video_url ? (
              <video
                ref={videoRef}
                src={lesson.video_url}
                controls
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              >
                Seu navegador não suporta vídeos.
              </video>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-background/60">
                <PlayCircle className="w-20 h-20 mb-4" />
                <p>Vídeo em breve</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="p-6 bg-background">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              {lesson?.title}
            </h1>
            {lesson?.duration_minutes && (
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" />
                {lesson.duration_minutes} minutos
              </p>
            )}
            {lesson?.description && (
              <p className="text-muted-foreground">{lesson.description}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {prevLesson ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/student/lesson/${prevLesson.id}`)}
                  className="group"
                >
                  <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Button
                  onClick={() => navigate(`/student/lesson/${nextLesson.id}`)}
                  className="bg-primary hover:bg-primary/90 group"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button onClick={goBack} className="bg-secondary hover:bg-secondary/90">
                  Voltar ao curso
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar - Materials */}
        <aside className="lg:w-80 bg-background border-l border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-serif font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Materiais da Aula
            </h2>
          </div>
          
          {materials.length > 0 ? (
            <div className="p-4 space-y-3">
              {materials.map((material) => (
                <a
                  key={material.id}
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {material.title}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {material.file_type || "Arquivo"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum material disponível para esta aula.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LessonPlayer;