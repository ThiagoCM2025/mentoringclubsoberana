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
import { DiagnosticCTA } from "@/components/student/program/DiagnosticCTA";
import { SchedulingCTA } from "@/components/student/program/SchedulingCTA";
import { CertificateGenerator } from "@/components/student/CertificateGenerator";

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
  const [certificate, setCertificate] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

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

      // Fetch certificate if program is 100% complete
      const { data: certData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      
      if (certData) {
        setCertificate(certData);
      }

    } catch (error) {
      console.error("Error fetching program data:", error);
    } finally {
      setLoading(false);
    }
  };

  // All modules are unlocked once enrolled - no weekly restrictions
  const isModuleUnlocked = (_module: Module): boolean => {
    return true;
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

  // Sort modules: dynamic first, then by order (onboarding will be separate section)
  const sortedModules = [...modules].sort((a, b) => {
    if (a.is_dynamic && !b.is_dynamic) return -1;
    if (!a.is_dynamic && b.is_dynamic) return 1;
    return a.order_index - b.order_index;
  });

  // Separate onboarding module for highlighted section
  const onboardingModule = sortedModules.find(m => m.module_type === 'onboarding');
  const onboardingWelcomeLesson = onboardingModule?.lessons[0];
  
  // Filter out onboarding from accordion (it's shown separately)
  const accordionModules = sortedModules.filter(m => m.module_type !== 'onboarding');

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

            {/* Ponto de Partida - Onboarding Section */}
            {onboardingModule && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent rounded-2xl blur-xl" />
                <div className="relative bg-zinc-900/80 rounded-2xl border-2 border-secondary/40 p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-cream text-lg">
                        Ponto de Partida
                      </h3>
                      <p className="text-sm text-cream/50">Complete antes de começar sua jornada</p>
                    </div>
                  </div>

                  {/* Welcome Video */}
                  {onboardingWelcomeLesson && (
                    <motion.button
                      onClick={() => handleLessonClick(onboardingWelcomeLesson.id)}
                      whileHover={{ scale: 1.01 }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 hover:bg-secondary/10 border border-secondary/20 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        lessonProgress[onboardingWelcomeLesson.id] 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-secondary/20 text-secondary"
                      }`}>
                        {lessonProgress[onboardingWelcomeLesson.id] ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-cream group-hover:text-secondary transition-colors">
                          {onboardingWelcomeLesson.title}
                        </p>
                        {onboardingWelcomeLesson.duration_minutes && (
                          <p className="text-xs text-cream/40 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {onboardingWelcomeLesson.duration_minutes} min
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="border-secondary/30 text-secondary text-xs">
                        Vídeo
                      </Badge>
                    </motion.button>
                  )}

                  {/* Diagnostic CTA */}
                  <DiagnosticCTA 
                    courseId={courseId!}
                    onComplete={() => {
                      setDiagnosticCompleted(true);
                      fetchAllData();
                    }}
                  />

                  {/* Scheduling CTA */}
                  <SchedulingCTA 
                    calendarLink={course?.calendar_link || "https://calendar.app.google/4SsS6E6crkZ2wQDAA"}
                    isEnabled={diagnosticCompleted}
                  />
                </div>
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

              <Accordion type="multiple" className="space-y-3">
                {accordionModules.map((module, moduleIndex) => {
                  const moduleCompleted = module.lessons.every(l => lessonProgress[l.id]);
                  const moduleLessonsCompleted = module.lessons.filter(l => lessonProgress[l.id]).length;

                  // Get lesson type badge
                  const getLessonBadge = (lessonType: string) => {
                    switch (lessonType) {
                      case 'video':
                        return <Badge variant="outline" className="border-secondary/30 text-secondary text-[10px]">VÍDEO</Badge>;
                      case 'text':
                        return <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-[10px]">MATERIAL</Badge>;
                      case 'action':
                        return <Badge variant="outline" className="border-green-400/30 text-green-400 text-[10px]">AÇÃO</Badge>;
                      default:
                        return null;
                    }
                  };

                  return (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      className="bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden"
                    >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/5 transition-colors">
                        <div className="flex items-center gap-4 text-left w-full">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            moduleCompleted
                              ? "bg-green-500/20 text-green-400"
                              : module.is_dynamic
                                ? "bg-secondary text-black"
                                : "bg-secondary/20 text-secondary"
                          }`}>
                            {moduleCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : module.is_dynamic ? (
                              <Target className="w-5 h-5" />
                            ) : (
                              moduleIndex + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-serif font-semibold text-cream">
                                {module.title}
                              </h3>
                              {module.is_dynamic && (
                                <Badge className="bg-secondary/20 text-secondary text-[10px]">
                                  Atualizado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-cream/50 mt-0.5">
                              {moduleLessonsCompleted}/{module.lessons.length} aulas concluídas
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-5 pb-4">
                        <div className="space-y-1 pt-2">
                          {module.lessons.map((lesson) => {
                            const isCompleted = lessonProgress[lesson.id];
                            
                            return (
                              <motion.button
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson.id)}
                                whileHover={{ x: 4 }}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/10 transition-all text-left group"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  isCompleted 
                                    ? "bg-green-500/20 text-green-400" 
                                    : "bg-zinc-800 text-cream/50 group-hover:bg-secondary/20 group-hover:text-secondary"
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium transition-colors truncate ${
                                    isCompleted ? "text-cream/50" : "text-cream group-hover:text-secondary"
                                  }`}>
                                    {lesson.title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {getLessonBadge(lesson.lesson_type)}
                                  {lesson.duration_minutes && (
                                    <span className="text-xs text-cream/40 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.duration_minutes}m
                                    </span>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </AccordionContent>
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
                  courseId={courseId}
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

      {/* Certificate Modal */}
      {certificate && (
        <CertificateGenerator
          certificate={certificate}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};

export default ProgramCourseDetail;
