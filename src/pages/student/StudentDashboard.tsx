import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  Award,
  Flame,
  Star,
  Trophy,
  Menu,
  X,
  LogOut,
  User,
  Medal,
  ChevronRight,
  Heart,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatsCard from "@/components/student/StatsCard";
import CourseCard from "@/components/student/CourseCard";
import ContinueWatching from "@/components/student/ContinueWatching";
import CoursePreviewModal from "@/components/student/CoursePreviewModal";
import { DiagnosticBanner } from "@/components/student/DiagnosticBanner";
import { NotificationBell } from "@/components/student/NotificationBell";
import StudyReminderButton from "@/components/student/StudyReminderButton";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
}

interface EnrollmentWithCourse {
  course_id: string;
  courses: Course;
}

interface ContinueItem {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  thumbnail: string | null;
  progress: number;
  duration: number | null;
}

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats: gamificationStats, calculateLevel, getCurrentLevelProgress } = useGamification();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [courseStats, setCourseStats] = useState<Record<string, { total: number; completed: number }>>({});
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);

  const level = gamificationStats ? calculateLevel(gamificationStats.xp) : 1;
  const levelProgress = gamificationStats ? getCurrentLevelProgress(gamificationStats.xp) : 0;

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (profileData) setProfile(profileData);

    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, price")
      .eq("is_published", true);

    if (coursesData) {
      setAllCourses(coursesData);
    }

    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price
        )
      `)
      .eq("user_id", user.id);

    if (enrollmentData) {
      setEnrollments(enrollmentData as unknown as EnrollmentWithCourse[]);
      
      for (const enrollment of enrollmentData) {
        await fetchCourseProgress(enrollment.course_id);
      }

      await fetchContinueWatching(enrollmentData as unknown as EnrollmentWithCourse[]);
    }

    const { count } = await supabase
      .from("progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);
    
    setTotalCompleted(count || 0);

    setLoading(false);
  };

  const fetchCourseProgress = async (courseId: string) => {
    if (!user) return;

    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    if (!modules || modules.length === 0) {
      setProgress(prev => ({ ...prev, [courseId]: 0 }));
      setCourseStats(prev => ({ ...prev, [courseId]: { total: 0, completed: 0 } }));
      return;
    }

    const moduleIds = modules.map(m => m.id);
    
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    if (!lessons || lessons.length === 0) {
      setProgress(prev => ({ ...prev, [courseId]: 0 }));
      setCourseStats(prev => ({ ...prev, [courseId]: { total: 0, completed: 0 } }));
      return;
    }

    const lessonIds = lessons.map(l => l.id);
    
    const { data: progressData } = await supabase
      .from("progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    const completedCount = progressData?.filter(p => p.completed).length || 0;
    const percentage = Math.round((completedCount / lessons.length) * 100);
    
    setProgress(prev => ({ ...prev, [courseId]: percentage }));
    setCourseStats(prev => ({ ...prev, [courseId]: { total: lessons.length, completed: completedCount } }));
  };

  const fetchContinueWatching = async (enrollments: EnrollmentWithCourse[]) => {
    if (!user || enrollments.length === 0) return;

    const items: ContinueItem[] = [];

    for (const enrollment of enrollments) {
      const { data: modules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", enrollment.course_id);

      if (!modules || modules.length === 0) continue;

      const moduleIds = modules.map(m => m.id);

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, duration_minutes")
        .in("module_id", moduleIds)
        .order("order_index");

      if (!lessons || lessons.length === 0) continue;

      const lessonIds = lessons.map(l => l.id);
      const { data: progressData } = await supabase
        .from("progress")
        .select("lesson_id, progress_seconds, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      for (const lesson of lessons) {
        const lessonProgress = progressData?.find(p => p.lesson_id === lesson.id);
        if (lessonProgress && !lessonProgress.completed && lessonProgress.progress_seconds > 0) {
          const durationSeconds = (lesson.duration_minutes || 0) * 60;
          const progressPercent = durationSeconds > 0 
            ? Math.round((lessonProgress.progress_seconds / durationSeconds) * 100)
            : 0;

          items.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            courseTitle: enrollment.courses.title,
            thumbnail: enrollment.courses.thumbnail_url,
            progress: Math.min(progressPercent, 99),
            duration: lesson.duration_minutes
          });
        }
      }
    }

    setContinueWatching(items.slice(0, 5));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profile.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Aluna";

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Premium Black with Gold accents */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-secondary/20 py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={isotipoGold} alt="Soberana" className="w-10 h-10 object-contain" />
            <span className="font-serif font-bold text-xl hidden sm:block text-secondary">Área do Aluno</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/favorites")}
                className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/community")}
                className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Users className="w-4 h-4 mr-2" />
                Comunidade
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/achievements")}
                className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Conquistas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/certificates")}
                className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Medal className="w-4 h-4 mr-2" />
                Certificados
              </Button>
            </nav>
            <div className="flex items-center gap-1">
              <StudyReminderButton />
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
                onClick={() => navigate("/student/profile")}
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-cream/70 hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-cream"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-secondary/20 p-4"
          >
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => { navigate("/student/favorites"); setMobileMenuOpen(false); }}
                className="justify-start text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
              </Button>
              <Button
                variant="ghost"
                onClick={() => { navigate("/student/community"); setMobileMenuOpen(false); }}
                className="justify-start text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Users className="w-4 h-4 mr-2" />
                Comunidade
              </Button>
              <Button
                variant="ghost"
                onClick={() => { navigate("/student/achievements"); setMobileMenuOpen(false); }}
                className="justify-start text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Conquistas
              </Button>
              <Button
                variant="ghost"
                onClick={() => { navigate("/student/certificates"); setMobileMenuOpen(false); }}
                className="justify-start text-cream/70 hover:text-secondary hover:bg-secondary/10"
              >
                <Medal className="w-4 h-4 mr-2" />
                Certificados
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-cream/70 hover:text-secondary hover:bg-secondary/10"
                onClick={() => { navigate("/student/profile"); setMobileMenuOpen(false); }}
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="justify-start text-cream/70 hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="container-soberana py-8 px-4">
        {/* Welcome Banner with XP - Premium Black/Gold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-black to-zinc-900 p-6 md:p-8 mb-8 border border-secondary/20"
        >
          {/* Decorative pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(${patternCirclesGold})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px',
            }}
          />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream mb-2">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-cream/60 max-w-xl">
                Continue sua jornada para se tornar uma advogada soberana.
              </p>
            </div>
            
            {/* XP and Streak */}
            <div className="flex items-center gap-4">
              <div 
                className="bg-secondary/10 border border-secondary/20 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => navigate("/student/achievements")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-cream/60">Nível {level}</span>
                </div>
                <p className="text-2xl font-bold text-cream">{gamificationStats?.xp || 0} XP</p>
                <Progress value={levelProgress} className="h-1.5 mt-2 bg-secondary/20" />
              </div>
              
              <div 
                className="bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-orange-500/20 transition-colors"
                onClick={() => navigate("/student/achievements")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-cream/60">Streak</span>
                </div>
                <p className="text-2xl font-bold text-cream">{gamificationStats?.streak_days || 0} dias</p>
              </div>
            </div>
          </div>
          
          {/* Decorative glow elements */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute right-20 top-0 w-20 h-20 bg-secondary/5 rounded-full blur-2xl" />
        </motion.div>

        {/* Diagnostic Banner */}
        <DiagnosticBanner />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard
            icon={BookOpen}
            label="Cursos Ativos"
            value={enrollments.length}
            color="primary"
            index={0}
          />
          <StatsCard
            icon={PlayCircle}
            label="Aulas Concluídas"
            value={totalCompleted}
            color="green"
            index={1}
          />
          <StatsCard
            icon={Clock}
            label="Horas de Estudo"
            value={Math.round(totalCompleted * 0.25)}
            color="secondary"
            index={2}
          />
          <StatsCard
            icon={Award}
            label="Certificados"
            value={Object.values(progress).filter(p => p === 100).length}
            color="accent"
            index={3}
          />
        </div>

        {/* Continue Watching */}
        <ContinueWatching items={continueWatching} />

        {/* My Courses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-cream">
              Meus Cursos
            </h2>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] rounded-xl bg-zinc-800 mb-4" />
                  <div className="h-6 bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-2xl p-8 text-center border border-secondary/10"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-cream/40" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-cream mb-2">
                Nenhum curso ainda
              </h3>
              <p className="text-cream/50 text-sm max-w-md mx-auto">
                Você ainda não está matriculada em nenhum curso. Explore os cursos disponíveis abaixo!
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <CourseCard
                  key={enrollment.course_id}
                  id={enrollment.course_id}
                  title={enrollment.courses.title}
                  description={enrollment.courses.description}
                  thumbnail={enrollment.courses.thumbnail_url}
                  progress={progress[enrollment.course_id] || 0}
                  totalLessons={courseStats[enrollment.course_id]?.total || 0}
                  completedLessons={courseStats[enrollment.course_id]?.completed || 0}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* Available Courses (Locked) */}
        {(() => {
          const enrolledIds = new Set(enrollments.map(e => e.course_id));
          const lockedCourses = allCourses.filter(c => !enrolledIds.has(c.id));
          
          if (lockedCourses.length === 0) return null;
          
          return (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-cream">
                    Cursos Disponíveis
                  </h2>
                  <p className="text-cream/50 text-sm mt-1">
                    Expanda seu conhecimento com nossos outros cursos
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lockedCourses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail_url}
                    isLocked={true}
                    price={course.price}
                    index={index}
                    onPreview={() => setPreviewCourseId(course.id)}
                  />
                ))}
              </div>
            </section>
          );
        })()}
      </main>

      {/* Course Preview Modal */}
      <CoursePreviewModal
        courseId={previewCourseId}
        isOpen={!!previewCourseId}
        onClose={() => setPreviewCourseId(null)}
      />
    </div>
  );
};

export default StudentDashboard;
