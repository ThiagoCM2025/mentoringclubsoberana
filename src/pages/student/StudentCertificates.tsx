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
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";

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

    const { data: certsData } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false });

    if (certsData) setCertificates(certsData);

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, title)")
      .eq("user_id", user.id);

    if (enrollments) {
      const completedList: CompletedCourse[] = [];

      for (const enrollment of enrollments) {
        const course = enrollment.courses as any;
        if (!course) continue;

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const studentName = profile?.full_name || user.email?.split("@")[0] || "Estudante";

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-secondary/20 py-4 px-4 sticky top-0 z-50">
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
              <img src={isotipoGold} alt="Soberana" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]" />
              <div className="flex flex-col leading-tight">
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase">
                  Mentoring
                </span>
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase -mt-0.5">
                  Club
                </span>
                <span className="font-serif font-bold text-secondary text-sm tracking-wider mt-0.5">
                  SOBERANA
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif font-bold text-cream mb-2">
            Seus Certificados
          </h1>
          <p className="text-cream/50 mb-8">
            Complete cursos para desbloquear seus certificados de conclusão.
          </p>

          {/* Existing Certificates */}
          {certificates.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-serif font-semibold text-cream mb-4">
                Certificados Emitidos
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-2xl p-6 text-cream relative overflow-hidden border border-secondary/30 glow-gold"
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <Award className="w-12 h-12 text-secondary" />
                        <span className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-full">
                          {cert.certificate_number}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xl mb-2">
                        {cert.course_title}
                      </h3>
                      <p className="text-cream/70 mb-1">
                        {cert.student_name}
                      </p>
                      <p className="text-sm text-cream/50 flex items-center gap-1 mb-4">
                        <Calendar className="w-4 h-4" />
                        Concluído em {formatDate(cert.completion_date)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-secondary hover:bg-secondary/90 text-black btn-glow-gold"
                          onClick={() => window.open(`/certificate/${cert.certificate_number}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-secondary/30 text-secondary hover:bg-secondary/10"
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
              <h2 className="text-xl font-serif font-semibold text-cream mb-4">
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
                      className="bg-zinc-900 rounded-xl p-6 border border-secondary/10 card-glow-gold"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="font-serif font-semibold text-lg text-cream mb-1">
                        {course.course_title}
                      </h3>
                      <p className="text-sm text-cream/50 mb-4">
                        Concluído em {formatDate(course.completed_at)}
                      </p>
                      <Button
                        onClick={() => generateCertificate(course.course_id, course.course_title)}
                        disabled={generating === course.course_id}
                        className="w-full bg-secondary hover:bg-secondary/90 text-black btn-glow-gold"
                      >
                        {generating === course.course_id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
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
            <div className="bg-zinc-900 rounded-2xl p-12 text-center border border-secondary/10">
              <Award className="w-20 h-20 text-cream/30 mx-auto mb-6" />
              <h3 className="text-xl font-serif font-semibold text-cream mb-2">
                Nenhum certificado ainda
              </h3>
              <p className="text-cream/50 mb-6 max-w-md mx-auto">
                Complete um curso para receber seu certificado de conclusão.
                Seus certificados ficarão disponíveis aqui.
              </p>
              <Button onClick={() => navigate("/student")} className="bg-secondary hover:bg-secondary/90 text-black btn-glow-gold">
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
