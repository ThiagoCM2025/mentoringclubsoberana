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
import { useConfetti } from "@/hooks/useConfetti";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Clock,
  List
} from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

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
  const { fireSuccessConfetti, fireCelebration } = useConfetti();
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

    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonData) {
      setLesson(lessonData);

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

      const { data: materialsData } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", lessonId);

      if (materialsData) setMaterials(materialsData);

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
    
    // Fire confetti celebration
    fireSuccessConfetti();
    
    toast({
      title: "Aula concluída! 🎉",
      description: "Seu progresso foi salvo.",
    });

    // Check if this completes a module
    const currentModule = modulesWithLessons.find(m => m.lessons.some(l => l.id === lessonId));
    if (currentModule) {
      const completedCount = currentModule.lessons.filter(l => l.completed || l.id === lessonId).length;
      if (completedCount === currentModule.lessons.length) {
        // Module completed - fire big celebration
        setTimeout(() => fireCelebration(), 500);
        toast({
          title: "Módulo concluído! 🏆",
          description: `Você completou "${currentModule.title}"`,
        });
      }
    }

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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <motion.img
          src={isotipoGold}
          alt="Carregando"
          className="w-16 h-16 object-contain"
          animate={{
            filter: [
              "drop-shadow(0 0 10px hsla(38, 30%, 51%, 0.3))",
              "drop-shadow(0 0 30px hsla(38, 30%, 51%, 0.6))",
              "drop-shadow(0 0 10px hsla(38, 30%, 51%, 0.3))"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Dark Theme */}
      <header className="bg-black/95 backdrop-blur-sm py-3 px-4 sticky top-0 z-50 border-b border-secondary/20">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="text-cream/70 hover:text-cream hover:bg-secondary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src={isotipoGold} 
                alt="Soberana" 
                className="w-8 h-8 object-contain isotipo-glow" 
              />
              <div className="hidden sm:block">
                <p className="text-xs text-secondary font-medium">{module?.title}</p>
                <p className="font-medium text-cream text-sm line-clamp-1">{lesson?.title}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lessonId && (
              <FavoriteButton 
                lessonId={lessonId} 
                className="text-cream/70 hover:text-red-500 hover:bg-secondary/10"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-cream/70 hover:text-cream hover:bg-secondary/10"
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              onClick={markAsComplete}
              disabled={isCompleted}
              size="sm"
              className={isCompleted 
                ? "bg-green-600 hover:bg-green-600 text-white" 
                : "bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
              }
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
          {/* Video Player - Black Background for immersion */}
          <div className={`bg-black relative ${theaterMode ? "h-[80vh]" : "aspect-video max-h-[70vh]"}`}>
            <VideoPlayer
              url={lesson?.video_url || null}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              initialTime={progressSeconds}
            />
          </div>

          {/* Lesson Content - Dark Theme */}
          <div className="bg-zinc-950">
            <div className="max-w-4xl mx-auto p-6">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="mb-6 bg-zinc-900 border border-secondary/20">
                  <TabsTrigger 
                    value="description" 
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-cream"
                  >
                    Descrição
                  </TabsTrigger>
                  <TabsTrigger 
                    value="materials"
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-cream"
                  >
                    Materiais ({materials.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description">
                  <h1 className="text-2xl font-serif font-bold text-cream mb-3">
                    {lesson?.title}
                  </h1>
                  {lesson?.duration_minutes && (
                    <p className="text-sm text-cream/60 flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-secondary" />
                      {lesson.duration_minutes} minutos
                    </p>
                  )}
                  {lesson?.description ? (
                    <p className="text-cream/80 leading-relaxed">
                      {lesson.description}
                    </p>
                  ) : (
                    <p className="text-cream/50 italic">
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
                          className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-secondary/20 hover:border-secondary/50 transition-all group hover:shadow-md"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                            <Download className="w-5 h-5 text-secondary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-cream">
                              {material.title}
                            </p>
                            <p className="text-sm text-cream/50 uppercase">
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
                      <FileText className="w-12 h-12 text-cream/30 mx-auto mb-3" />
                      <p className="text-cream/50">
                        Nenhum material disponível para esta aula.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Navigation - Dark Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary/20">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/student/lesson/${prevLesson.id}`)}
                    className="group border-secondary/30 text-cream hover:bg-secondary/10"
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
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold group"
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button 
                    onClick={goBack} 
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                  >
                    Voltar ao curso
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar - Dark Theme */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-[57px] bottom-0 w-80 hidden lg:block bg-zinc-950 border-l border-secondary/20"
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
