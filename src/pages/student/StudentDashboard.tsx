import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  Award,
  Flame,
  Star,
  Trophy,
  TrendingUp,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/student/StatsCard";
import CourseCard from "@/components/student/CourseCard";
import ContinueWatching from "@/components/student/ContinueWatching";
import brandLogo from "@/assets/brand-logo.png";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
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
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [courseStats, setCourseStats] = useState<Record<string, { total: number; completed: number }>>({});
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (profileData) setProfile(profileData);

    // Fetch enrollments with courses
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `)
      .eq("user_id", user.id);

    if (enrollmentData) {
      setEnrollments(enrollmentData as unknown as EnrollmentWithCourse[]);
      
      // Fetch progress for each course
      for (const enrollment of enrollmentData) {
        await fetchCourseProgress(enrollment.course_id);
      }

      // Fetch continue watching
      await fetchContinueWatching(enrollmentData as unknown as EnrollmentWithCourse[]);
    }

    // Fetch total completed lessons
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
      // Get modules for this course
      const { data: modules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", enrollment.course_id);

      if (!modules || modules.length === 0) continue;

      const moduleIds = modules.map(m => m.id);

      // Get lessons
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, duration_minutes")
        .in("module_id", moduleIds)
        .order("order_index");

      if (!lessons || lessons.length === 0) continue;

      // Get progress
      const lessonIds = lessons.map(l => l.id);
      const { data: progressData } = await supabase
        .from("progress")
        .select("lesson_id, progress_seconds, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      // Find lessons in progress (started but not completed)
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Soberana" className="w-10 h-10 object-contain" />
            <span className="font-serif font-bold text-xl hidden sm:block">Área do Aluno</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground"
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
            className="md:hidden absolute top-full left-0 right-0 bg-primary border-t border-primary-foreground/10 p-4"
          >
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="justify-start text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="container-soberana py-8 px-4">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-marsala-light to-primary p-8 mb-8"
        >
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-2">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-primary-foreground/80 max-w-xl">
              Continue sua jornada para se tornar uma advogada soberana. 
              Você está indo muito bem!
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute right-20 top-0 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
        </motion.div>

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

        {/* Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Meus Cursos
            </h2>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] rounded-xl bg-muted mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-12 text-center border border-border/50"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                Nenhum curso ainda
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Você ainda não está matriculada em nenhum curso. 
                Explore nossos programas e comece sua transformação!
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href="/#produtos">Conhecer Cursos</a>
              </Button>
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
      </main>
    </div>
  );
};

export default StudentDashboard;
