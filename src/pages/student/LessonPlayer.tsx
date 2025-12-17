import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LessonSidebar from "@/components/student/LessonSidebar";
import FavoriteButton from "@/components/student/FavoriteButton";
import VideoPlayer from "@/components/student/VideoPlayer";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  PlayCircle,
  Clock,
  List
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
  order_index: number;
}

interface ModuleWithLessons {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    duration_minutes: number | null;
    completed: boolean;
    isCurrent: boolean;
  }[];
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modulesWithLessons, setModulesWithLessons] = useState<ModuleWithLessons[]>([]);
  const [theaterMode, setTheaterMode] = useState(false);

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
        .select("id, title, course_id, order_index")
        .eq("id", lessonData.module_id)
        .single();

      if (moduleData) {
        setModule(moduleData);
        fetchNavigation(moduleData.course_id, lessonData.module_id, lessonData.order_index);
        fetchAllModulesWithLessons(moduleData.course_id);
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

  const fetchAllModulesWithLessons = async (courseId: string) => {
    if (!user) return;

    // Fetch all modules
    const { data: modules } = await supabase
      .from("modules")
      .select("id, title, order_index")
      .eq("course_id", courseId)
      .order("order_index");

    if (!modules) return;

    const result: ModuleWithLessons[] = [];

    for (const m of modules) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, duration_minutes, order_index")
        .eq("module_id", m.id)
        .order("order_index");

      if (lessons) {
        // Get progress for these lessons
        const lessonIds = lessons.map(l => l.id);
        const { data: progressData } = await supabase
          .from("progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);

        const progressMap = new Map(progressData?.map(p => [p.lesson_id, p.completed]) || []);

        result.push({
          id: m.id,
          title: m.title,
          lessons: lessons.map(l => ({
            id: l.id,
            title: l.title,
            duration_minutes: l.duration_minutes,
            completed: progressMap.get(l.id) || false,
            isCurrent: l.id === lessonId
          }))
        });
      }
    }

    setModulesWithLessons(result);
  };

  const fetchNavigation = async (courseId: string, currentModuleId: string, currentOrder: number) => {
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

    // Update sidebar state
    setModulesWithLessons(prev => 
      prev.map(m => ({
        ...m,
        lessons: m.lessons.map(l => 
          l.id === lessonId ? { ...l, completed: true } : l
        )
      }))
    );
  };

  const goBack = () => {
    if (module?.course_id) {
      navigate(`/student/course/${module.course_id}`);
    } else {
      navigate("/student");
    }
  };

  const handleLessonSelect = (selectedLessonId: string) => {
    if (selectedLessonId !== lessonId) {
      navigate(`/student/lesson/${selectedLessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground">
      {/* Header */}
      <header className="bg-foreground text-background py-3 px-4 sticky top-0 z-50 border-b border-background/10">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
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
          
          <div className="flex items-center gap-2">
            {lessonId && (
              <FavoriteButton 
                lessonId={lessonId} 
                className="text-background/80 hover:text-red-400 hover:bg-background/10"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-background/80 hover:text-background hover:bg-background/10"
            >
              <List className="w-5 h-5" />
            </Button>
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
                  <span className="hidden sm:inline">Concluída</span>
                </>
              ) : (
                <span className="hidden sm:inline">Marcar como concluída</span>
              )}
              {!isCompleted && <CheckCircle className="w-4 h-4 sm:hidden" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:mr-80" : ""}`}>
          {/* Video Player */}
          <div className={`bg-black relative ${theaterMode ? "h-[80vh]" : "aspect-video max-h-[70vh]"}`}>
            <VideoPlayer
              url={lesson?.video_url || null}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              initialTime={progressSeconds}
            />
          </div>

          {/* Lesson Content */}
          <div className="bg-background">
            <div className="max-w-4xl mx-auto p-6">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="description">Descrição</TabsTrigger>
                  <TabsTrigger value="materials">
                    Materiais ({materials.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description">
                  <h1 className="text-2xl font-serif font-bold text-foreground mb-3">
                    {lesson?.title}
                  </h1>
                  {lesson?.duration_minutes && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4" />
                      {lesson.duration_minutes} minutos
                    </p>
                  )}
                  {lesson?.description ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {lesson.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Nenhuma descrição disponível para esta aula.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="materials">
                  {materials.length > 0 ? (
                    <div className="grid gap-3">
                      {materials.map((material) => (
                        <a
                          key={material.id}
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                            <Download className="w-5 h-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {material.title}
                            </p>
                            <p className="text-sm text-muted-foreground uppercase">
                              {material.file_type || "Arquivo"}
                            </p>
                          </div>
                          <span className="text-sm text-secondary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Baixar
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Nenhum material disponível para esta aula.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

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
          </div>
        </main>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-[57px] bottom-0 w-80 hidden lg:block"
            >
              <LessonSidebar
                modules={modulesWithLessons}
                currentLessonId={lessonId || ""}
                onLessonSelect={handleLessonSelect}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LessonPlayer;
