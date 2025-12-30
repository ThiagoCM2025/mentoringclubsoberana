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
  Search,
  Calendar,
  FileText,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StatsCard from "@/components/student/StatsCard";
import CourseCard from "@/components/student/CourseCard";
import ContinueWatching from "@/components/student/ContinueWatching";
import CoursePreviewModal from "@/components/student/CoursePreviewModal";

import { NotificationBell } from "@/components/student/NotificationBell";
import StudyReminderButton from "@/components/student/StudyReminderButton";
import { SoberanaLogo } from "@/components/brand/SoberanaLogo";
import ProgramCard from "@/components/student/ProgramCard";

import { programsList } from "@/data/programs";
import { programToCourseId } from "@/lib/programCourseMapping";
import { 
  SkeletonCourseGrid, 
  SkeletonHero, 
  SkeletonStats, 
  SkeletonWelcomeBanner,
  SkeletonChallenges,
  SkeletonCalendar,
  SkeletonLeaderboard,
  SkeletonLearningPaths,
  SkeletonQuickActions 
} from "@/components/ui/premium-skeleton";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import heroVariations from "@/assets/hero-variations.jpeg";
import { LearningPaths } from "@/components/student/LearningPaths";
import { AIAssistant } from "@/components/student/AIAssistant";
import PushNotificationPrompt from "@/components/student/PushNotificationPrompt";
import { useAchievementNotification } from "@/hooks/useAchievementNotification";
import { useRealtimeAchievements } from "@/hooks/useRealtimeAchievements";
import { BadgeCelebrationModal } from "@/components/student/BadgeCelebrationModal";


interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
}

interface EnrollmentWithCourse {
  course_id: string;
  courses: Course | null;
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
  const { stats: gamificationStats, calculateLevel, getCurrentLevelProgress, getXpForNextLevel, hasNearbyAchievement, leaderboard, loading: gamificationLoading } = useGamification();
  
  const showPulse = hasNearbyAchievement();
  const xpForNextLevel = gamificationStats ? getXpForNextLevel(calculateLevel(gamificationStats.xp)) : 500;
  const xpRemaining = gamificationStats ? xpForNextLevel - gamificationStats.xp : 500;
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
  const [dailyChallengesCount, setDailyChallengesCount] = useState(0);

  // Achievement notification - monitors and sends push when close to new badge/level
  useAchievementNotification();

  // Realtime achievements - listens for new badges and shows celebration modal
  const { newBadge, showCelebration, closeCelebration } = useRealtimeAchievements();

  const level = gamificationStats ? calculateLevel(gamificationStats.xp) : 1;
  const levelProgress = gamificationStats ? getCurrentLevelProgress(gamificationStats.xp) : 0;

  useEffect(() => {
    if (user) {
      fetchData();
      fetchDailyChallengesCount();
    }
  }, [user]);

  const fetchDailyChallengesCount = async () => {
    const { count } = await supabase
      .from("daily_challenges")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("challenge_type", "daily");
    
    setDailyChallengesCount(count || 0);
  };

  const fetchData = async () => {
    if (!user) return;

    try {
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
        // Observação: se o curso estiver "não publicado", a RLS pode ocultar a linha em `courses`,
        // retornando `courses: null` no join. Filtramos para evitar crash no dashboard.
        const normalized = (enrollmentData as unknown as EnrollmentWithCourse[]).filter(
          (e) => Boolean(e.courses)
        );

        setEnrollments(normalized);

        for (const enrollment of normalized) {
          await fetchCourseProgress(enrollment.course_id);
        }

        await fetchContinueWatching(normalized);
      }

      const { count } = await supabase
        .from("progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);

      setTotalCompleted(count || 0);
    } catch (error) {
      console.error("StudentDashboard fetchData error:", error);
    } finally {
      setLoading(false);
    }
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
      if (!enrollment.courses) continue;

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
              courseTitle: enrollment.courses!.title,
              thumbnail: enrollment.courses!.thumbnail_url,
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
    navigate("/", { replace: true });
  };

  const firstName = profile.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Aluna";

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Premium Navbar with Gradient */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-black via-zinc-900/90 to-black backdrop-blur-md border-b border-secondary/30 py-3 px-4 sticky top-0 z-50 shadow-[0_4px_30px_rgba(166,144,97,0.08)]"
      >
        <div className="container-soberana flex items-center justify-between">
          {/* Logo */}
          <SoberanaLogo size="md" />
          
          {/* Desktop Nav - Centro with Animated Underline */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student")}
              className="relative text-secondary font-medium hover:bg-secondary/10 group"
            >
              Início
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-secondary rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/favorites")}
              className="relative text-cream/70 hover:text-secondary hover:bg-secondary/10 group"
            >
              Favoritos
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-secondary rounded-full transition-all duration-300 group-hover:w-4/5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/community")}
              className="relative text-cream/70 hover:text-secondary hover:bg-secondary/10 group"
            >
              Comunidade
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-secondary rounded-full transition-all duration-300 group-hover:w-4/5" />
            </Button>
          </nav>

          {/* Desktop Icons - Direita */}
          <div className="hidden md:flex items-center gap-2">
            {/* Mini XP Badge with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/30 cursor-pointer hover:bg-secondary/20 transition-colors ${showPulse ? 'animate-pulse-subtle' : ''}`}
                    onClick={() => navigate("/student/achievements")}
                  >
                    <Star className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-medium text-cream">{gamificationStats?.xp || 0}</span>
                    {showPulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                      </span>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-zinc-900 border-secondary/30 text-cream">
                  <div className="text-center space-y-1">
                    <p className="font-medium text-secondary">Nível {level}</p>
                    <p className="text-xs text-cream/70">{xpRemaining} XP para o nível {level + 1}</p>
                    <Progress value={levelProgress} className="h-1.5 w-24 bg-secondary/20" />
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Mini Streak Badge with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 cursor-pointer hover:bg-orange-500/20 transition-colors ${showPulse ? 'animate-pulse-subtle' : ''}`}
                    onClick={() => navigate("/student/achievements")}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-cream">{gamificationStats?.streak_days || 0}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-zinc-900 border-secondary/30 text-cream">
                  <div className="text-center space-y-1">
                    <p className="font-medium text-orange-500">🔥 Sequência de Estudos</p>
                    <p className="text-xs text-cream/70">
                      {gamificationStats?.streak_days === 0 
                        ? "Comece a estudar hoje!" 
                        : gamificationStats?.streak_days === 1 
                          ? "1 dia consecutivo" 
                          : `${gamificationStats?.streak_days} dias consecutivos`}
                    </p>
                    <p className="text-xs text-cream/50">Continue estudando para manter!</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-5 bg-secondary/20 mx-1" />
            
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
      </motion.header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-secondary/20 p-4"
          >
            {/* Mini XP/Streak Badges - Mobile */}
            <div className="flex items-center justify-center gap-3 pb-4 mb-4 border-b border-secondary/20">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 cursor-pointer hover:bg-secondary/20 transition-colors ${showPulse ? 'animate-pulse-subtle' : ''}`}
                onClick={() => { navigate("/student/achievements"); setMobileMenuOpen(false); }}
              >
                <Star className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-cream">{gamificationStats?.xp || 0} XP</span>
                {showPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 cursor-pointer hover:bg-orange-500/20 transition-colors ${showPulse ? 'animate-pulse-subtle' : ''}`}
                onClick={() => { navigate("/student/achievements"); setMobileMenuOpen(false); }}
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-cream">{gamificationStats?.streak_days || 0} dias</span>
              </motion.div>
            </div>

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
        
        {/* Floating Golden Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-secondary/50"
              initial={{ 
                x: `${Math.random() * 100}%`, 
                y: "110%", 
                opacity: 0 
              }}
              animate={{ 
                y: "-10%", 
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
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

        {/* Bem Vinda Cards - Estilo Premium com Stagger */}
        <section className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-serif font-bold text-cream mb-6"
          >
            Bem Vinda, {firstName}!
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {/* Card 1 - Plataforma */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 100, damping: 15 }
                }
              }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="relative group bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary/50 transition-all hover:shadow-lg"
            >
              <div className="aspect-[4/3] relative">
                <img 
                  src={heroVariations} 
                  alt="Plataforma"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded"
                >
                  BEM VINDA À PLATAFORMA
                </motion.div>
                <div className="absolute bottom-4 left-4">
                  <span className="font-serif text-2xl text-secondary font-bold drop-shadow-lg">SOBERANA</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 - Comunidade */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 100, damping: 15 }
                }
              }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => navigate("/student/community")}
              className="relative group bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary/50 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="aspect-[4/3] relative bg-gradient-to-br from-zinc-800 to-black flex flex-col items-center justify-center">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <MessageCircle className="w-8 h-8 text-secondary" />
                </motion.div>
                <h3 className="text-lg font-semibold text-cream mb-1">Acesse a Comunidade</h3>
                <p className="text-cream/60 text-sm">Conecte-se com outras Soberanas</p>
                <div className="absolute top-3 left-3 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold px-3 py-1 rounded">
                  COMUNIDADE
                </div>
              </div>
            </motion.div>

            {/* Card 3 - Conquistas */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 100, damping: 15 }
                }
              }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => navigate("/student/achievements")}
              className="relative group bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary/50 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="aspect-[4/3] relative bg-gradient-to-br from-zinc-800 to-black flex flex-col items-center justify-center">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Trophy className="w-8 h-8 text-secondary" />
                </motion.div>
                <h3 className="text-lg font-semibold text-cream mb-1">Suas Conquistas</h3>
                <p className="text-cream/60 text-sm">Veja seu progresso e badges</p>
                <div className="absolute top-3 left-3 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold px-3 py-1 rounded">
                  GAMIFICAÇÃO
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

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
            <SkeletonCourseGrid count={3} className="[&>div]:bg-zinc-900 [&>div]:border-secondary/20" />
          ) : enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <CourseCard
                  key={enrollment.course_id}
                  id={enrollment.courses!.id}
                  title={enrollment.courses!.title}
                  description={enrollment.courses!.description}
                  thumbnail={enrollment.courses!.thumbnail_url}
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

        {/* Card Pulsante - Sua Evolução */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/student/achievements")}
            className="relative cursor-pointer bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-2xl p-6 border border-secondary/30 overflow-hidden group"
          >
            {/* Efeito shimmer animado de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Ícone pulsante */}
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center ${showPulse ? 'animate-pulse' : ''}`}>
                    <Trophy className="w-8 h-8 text-secondary" />
                  </div>
                  {/* Ping indicator quando há conquistas próximas */}
                  {showPulse && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-ping" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-serif font-bold text-cream mb-1">
                    Sua Evolução
                  </h3>
                  <p className="text-cream/60 text-sm">
                    Desafios, calendário de estudos e conquistas
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-secondary">
                {dailyChallengesCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {dailyChallengesCount} desafios
                  </span>
                )}
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar
                </span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* A Jornada Soberana - Programas */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-cream">
                A Jornada Soberana
              </h2>
              <p className="text-cream/50 text-sm mt-1">
                Conheça nossos programas e evolua sua carreira
              </p>
            </div>
            <a 
              href="/#jornada"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="outline" 
                size="sm"
                className="border-secondary/30 text-secondary hover:bg-secondary/10"
              >
                Ver no Site
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.4
                }
              }
            }}
          >
            {programsList.map((program, index) => {
              const courseId = programToCourseId[program.slug];
              const isEnrolled = enrollments.some(e => e.course_id === courseId);
              return (
                <ProgramCard 
                  key={program.slug} 
                  program={program} 
                  index={index}
                  isEnrolled={isEnrolled}
                  courseId={courseId}
                />
              );
            })}
          </motion.div>
        </section>

        {/* Learning Paths */}
        <section className="mb-12">
          <LearningPaths />
        </section>

        {/* Quick Actions Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <Sparkles className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-serif font-bold text-cream">Ações Rápidas</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.5
                }
              }
            }}
          >
            {/* WhatsApp Comunidade */}
            <motion.a
              href="https://wa.me/5511993563468?text=Olá! Sou aluna da plataforma Soberana e gostaria de entrar no grupo da comunidade."
              target="_blank"
              rel="noopener noreferrer"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 150, damping: 12 }
                }
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.03,
                boxShadow: "0 0 30px rgba(37, 211, 102, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-5 bg-zinc-900 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all cursor-pointer overflow-hidden hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-cream text-sm mb-1">WhatsApp</h3>
                <p className="text-cream/60 text-xs">Grupo da Comunidade</p>
                <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-cream/50 group-hover:text-green-600 transition-colors" />
              </div>
            </motion.a>

            {/* Agendar Mentoria */}
            <motion.a
              href="https://wa.me/5511993563468?text=Olá Fabiana! Sou aluna da plataforma e gostaria de agendar uma mentoria individual."
              target="_blank"
              rel="noopener noreferrer"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 150, damping: 12 }
                }
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.03,
                boxShadow: "0 0 30px rgba(166, 144, 97, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-5 bg-zinc-900 rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all cursor-pointer overflow-hidden hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-cream text-sm mb-1">Agendar</h3>
                <p className="text-cream/60 text-xs">Mentoria Individual</p>
                <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-cream/50 group-hover:text-secondary transition-colors" />
              </div>
            </motion.a>

            {/* Materiais */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 150, damping: 12 }
                }
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.03,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student/favorites")}
              className="group relative p-5 bg-zinc-900 rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all cursor-pointer overflow-hidden hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-cream text-sm mb-1">Materiais</h3>
                <p className="text-cream/60 text-xs">Aulas Favoritas</p>
              </div>
            </motion.div>

            {/* Certificados */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 150, damping: 12 }
                }
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.03,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student/certificates")}
              className="group relative p-5 bg-zinc-900 rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all cursor-pointer overflow-hidden hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Medal className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-cream text-sm mb-1">Certificados</h3>
                <p className="text-cream/60 text-xs">Seus Diplomas</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats com Stagger */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.6
              }
            }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatsCard
              icon={BookOpen}
              label="Cursos Ativos"
              value={enrollments.length}
              color="primary"
              index={0}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatsCard
              icon={PlayCircle}
              label="Aulas Concluídas"
              value={totalCompleted}
              color="green"
              index={1}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatsCard
              icon={Clock}
              label="Horas de Estudo"
              value={Math.round(totalCompleted * 0.25)}
              color="secondary"
              index={2}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatsCard
              icon={Award}
              label="Certificados"
              value={Object.values(progress).filter(p => p === 100).length}
              color="accent"
              index={3}
            />
          </motion.div>
        </motion.div>

        {/* Support Section */}
        <section className="py-8 text-center border-t border-secondary/10 mt-8">
          <p className="text-cream/60 text-sm mb-3">Precisa de ajuda?</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-secondary hover:bg-secondary/10"
            onClick={() => window.open("https://wa.me/5511993563468?text=Olá! Preciso de ajuda com a plataforma Soberana.", "_blank")}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com Suporte
          </Button>
        </section>
      </main>

      {/* Course Preview Modal */}
      <CoursePreviewModal
        courseId={previewCourseId}
        isOpen={!!previewCourseId}
        onClose={() => setPreviewCourseId(null)}
      />

      {/* AI Assistant */}
      <AIAssistant />
      
      {/* Push Notification Prompt */}
      <PushNotificationPrompt />

      {/* Badge Celebration Modal */}
      <BadgeCelebrationModal 
        badge={newBadge}
        isOpen={showCelebration}
        onClose={closeCelebration}
      />
    </div>
  );
};

export default StudentDashboard;
