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
  Users,
  MessageCircle,
  Settings,
  Search
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
import { SoberanaLogo } from "@/components/brand/SoberanaLogo";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import heroVariations from "@/assets/hero-variations.jpeg";

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
      {/* Header - Premium Navbar estilo MestresAI */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-secondary/20 py-3 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          {/* Logo */}
          <SoberanaLogo size="md" />
          
          {/* Desktop Nav - Centro */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student")}
              className="text-cream hover:text-secondary hover:bg-secondary/10"
            >
              Início
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/favorites")}
              className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
            >
              Favoritos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/community")}
              className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
            >
              Comunidades
            </Button>
          </nav>

          {/* Desktop Icons - Direita */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
            >
              <Search className="w-5 h-5" />
            </Button>
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

      {/* Hero Banner Full-Width - Estilo MestresAI */}
      <section className="relative h-[420px] md:h-[480px] w-full overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroVariations} 
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        
        {/* Gradient Overlay - Dark com dourado */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center container-soberana px-4">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            {/* Logo e brand */}
            <div className="flex items-center gap-4 mb-6">
              <img src={isotipoGold} alt="Soberana" className="w-20 h-20 drop-shadow-[0_0_20px_rgba(166,144,97,0.4)]" />
              <span className="font-serif text-4xl md:text-5xl font-bold text-secondary drop-shadow-lg">SOBERANA</span>
            </div>
            
            {/* Welcome text */}
            <h1 className="text-2xl md:text-3xl font-serif text-cream mb-4 leading-tight">
              Bem-vinda ao Mentoring Club Soberana —
            </h1>
            <p className="text-cream/70 text-base md:text-lg leading-relaxed">
              O lugar onde advogadas estão se transformando em empresárias de sucesso. 
              A mentoria é o poder que move sua jornada soberana.
            </p>
          </motion.div>
        </div>
        
        {/* Arrow indicator */}
        <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-colors">
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-cream/60" />
        </button>
      </section>

      <main className="container-soberana py-8 px-4">
        {/* XP e Streak Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 mb-8 -mt-16 relative z-20"
        >
          <div 
            className="bg-black/90 backdrop-blur-sm border border-secondary/30 rounded-xl p-4 cursor-pointer hover:border-secondary/60 transition-all shadow-[0_0_30px_rgba(166,144,97,0.15)]"
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
            className="bg-black/90 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 cursor-pointer hover:border-orange-500/60 transition-all shadow-[0_0_30px_rgba(249,115,22,0.1)]"
            onClick={() => navigate("/student/achievements")}
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-cream/60">Streak</span>
            </div>
            <p className="text-2xl font-bold text-cream">{gamificationStats?.streak_days || 0} dias</p>
          </div>
        </motion.div>

        {/* Diagnostic Banner */}
        <DiagnosticBanner />

        {/* Bem Vinda Cards - Estilo MestresAI */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-cream mb-6">
            Bem Vinda, {firstName}!
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 - Plataforma */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary/50 transition-all hover:shadow-[0_0_40px_rgba(166,144,97,0.15)]"
            >
              <div className="aspect-[4/3] relative">
                <img 
                  src={heroVariations} 
                  alt="Plataforma"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute top-3 left-3 bg-secondary text-black text-xs font-semibold px-3 py-1 rounded">
                  BEM VINDA À PLATAFORMA
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="font-serif text-2xl text-secondary font-bold">SOBERANA</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 - Comunidade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => navigate("/student/community")}
              className="relative group bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary/50 transition-all cursor-pointer hover:shadow-[0_0_40px_rgba(166,144,97,0.15)]"
            >
              <div className="aspect-[4/3] relative bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-cream mb-1">Acesse a Comunidade</h3>
                <p className="text-cream/50 text-sm">Conecte-se com outras Soberanas</p>
                <div className="absolute top-3 left-3 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold px-3 py-1 rounded">
                  COMUNIDADE
                </div>
              </div>
            </motion.div>

            {/* Card 3 - Conquistas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate("/student/achievements")}
              className="relative group bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary/50 transition-all cursor-pointer hover:shadow-[0_0_40px_rgba(166,144,97,0.15)]"
            >
              <div className="aspect-[4/3] relative bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-cream mb-1">Suas Conquistas</h3>
                <p className="text-cream/50 text-sm">Veja seu progresso e badges</p>
                <div className="absolute top-3 left-3 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold px-3 py-1 rounded">
                  GAMIFICAÇÃO
                </div>
              </div>
            </motion.div>
          </div>
        </section>

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
                <div key={i} className="aspect-[4/3] rounded-xl bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <CourseCard
                  key={enrollment.course_id}
                  id={enrollment.courses.id}
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
          ) : (
            <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-secondary/10">
              <BookOpen className="w-16 h-16 text-secondary/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cream mb-2">
                Nenhum curso ainda
              </h3>
              <p className="text-cream/60 max-w-md mx-auto">
                Você ainda não está matriculada em nenhum curso. Explore os cursos disponíveis abaixo.
              </p>
            </div>
          )}
        </section>

        {/* Available Courses */}
        {allCourses.filter(course => !enrollments.find(e => e.course_id === course.id)).length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-cream">
                Cursos Disponíveis
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses
                .filter(course => !enrollments.find(e => e.course_id === course.id))
                .map((course, index) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail_url}
                    isLocked
                    price={course.price}
                    index={index}
                    onPreview={() => setPreviewCourseId(course.id)}
                  />
                ))}
            </div>
          </section>
        )}
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
