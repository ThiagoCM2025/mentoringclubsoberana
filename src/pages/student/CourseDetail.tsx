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
  Lock,
  Clock,
  FileText,
  Download
} from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

interface Course {
  id: string;
  title: string;
  description: string;
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
      .select("id, title, description")
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
        }
      }
    }

    setLoading(false);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = Object.values(lessonProgress).filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleLessonClick = (lessonId: string) => {
    navigate(`/student/lesson/${lessonId}`);
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
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
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
              <span className="font-serif font-bold hidden sm:block">Área do Aluno</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 px-4">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {course?.title}
          </h1>
          <p className="text-muted-foreground mb-6">{course?.description}</p>
          
          {/* Progress Bar */}
          <div className="card-elegant p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Seu progresso</span>
              <span className="text-sm font-medium">
                {completedLessons} de {totalLessons} aulas concluídas
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-right text-sm text-secondary font-medium mt-2">
              {progressPercentage}% completo
            </p>
          </div>
        </motion.div>

        {/* Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">
            Conteúdo do Curso
          </h2>

          <Accordion type="multiple" className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="card-elegant border-none"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {moduleIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-foreground">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {module.lessons.length} aulas
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-2 pt-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = lessonProgress[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson.id)}
                          className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? "bg-green-100 text-green-600" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <PlayCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              isCompleted ? "text-muted-foreground" : "text-foreground"
                            }`}>
                              {moduleIndex + 1}.{lessonIndex + 1} - {lesson.title}
                            </p>
                            {lesson.duration_minutes && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration_minutes} min
                              </p>
                            )}
                          </div>
                          {lesson.is_free && (
                            <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                              Grátis
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {modules.length === 0 && (
            <div className="card-elegant p-12 text-center">
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