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
  Users,
  Play
} from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

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

    // Fetch course
    const { data: courseData } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url")
      .eq("id", courseId)
      .single();

    if (courseData) setCourse(courseData);

    // Fetch modules with lessons
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

      // Fetch progress
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

          // Find first incomplete lesson
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

      // If no progress, first lesson is the first incomplete
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary via-marsala-light to-background">
        {/* Header */}
        <header className="relative z-10 py-4 px-4">
          <div className="container-soberana flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/student")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={brandLogo} alt="Soberana" className="w-8 h-8 object-contain" />
                <span className="font-serif font-bold hidden sm:block text-primary-foreground">Área do Aluno</span>
              </div>
            </div>
          </div>
        </header>

        {/* Course Hero */}
        <div className="container-soberana px-4 pb-12 pt-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary-foreground"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                {course?.title}
              </h1>
              <p className="text-primary-foreground/80 mb-6 text-lg">
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
              <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Seu progresso</span>
                  <span className="font-semibold">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-primary-foreground/20" />
                <p className="text-sm text-primary-foreground/70 mt-2">
                  {completedLessons} de {totalLessons} aulas concluídas
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={handleContinue}
                size="lg"
                className="mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
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
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                {course?.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-marsala-light to-primary flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-primary-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
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
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
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
                  className="bg-card rounded-xl border border-border/50 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        moduleCompleted
                          ? "bg-green-500/20 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {moduleCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          moduleIndex + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif font-semibold text-foreground text-lg">
                          {module.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
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
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all text-left group"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? "bg-green-500/20 text-green-500" 
                                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <PlayCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium transition-colors ${
                                isCompleted ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                              }`}>
                                {moduleIndex + 1}.{lessonIndex + 1} - {lesson.title}
                              </p>
                              {lesson.duration_minutes && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} min
                                </p>
                              )}
                            </div>
                            {lesson.is_free && (
                              <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full font-medium">
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
            <div className="bg-card rounded-2xl p-12 text-center border border-border/50">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                Conteúdo em breve
              </h3>
              <p className="text-muted-foreground">
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
