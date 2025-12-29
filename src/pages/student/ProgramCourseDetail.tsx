import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  Award,
  Play,
  Lock,
  Target,
  Sparkles
} from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import { CourseSplashScreen } from "@/components/CourseSplashScreen";
import { ProgramTimeline } from "@/components/student/program/ProgramTimeline";
import { WeeklyMissionCard, WeeklyMission } from "@/components/student/program/WeeklyMissionCard";
import { MissionDeliveryModal } from "@/components/student/program/MissionDeliveryModal";
import { CourseGamificationSidebar } from "@/components/student/program/CourseGamificationSidebar";
import { OnboardingModule } from "@/components/student/program/OnboardingModule";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  program_type: string | null;
  requires_diagnostic: boolean;
  calendar_link: string | null;
  duration_weeks: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  module_type: string;
  unlock_week: number | null;
  is_dynamic: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
  lesson_type: string;
}

interface MissionCompletion {
  mission_id: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  xp_earned: number;
}

interface CourseGamification {
  xp: number;
  level: number;
  current_title: string;
  missions_completed: number;
  week_progress: number;
  badges_earned: string[];
}

interface ProgramTitle {
  week_number: number;
  title: string;
  emoji: string;
}

const ProgramCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [missions, setMissions] = useState<WeeklyMission[]>([]);
  const [missionCompletions, setMissionCompletions] = useState<Record<string, MissionCompletion>>({});
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [courseGamification, setCourseGamification] = useState<CourseGamification | null>(null);
  const [programTitles, setProgramTitles] = useState<ProgramTitle[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [enrollmentDate, setEnrollmentDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<WeeklyMission | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);

  useEffect(() => {
    if (courseId && user) {
      fetchAllData();
    }
  }, [courseId, user]);

  const fetchAllData = async () => {
    if (!courseId || !user) return;

    try {
      // Fetch course
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseData) setCourse(courseData as Course);

      // Fetch enrollment date
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("enrolled_at")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (enrollmentData) {
        const enrollDate = new Date(enrollmentData.enrolled_at);
        setEnrollmentDate(enrollDate);
        
        // Calculate current week
        const daysSinceEnrollment = Math.floor((Date.now() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));
        const week = Math.min(12, Math.max(1, Math.floor(daysSinceEnrollment / 7) + 1));
        setCurrentWeek(week);
      }

      // Fetch modules with lessons
      const { data: modulesData } = await supabase
        .from("modules")
        .select(`
          id, title, description, order_index, module_type, unlock_week, is_dynamic,
          lessons (id, title, description, duration_minutes, order_index, is_free, lesson_type)
        `)
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesData) {
        const sortedModules = modulesData.map(m => ({
          ...m,
          module_type: m.module_type || 'pillar',
          unlock_week: m.unlock_week,
          is_dynamic: m.is_dynamic || false,
          lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        }));
        setModules(sortedModules as Module[]);

        // Fetch lesson progress
        const allLessonIds = sortedModules.flatMap(m => m.lessons.map((l: Lesson) => l.id));
        if (allLessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from("progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", allLessonIds);

          if (progressData) {
            const progressMap: Record<string, boolean> = {};
            progressData.forEach((p: { lesson_id: string; completed: boolean }) => {
              progressMap[p.lesson_id] = p.completed;
            });
            setLessonProgress(progressMap);
          }
        }
      }

      // Fetch weekly missions
      const { data: missionsData } = await supabase
        .from("weekly_missions")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_active", true)
        .order("week_number");

      if (missionsData) {
        setMissions(missionsData as WeeklyMission[]);

        // Fetch user completions
        const missionIds = missionsData.map(m => m.id);
        if (missionIds.length > 0) {
          const { data: completionsData } = await supabase
            .from("user_mission_completions")
            .select("mission_id, status, xp_earned")
            .eq("user_id", user.id)
            .in("mission_id", missionIds);

          if (completionsData) {
            const completionsMap: Record<string, MissionCompletion> = {};
            completionsData.forEach((c: MissionCompletion) => {
              completionsMap[c.mission_id] = c;
            });
            setMissionCompletions(completionsMap);
          }
        }
      }

      // Fetch course gamification
      const { data: gamificationData } = await supabase
        .from("course_gamification")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (gamificationData) {
        setCourseGamification(gamificationData as CourseGamification);
      } else {
        setCourseGamification({
          xp: 0,
          level: 1,
          current_title: "Advogada Invisível",
          missions_completed: 0,
          week_progress: 1,
          badges_earned: []
        });
      }

      // Fetch program titles
      const { data: titlesData } = await supabase
        .from("program_titles")
        .select("week_number, title, emoji")
        .eq("course_id", courseId)
        .order("week_number");

      if (titlesData) {
        setProgramTitles(titlesData as ProgramTitle[]);
      }

      // Check diagnostic status
      const { data: diagnosticData } = await supabase
        .from("student_diagnostics")
        .select("completed")
        .eq("user_id", user.id)
        .maybeSingle();

      setDiagnosticCompleted(diagnosticData?.completed || false);

    } catch (error) {
      console.error("Error fetching program data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isModuleUnlocked = (module: Module): boolean => {
    if (module.is_dynamic) return true;
    if (module.module_type === 'onboarding') return true;
    if (!module.unlock_week) return true;
    return currentWeek >= module.unlock_week;
  };

  const currentMission = missions.find(m => m.week_number === currentWeek);
  const completedWeeks = missions
    .filter(m => missionCompletions[m.id]?.status === 'approved')
    .map(m => m.week_number);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = Object.values(lessonProgress).filter(Boolean).length;

  const handleLessonClick = (lessonId: string) => {
    navigate(`/student/lesson/${lessonId}`);
  };

  const handleMissionSubmit = (mission: WeeklyMission) => {
    setSelectedMission(mission);
    setDeliveryModalOpen(true);
  };

  const handleDeliverySuccess = () => {
    fetchAllData(); // Refresh data
  };

  if (loading) {
    return (
      <CourseSplashScreen 
        courseTitle={course?.title || "Carregando programa..."}
        autoProgress={true}
      />
    );
  }

  // Sort modules: dynamic first, then onboarding, then by order
  const sortedModules = [...modules].sort((a, b) => {
    if (a.is_dynamic && !b.is_dynamic) return -1;
    if (!a.is_dynamic && b.is_dynamic) return 1;
    if (a.module_type === 'onboarding' && b.module_type !== 'onboarding') return -1;
    if (a.module_type !== 'onboarding' && b.module_type === 'onboarding') return 1;
    return a.order_index - b.order_index;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-zinc-900 via-black to-black">
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
                <span className="font-serif font-bold hidden sm:block text-secondary">Programa</span>
              </div>
            </div>

            {/* Current title badge */}
            {courseGamification && (
              <Badge variant="outline" className="border-secondary text-secondary">
                {courseGamification.current_title}
              </Badge>
            )}
          </div>
        </header>

        {/* Course Hero */}
        <div className="container-soberana px-4 pb-8 pt-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-4">
              90 Dias para +50k/mês
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-cream mb-4">
              {course?.title}
            </h1>
            <p className="text-cream/60 max-w-2xl mx-auto">
              {course?.description}
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 rounded-2xl p-6 border border-secondary/20 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-cream flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Sua Jornada de 12 Semanas
              </h2>
              <span className="text-sm text-cream/50">
                Semana {currentWeek} de 12
              </span>
            </div>
            <ProgramTimeline
              totalWeeks={12}
              currentWeek={currentWeek}
              completedWeeks={completedWeeks}
              onWeekClick={(week) => {
                const mission = missions.find(m => m.week_number === week);
                if (mission) {
                  setSelectedMission(mission);
                }
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-soberana py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Week Mission - Highlighted */}
            {currentMission && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl font-serif font-bold text-cream mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Sua Missão Esta Semana
                </h2>
                <WeeklyMissionCard
                  mission={currentMission}
                  userCompletion={missionCompletions[currentMission.id]}
                  onSubmit={() => handleMissionSubmit(currentMission)}
                  isCurrentWeek={true}
                />
              </motion.div>
            )}

            {/* Onboarding Module */}
            {course?.requires_diagnostic && !diagnosticCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <OnboardingModule
                  courseId={courseId!}
                  calendarLink={course.calendar_link || undefined}
                  onDiagnosticComplete={() => {
                    setDiagnosticCompleted(true);
                    fetchAllData();
                  }}
                />
              </motion.div>
            )}

            {/* Modules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-serif font-bold text-cream mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                Conteúdo do Programa
              </h2>

              <Accordion type="multiple" className="space-y-4">
                {sortedModules.map((module, moduleIndex) => {
                  const isUnlocked = isModuleUnlocked(module);
                  const moduleCompleted = module.lessons.every(l => lessonProgress[l.id]);
                  const moduleLessonsCompleted = module.lessons.filter(l => lessonProgress[l.id]).length;

                  return (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      disabled={!isUnlocked}
                      className={`bg-zinc-900 rounded-xl border overflow-hidden ${
                        isUnlocked ? 'border-secondary/20' : 'border-zinc-800 opacity-60'
                      }`}
                    >
                      <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/5 transition-colors">
                        <div className="flex items-center gap-4 text-left w-full">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            !isUnlocked
                              ? "bg-zinc-800 text-zinc-600"
                              : moduleCompleted
                                ? "bg-green-500/20 text-green-400"
                                : module.is_dynamic
                                  ? "bg-secondary text-black"
                                  : "bg-secondary/20 text-secondary"
                          }`}>
                            {!isUnlocked ? (
                              <Lock className="w-5 h-5" />
                            ) : moduleCompleted ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : module.is_dynamic ? (
                              <Target className="w-6 h-6" />
                            ) : (
                              moduleIndex
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif font-semibold text-cream text-lg">
                                {module.title}
                              </h3>
                              {module.is_dynamic && (
                                <Badge className="bg-secondary/20 text-secondary text-xs">
                                  Atualizado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-cream/50">
                              {isUnlocked 
                                ? `${moduleLessonsCompleted}/${module.lessons.length} aulas concluídas`
                                : `Libera na semana ${module.unlock_week}`
                              }
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      
                      {isUnlocked && (
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
                                      {lesson.title}
                                    </p>
                                    {lesson.duration_minutes && (
                                      <p className="text-xs text-cream/40 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration_minutes} min
                                      </p>
                                    )}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {courseGamification && (
                <CourseGamificationSidebar
                  gamification={courseGamification}
                  totalMissions={missions.length}
                  allTitles={programTitles}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mission Delivery Modal */}
      <MissionDeliveryModal
        open={deliveryModalOpen}
        onOpenChange={setDeliveryModalOpen}
        mission={selectedMission}
        onSuccess={handleDeliverySuccess}
      />
    </div>
  );
};

export default ProgramCourseDetail;
