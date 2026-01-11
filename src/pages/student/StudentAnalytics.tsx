import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentSidebar from "@/components/student/StudentSidebar";
import { MobileBottomNav } from "@/components/student/MobileBottomNav";
import { StudyCalendar } from "@/components/student/StudyCalendar";
import { 
  ArrowLeft,
  Clock,
  BookOpen,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBrazilNow } from "@/lib/dateUtils";

const COLORS = ['hsl(38, 30%, 51%)', 'hsl(350, 100%, 27%)', 'hsl(43, 100%, 83%)', 'hsl(160, 60%, 45%)', 'hsl(220, 70%, 50%)'];

interface CourseProgress {
  courseName: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface DailyStudy {
  date: string;
  dayName: string;
  minutes: number;
  lessons: number;
}

const StudentAnalytics = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [coursesInProgress, setCoursesInProgress] = useState(0);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
  const [weeklyData, setWeeklyData] = useState<DailyStudy[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [avgSessionMinutes, setAvgSessionMinutes] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    if (profile) setStudentName(profile.full_name || "Aluna");

    // Fetch gamification data
    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (gamification) {
      setXp(gamification.xp);
      setStreak(gamification.streak_days);
      setTotalHours(Math.round(gamification.total_study_minutes / 60));
      setTotalLessonsCompleted(gamification.total_lessons_completed);
    }

    // Fetch enrollments and progress
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, title)")
      .eq("user_id", user.id);

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get all lessons for enrolled courses
      const { data: modules } = await supabase
        .from("modules")
        .select("id, course_id")
        .in("course_id", courseIds);

      if (modules) {
        const moduleIds = modules.map(m => m.id);
        
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id, module_id")
          .in("module_id", moduleIds);

        const { data: progress } = await supabase
          .from("progress")
          .select("lesson_id, completed, completed_at, progress_seconds")
          .eq("user_id", user.id)
          .eq("completed", true);

        if (lessons && progress) {
          // Calculate course progress
          const courseLessons = new Map<string, string[]>();
          modules.forEach(m => {
            if (!courseLessons.has(m.course_id)) {
              courseLessons.set(m.course_id, []);
            }
          });

          lessons.forEach(l => {
            const module = modules.find(m => m.id === l.module_id);
            if (module) {
              const existing = courseLessons.get(module.course_id) || [];
              courseLessons.set(module.course_id, [...existing, l.id]);
            }
          });

          const completedLessonIds = new Set(progress.map(p => p.lesson_id));
          
          let completed = 0;
          let inProgress = 0;
          const courseProgressData: CourseProgress[] = [];

          enrollments.forEach(enrollment => {
            const courseId = enrollment.course_id;
            const course = enrollment.courses as { id: string; title: string } | null;
            const lessonIds = courseLessons.get(courseId) || [];
            const completedCount = lessonIds.filter(id => completedLessonIds.has(id)).length;
            const totalCount = lessonIds.length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            if (progressPct === 100) {
              completed++;
            } else if (completedCount > 0) {
              inProgress++;
            }

            if (course && totalCount > 0) {
              courseProgressData.push({
                courseName: course.title.length > 25 ? course.title.substring(0, 22) + '...' : course.title,
                progress: progressPct,
                completedLessons: completedCount,
                totalLessons: totalCount
              });
            }
          });

          setCompletedCourses(completed);
          setCoursesInProgress(inProgress);
          setCourseProgress(courseProgressData);

          // Calculate weekly study data - usar data de Brasília
          const today = getBrazilNow();
          const weekStart = startOfWeek(today, { weekStartsOn: 0 });
          const days = eachDayOfInterval({ start: weekStart, end: today });

          const dailyData: DailyStudy[] = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayProgress = progress.filter(p => 
              p.completed_at && format(new Date(p.completed_at), 'yyyy-MM-dd') === dayStr
            );
            const totalSeconds = dayProgress.reduce((acc, p) => acc + (p.progress_seconds || 0), 0);
            
            return {
              date: dayStr,
              dayName: format(day, 'EEE', { locale: ptBR }),
              minutes: Math.round(totalSeconds / 60),
              lessons: dayProgress.length
            };
          });

          setWeeklyData(dailyData);

          // Calculate average session
          if (progress.length > 0) {
            const totalSeconds = progress.reduce((acc, p) => acc + (p.progress_seconds || 0), 0);
            setAvgSessionMinutes(Math.round(totalSeconds / progress.length / 60));
          }
        }
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <StudentSidebar
          onSignOut={handleSignOut}
          studentName={studentName}
          xp={xp}
          streak={streak}
        />
      </div>

      {/* Main Content */}
      <main className="lg:ml-[280px] pb-24 lg:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-secondary/20 px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-cream/70 hover:text-cream"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif font-bold text-cream">Analytics</h1>
              <p className="text-cream/60 text-sm">Estatísticas detalhadas do seu progresso</p>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cream">{totalHours}h</p>
                    <p className="text-xs text-cream/60">Total estudado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cream">{totalLessonsCompleted}</p>
                    <p className="text-xs text-cream/60">Aulas concluídas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cream">{streak}</p>
                    <p className="text-xs text-cream/60">Dias seguidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cream">{avgSessionMinutes}min</p>
                    <p className="text-xs text-cream/60">Média por sessão</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Progress */}
            <Card className="bg-zinc-900 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-cream flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Progresso Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(166,144,97,0.1)" />
                      <XAxis 
                        dataKey="dayName" 
                        tick={{ fill: 'rgba(242,241,239,0.6)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(166,144,97,0.2)' }}
                      />
                      <YAxis 
                        tick={{ fill: 'rgba(242,241,239,0.6)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(166,144,97,0.2)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          border: '1px solid rgba(166,144,97,0.3)',
                          borderRadius: '8px',
                          color: '#F2F1EF'
                        }}
                        formatter={(value: number) => [`${value} min`, 'Tempo estudado']}
                      />
                      <Bar dataKey="minutes" fill="hsl(38, 30%, 51%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card className="bg-zinc-900 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-cream flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  Progresso por Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courseProgress.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={courseProgress} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(166,144,97,0.1)" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          tick={{ fill: 'rgba(242,241,239,0.6)', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(166,144,97,0.2)' }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="courseName" 
                          width={120}
                          tick={{ fill: 'rgba(242,241,239,0.6)', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(166,144,97,0.2)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid rgba(166,144,97,0.3)',
                            borderRadius: '8px',
                            color: '#F2F1EF'
                          }}
                          formatter={(value: number, name: string, props: any) => [
                            `${props.payload.completedLessons}/${props.payload.totalLessons} aulas (${value}%)`,
                            'Progresso'
                          ]}
                        />
                        <Bar dataKey="progress" fill="hsl(350, 100%, 27%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-cream/50">
                    Nenhum curso iniciado ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Study Calendar Heatmap */}
          <Card className="bg-zinc-900 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-cream flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Calendário de Estudos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudyCalendar />
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-secondary mx-auto mb-3" />
                <p className="text-3xl font-bold text-cream">{completedCourses}</p>
                <p className="text-cream/70">Cursos Concluídos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-cream">{coursesInProgress}</p>
                <p className="text-cream/70">Em Andamento</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-cream">{xp}</p>
                <p className="text-cream/70">XP Total</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default StudentAnalytics;
