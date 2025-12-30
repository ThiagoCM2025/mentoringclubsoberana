import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProgramDetailData } from "@/hooks/useProgramDetailData";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock,
  Play,
  Target,
  Sparkles
} from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import { CourseSplashScreen } from "@/components/CourseSplashScreen";
import { ProgramTimeline } from "@/components/student/program/ProgramTimeline";
import { WeeklyMission } from "@/components/student/program/WeeklyMissionCard";
import { MissionDeliveryModal } from "@/components/student/program/MissionDeliveryModal";
import { CourseGamificationSidebar } from "@/components/student/program/CourseGamificationSidebar";
import { DiagnosticCTA } from "@/components/student/program/DiagnosticCTA";
import { SchedulingCTA } from "@/components/student/program/SchedulingCTA";
import { CertificateGenerator } from "@/components/student/CertificateGenerator";
import { WeekCelebrationModal } from "@/components/student/program/WeekCelebrationModal";
import { useRealtimeMissionCelebration } from "@/hooks/useRealtimeMissionCelebration";
import { ContentModulesSection } from "@/components/student/program/ContentModulesSection";
import { CurrentMissionSection } from "@/components/student/program/CurrentMissionSection";

// Local type for mission completions in timeline
type MissionCompletionStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

const ProgramCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for modals
  const [selectedMission, setSelectedMission] = useState<WeeklyMission | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Use the optimized RPC hook - 1 query instead of 10+
  const { data, isLoading, refetch } = useProgramDetailData(courseId, user?.id);

  // Realtime celebration hook
  const { celebration, clearCelebration } = useRealtimeMissionCelebration(user?.id, courseId);

  // Refresh data when a mission is approved via realtime
  useEffect(() => {
    if (celebration) {
      refetch();
    }
  }, [celebration, refetch]);

  const handleLessonClick = (lessonId: string) => {
    navigate(`/student/lesson/${lessonId}`);
  };

  const handleMissionSubmit = (mission: WeeklyMission) => {
    setSelectedMission(mission);
    setDeliveryModalOpen(true);
  };

  const handleDeliverySuccess = () => {
    refetch();
  };

  const handleDiagnosticComplete = () => {
    refetch();
  };

  if (isLoading || !data) {
    return (
      <CourseSplashScreen 
        courseTitle={data?.course?.title || "Carregando programa..."}
        autoProgress={true}
      />
    );
  }

  const { 
    course, 
    enrollment, 
    modules, 
    missions, 
    gamification, 
    titles: programTitles, 
    diagnostic, 
    certificate,
    current_week: currentWeek 
  } = data;

  // Determine module type based on order_index or title
  const getModuleType = (m: typeof modules[0]): 'onboarding' | 'pillar' | 'dynamic' => {
    // Onboarding is the first module (order_index 0) OR has specific keywords
    const titleLower = m.title.toLowerCase();
    if (m.order_index === 0 || titleLower.includes('ponto de partida') || titleLower.includes('módulo 0')) {
      return 'onboarding';
    }
    if (m.is_dynamic) {
      return 'dynamic';
    }
    return 'pillar';
  };

  // Transform modules for compatibility with existing components
  const transformedModules = modules.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    order_index: m.order_index,
    module_type: getModuleType(m),
    unlock_week: m.unlock_week,
    is_dynamic: m.is_dynamic,
    lessons: m.lessons.map(l => ({
      id: l.id,
      title: l.title,
      description: null,
      duration_minutes: l.duration_minutes,
      order_index: l.order_index,
      is_free: false,
      lesson_type: 'video',
      lesson_label: null,
    })),
  }));

  // Transform lesson progress for compatibility
  const lessonProgress: Record<string, boolean> = {};
  modules.forEach(m => {
    m.lessons.forEach(l => {
      lessonProgress[l.id] = l.completed;
    });
  });

  // Transform missions for ProgramTimeline compatibility - use actual data from DB
  const transformedMissions: WeeklyMission[] = missions.map(m => ({
    id: m.id,
    week_number: m.week_number,
    month_number: (m as any).month_number || Math.ceil(m.week_number / 4),
    month_title: (m as any).month_title || null,
    title: m.title,
    challenge_description: m.description || '',
    why_do: (m as any).why_do || null,
    gamification_emoji: (m as any).gamification_emoji || '🎯',
    gamification_title: (m as any).gamification_title || null,
    gamification_reward: (m as any).gamification_reward || null,
    xp_reward: m.xp_reward,
    requires_proof: (m as any).requires_proof ?? true,
  }));

  // Transform mission completions for ProgramTimeline with proper typing
  const missionCompletions: Record<string, { mission_id: string; status: 'pending' | 'submitted' | 'approved' | 'rejected'; xp_earned: number; admin_feedback: string | null }> = {};
  missions.forEach(m => {
    missionCompletions[m.id] = {
      mission_id: m.id,
      status: m.status,
      xp_earned: m.xp_reward,
      admin_feedback: (m as any).admin_feedback || null,
    };
  });

  // Sort modules: onboarding first, then pillars, then dynamic
  const sortedModules = [...transformedModules].sort((a, b) => {
    const typeOrder = { onboarding: 0, pillar: 1, dynamic: 2 };
    const aOrder = typeOrder[a.module_type] ?? 1;
    const bOrder = typeOrder[b.module_type] ?? 1;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.order_index - b.order_index;
  });

  // Separate onboarding module and find welcome lesson
  const onboardingModule = sortedModules.find(m => m.module_type === 'onboarding');
  
  // Find welcome lesson: prefer order_index 0, fallback to title match, fallback to first
  const findWelcomeLesson = (lessons: typeof onboardingModule.lessons) => {
    if (!lessons || lessons.length === 0) return undefined;
    const byIndex = lessons.find(l => l.order_index === 0);
    if (byIndex) return byIndex;
    const byTitle = lessons.find(l => l.title.toLowerCase().includes('boas-vindas') || l.title.toLowerCase().includes('boas vindas'));
    if (byTitle) return byTitle;
    return lessons[0];
  };
  
  const onboardingWelcomeLesson = onboardingModule ? findWelcomeLesson(onboardingModule.lessons) : undefined;
  const accordionModules = sortedModules.filter(m => m.module_type !== 'onboarding');

  // Course gamification for sidebar
  const courseGamification = {
    xp: gamification.xp,
    level: gamification.level,
    current_title: gamification.current_title,
    missions_completed: gamification.missions_completed,
    week_progress: gamification.week_progress,
    badges_earned: [] as string[],
  };

  const diagnosticCompleted = diagnostic?.is_completed || false;
  const enrollmentDate = enrollment ? new Date(enrollment.enrolled_at) : null;

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
            <Badge variant="outline" className="border-secondary text-secondary">
              {gamification.current_title}
            </Badge>
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
              missions={transformedMissions}
              missionCompletions={missionCompletions}
              currentWeek={currentWeek}
              enrollmentDate={enrollmentDate}
              onWeekClick={(mission) => {
                setSelectedMission(mission);
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
            {/* 1. Current Mission Section with Arena - PRIMEIRO */}
            {user && (
              <CurrentMissionSection
                missions={transformedMissions}
                missionCompletions={missionCompletions}
                currentWeek={currentWeek}
                enrollmentDate={enrollmentDate}
                onSubmit={handleMissionSubmit}
                courseId={courseId!}
                userId={user.id}
              />
            )}

            {/* 2. Ponto de Partida - Onboarding Section - SEGUNDO */}
            {onboardingModule && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                        <p className="text-xs text-cream/50 mb-0.5">Passo 0</p>
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
                    onComplete={handleDiagnosticComplete}
                  />

                  {/* Scheduling CTA */}
                  <SchedulingCTA 
                    calendarLink={course?.calendar_link || "https://calendar.app.google/4SsS6E6crkZ2wQDAA"}
                    isEnabled={diagnosticCompleted}
                  />
                </div>
              </motion.div>
            )}

            {/* 3. Content Modules Section - TERCEIRO */}
            <ContentModulesSection
              modules={transformedModules}
              lessonProgress={lessonProgress}
              onLessonClick={handleLessonClick}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CourseGamificationSidebar
                gamification={courseGamification}
                totalMissions={missions.length}
                allTitles={programTitles}
                courseId={courseId}
              />
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
      {certificate && certificate.student_name && certificate.course_title && certificate.completion_date && (
        <CertificateGenerator
          certificate={{
            id: certificate.id,
            certificate_number: certificate.certificate_number,
            student_name: certificate.student_name,
            course_title: certificate.course_title,
            completion_date: certificate.completion_date,
            issued_at: certificate.issued_at,
          }}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Week Celebration Modal */}
      <WeekCelebrationModal
        isOpen={!!celebration}
        onClose={clearCelebration}
        weekNumber={celebration?.weekNumber || 1}
        missionTitle={celebration?.missionTitle || ""}
        xpEarned={celebration?.xpEarned || 100}
        emoji={celebration?.emoji || "🏆"}
      />
    </div>
  );
};

export default ProgramCourseDetail;
