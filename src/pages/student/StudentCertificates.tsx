import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Award,
  Download,
  ExternalLink,
  Calendar,
  CheckCircle
} from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  course_title: string;
  completion_date: string;
  issued_at: string;
}

interface CompletedCourse {
  course_id: string;
  course_title: string;
  completed_at: string;
  hasCertificate: boolean;
}

const StudentCertificates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch existing certificates
    const { data: certsData } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false });

    if (certsData) setCertificates(certsData);

    // Find completed courses
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, title)")
      .eq("user_id", user.id);

    if (enrollments) {
      const completedList: CompletedCourse[] = [];

      for (const enrollment of enrollments) {
        const course = enrollment.courses as any;
        if (!course) continue;

        // Check if all lessons are completed
        const { data: modules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", enrollment.course_id);

        if (!modules || modules.length === 0) continue;

        const moduleIds = modules.map(m => m.id);

        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .in("module_id", moduleIds);

        if (!lessons || lessons.length === 0) continue;

        const lessonIds = lessons.map(l => l.id);

        const { data: progress } = await supabase
          .from("progress")
          .select("lesson_id, completed, completed_at")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds)
          .eq("completed", true);

        const completedCount = progress?.length || 0;

        if (completedCount === lessons.length) {
          // Course is 100% complete
          const latestCompletion = progress?.reduce((latest, p) => {
            if (!latest || new Date(p.completed_at!) > new Date(latest)) {
              return p.completed_at!;
            }
            return latest;
          }, null as string | null);

          completedList.push({
            course_id: enrollment.course_id,
            course_title: course.title,
            completed_at: latestCompletion || new Date().toISOString(),
            hasCertificate: certsData?.some(c => c.course_title === course.title) || false
          });
        }
      }

      setCompletedCourses(completedList);
    }

    setLoading(false);
  };

  const generateCertificate = async (courseId: string, courseTitle: string) => {
    if (!user) return;

    setGenerating(courseId);

    // Get user profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const studentName = profile?.full_name || user.email?.split("@")[0] || "Estudante";

    // Generate certificate
    const { data, error } = await supabase.rpc("generate_certificate", {
      p_user_id: user.id,
      p_course_id: courseId,
      p_student_name: studentName,
      p_course_title: courseTitle
    });

    if (!error) {
      await fetchData();
    }

    setGenerating(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
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
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
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
              <span className="font-serif font-bold">Certificados</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 px-4">
        {/* Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Seus Certificados
          </h1>
          <p className="text-muted-foreground mb-8">
            Complete cursos para desbloquear seus certificados de conclusão.
          </p>

          {/* Existing Certificates */}
          {certificates.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
                Certificados Emitidos
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-primary via-marsala-light to-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <Award className="w-12 h-12 text-secondary" />
                        <span className="text-xs bg-primary-foreground/20 px-3 py-1 rounded-full">
                          {cert.certificate_number}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xl mb-2">
                        {cert.course_title}
                      </h3>
                      <p className="text-primary-foreground/80 mb-1">
                        {cert.student_name}
                      </p>
                      <p className="text-sm text-primary-foreground/60 flex items-center gap-1 mb-4">
                        <Calendar className="w-4 h-4" />
                        Concluído em {formatDate(cert.completion_date)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => window.open(`/certificate/${cert.certificate_number}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Courses ready for certificate */}
          {completedCourses.filter(c => !c.hasCertificate).length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
                Prontos para Emissão
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {completedCourses
                  .filter(c => !c.hasCertificate)
                  .map((course, index) => (
                    <motion.div
                      key={course.course_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
                        {course.course_title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Concluído em {formatDate(course.completed_at)}
                      </p>
                      <Button
                        onClick={() => generateCertificate(course.course_id, course.course_title)}
                        disabled={generating === course.course_id}
                        className="w-full bg-secondary hover:bg-secondary/90"
                      >
                        {generating === course.course_id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin mr-2" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Gerar Certificado
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {certificates.length === 0 && completedCourses.length === 0 && (
            <div className="bg-card rounded-2xl p-12 text-center border border-border/50">
              <Award className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                Nenhum certificado ainda
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete um curso para receber seu certificado de conclusão.
                Seus certificados ficarão disponíveis aqui.
              </p>
              <Button onClick={() => navigate("/student")} className="bg-primary hover:bg-primary/90">
                Ver Meus Cursos
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentCertificates;
