import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle, 
  Clock,
  FileText,
  BookOpen,
  Award,
  Play
} from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import { CourseSplashScreen } from "@/components/CourseSplashScreen";
import { SkeletonList } from "@/components/ui/premium-skeleton";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
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
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [firstIncompleteLessonId, setFirstIncompleteLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    if (!courseId || !user) return;

    const { data: courseData } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url")
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
          duration_minutes,
          order_index,
          is_free
        )
      `)
      .eq("course_id", courseId)
      .order("order_index");

    if (modulesData) {
      const sortedModules = modulesData.map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
      }));
      setModules(sortedModules as Module[]);

      const allLessonIds = sortedModules.flatMap(m => m.lessons.map((l: Lesson) => l.id));
      if (allLessonIds.length > 0) {
        const { data: progressData } = await supabase
          .from("progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .in("lesson_id", allLessonIds);

        if (progressData) {
          const progressMap: Record<string, boolean> = {};
          progressData.forEach((p: LessonProgress) => {
            progressMap[p.lesson_id] = p.completed;
          });
          setLessonProgress(progressMap);

          for (const module of sortedModules) {
            for (const lesson of module.lessons) {
              if (!progressMap[lesson.id]) {
                setFirstIncompleteLessonId(lesson.id);
                break;
              }
            }
            if (firstIncompleteLessonId) break;
          }
        }
      }

      if (!firstIncompleteLessonId && sortedModules.length > 0 && sortedModules[0].lessons.length > 0) {
        setFirstIncompleteLessonId(sortedModules[0].lessons[0].id);
      }
    }

    setLoading(false);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = Object.values(lessonProgress).filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalDuration = modules.reduce((acc, m) => 
    acc + m.lessons.reduce((lacc, l) => lacc + (l.duration_minutes || 0), 0), 0
  );

  const handleLessonClick = (lessonId: string) => {
    navigate(`/student/lesson/${lessonId}`);
  };

  const handleContinue = () => {
    if (firstIncompleteLessonId) {
      navigate(`/student/lesson/${firstIncompleteLessonId}`);
    }
  };

  if (loading) {
    return (
      <CourseSplashScreen 
        courseTitle={course?.title || "Carregando curso..."}
        autoProgress={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-zinc-900 via-black to-black">
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url(${patternCirclesGold})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px',
          }}
        />
        
        {/* Header */}
        <header className="relative z-10 py-4 px-4 border-b border-secondary/20">
          <div className="container-soberana flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/student")}
                className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={isotipoGold} alt="Soberana" className="w-8 h-8 object-contain" />
                <span className="font-serif font-bold hidden sm:block text-secondary">Área do Aluno</span>
              </div>
            </div>
          </div>
        </header>

        {/* Course Hero */}
        <div className="container-soberana px-4 pb-12 pt-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-cream"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                {course?.title}
              </h1>
              <p className="text-cream/60 mb-6 text-lg">
                {course?.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <span>{totalLessons} aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span>{Math.round(totalDuration / 60)}h de conteúdo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span>Certificado incluso</span>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cream/60">Seu progresso</span>
                  <span className="font-semibold text-secondary">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-secondary/20" />
                <p className="text-sm text-cream/50 mt-2">
                  {completedLessons} de {totalLessons} aulas concluídas
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={handleContinue}
                size="lg"
                className="mt-6 bg-secondary hover:bg-secondary/90 text-black btn-glow-gold"
              >
                <Play className="w-5 h-5 mr-2" />
                {completedLessons === 0 ? "Começar Curso" : "Continuar"}
              </Button>
            </motion.div>

            {/* Thumbnail */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden lg:block"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-secondary/20 glow-gold-subtle">
                {course?.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-cream/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container-soberana py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-serif font-bold text-cream mb-6">
            Conteúdo do Curso
          </h2>

          <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="space-y-4">
            {modules.map((module, moduleIndex) => {
              const moduleCompleted = module.lessons.every(l => lessonProgress[l.id]);
              const moduleLessonsCompleted = module.lessons.filter(l => lessonProgress[l.id]).length;
              
              return (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="bg-zinc-900 rounded-xl border border-secondary/10 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/5 transition-colors">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        moduleCompleted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-secondary/20 text-secondary"
                      }`}>
                        {moduleCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          moduleIndex + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif font-semibold text-cream text-lg">
                          {module.title}
                        </h3>
                        <p className="text-sm text-cream/50">
                          {moduleLessonsCompleted}/{module.lessons.length} aulas concluídas
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-1 pt-2">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = lessonProgress[lesson.id];
                        
                        return (
                          <motion.button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson.id)}
                            whileHover={{ x: 4 }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/10 transition-all text-left group"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-zinc-800 text-cream/50 group-hover:bg-secondary/20 group-hover:text-secondary"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <PlayCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium transition-colors ${
                                isCompleted ? "text-cream/50" : "text-cream group-hover:text-secondary"
                              }`}>
                                {moduleIndex + 1}.{lessonIndex + 1} - {lesson.title}
                              </p>
                              {lesson.duration_minutes && (
                                <p className="text-xs text-cream/40 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} min
                                </p>
                              )}
                            </div>
                            {lesson.is_free && (
                              <span className="text-xs px-3 py-1 bg-secondary/20 text-secondary rounded-full font-medium">
                                Grátis
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {modules.length === 0 && (
            <div className="bg-zinc-900 rounded-2xl p-12 text-center border border-secondary/10">
              <FileText className="w-16 h-16 text-cream/30 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-cream mb-2">
                Conteúdo em breve
              </h3>
              <p className="text-cream/50">
                O conteúdo deste curso está sendo preparado com carinho para você.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CourseDetail;
