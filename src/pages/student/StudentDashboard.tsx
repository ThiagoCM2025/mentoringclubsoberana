import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  Award,
  LogOut,
  User,
  ChevronRight,
  GraduationCap
} from "lucide-react";
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

interface ProgressData {
  lesson_id: string;
  completed: boolean;
}

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });
  const [loading, setLoading] = useState(true);

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
    }

    setLoading(false);
  };

  const fetchCourseProgress = async (courseId: string) => {
    if (!user) return;

    // Get all lessons for this course
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    if (!modules || modules.length === 0) {
      setProgress(prev => ({ ...prev, [courseId]: 0 }));
      return;
    }

    const moduleIds = modules.map(m => m.id);
    
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    if (!lessons || lessons.length === 0) {
      setProgress(prev => ({ ...prev, [courseId]: 0 }));
      return;
    }

    const lessonIds = lessons.map(l => l.id);
    
    const { data: progressData } = await supabase
      .from("progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    const completedCount = progressData?.filter((p: ProgressData) => p.completed).length || 0;
    const percentage = Math.round((completedCount / lessons.length) * 100);
    
    setProgress(prev => ({ ...prev, [courseId]: percentage }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profile.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Aluna";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Soberana" className="w-10 h-10 object-contain" />
            <span className="font-serif font-bold text-xl">Área do Aluno</span>
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue sua jornada para se tornar uma advogada soberana.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { icon: BookOpen, label: "Cursos Ativos", value: enrollments.length },
            { icon: PlayCircle, label: "Aulas Assistidas", value: Object.values(progress).reduce((a, b) => a + b, 0) || 0 },
            { icon: Clock, label: "Horas de Estudo", value: "0" },
            { icon: Award, label: "Certificados", value: "0" },
          ].map((stat, index) => (
            <div key={index} className="card-elegant p-4">
              <stat.icon className="w-8 h-8 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* My Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Meus Cursos
            </h2>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elegant p-4 animate-pulse">
                  <div className="w-full h-40 bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="card-elegant p-12 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                Nenhum curso ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não está matriculada em nenhum curso.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href="/#produtos">Conhecer Cursos</a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <motion.div
                  key={enrollment.course_id}
                  whileHover={{ y: -4 }}
                  className="card-elegant overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/student/course/${enrollment.course_id}`)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary to-marsala-light">
                    {enrollment.courses.thumbnail_url ? (
                      <img
                        src={enrollment.courses.thumbnail_url}
                        alt={enrollment.courses.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-16 h-16 text-primary-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-lg text-foreground mb-2 line-clamp-2">
                      {enrollment.courses.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {enrollment.courses.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">
                          {progress[enrollment.course_id] || 0}%
                        </span>
                      </div>
                      <Progress value={progress[enrollment.course_id] || 0} className="h-2" />
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 text-secondary hover:text-secondary group"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;