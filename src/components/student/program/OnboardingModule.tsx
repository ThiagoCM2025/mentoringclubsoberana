import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Play,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagnosticForm } from "@/components/student/DiagnosticForm";

interface WelcomeVideoLesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  video_url: string | null;
  completed: boolean;
}

interface OnboardingModuleProps {
  courseId: string;
  calendarLink?: string;
  onDiagnosticComplete?: () => void;
  welcomeVideo?: WelcomeVideoLesson | null;
}

export const OnboardingModule = ({
  courseId,
  calendarLink = "https://calendar.app.google/4SsS6E6crkZ2wQDAA",
  onDiagnosticComplete,
  welcomeVideo
}: OnboardingModuleProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [filledFromCourse, setFilledFromCourse] = useState<string | null>(null);
  const [showDiagnosticForm, setShowDiagnosticForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkDiagnosticStatus();
    }
  }, [user]);

  const checkDiagnosticStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("student_diagnostics")
        .select("*, filled_from_course:filled_from_course_id(title)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setDiagnosticCompleted(data.completed || false);
        
        // Get origin course name if filled from another course
        if (data.filled_from_course && typeof data.filled_from_course === 'object' && 'title' in data.filled_from_course) {
          setFilledFromCourse(data.filled_from_course.title as string);
        }
        
        // Calculate progress based on filled fields
        const fields = [
          data.practice_area,
          data.years_practicing,
          data.has_office,
          data.monthly_revenue,
          data.digital_presence,
          data.marketing_knowledge,
          data.main_challenges,
          data.main_goals,
          data.weekly_study_hours,
          data.revenue_goal
        ];
        const filledFields = fields.filter(f => f !== null && f !== undefined).length;
        setDiagnosticProgress(Math.round((filledFields / fields.length) * 100));
      }
    } catch (error) {
      console.error("Error checking diagnostic status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosticComplete = () => {
    setDiagnosticCompleted(true);
    setDiagnosticProgress(100);
    setShowDiagnosticForm(false);
    onDiagnosticComplete?.();
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-secondary/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary/10 rounded w-1/3" />
          <div className="h-4 bg-secondary/10 rounded w-2/3" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Glow effect */}
        {!diagnosticCompleted && (
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-1 bg-secondary/20 rounded-3xl blur-xl"
          />
        )}

        <Card className={cn(
          "relative overflow-hidden border-2 bg-gradient-to-br from-zinc-900 to-black",
          diagnosticCompleted ? "border-green-500/50" : "border-secondary"
        )}>
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary/20 to-transparent p-6 border-b border-secondary/20">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                diagnosticCompleted ? "bg-green-500/20" : "bg-secondary/20"
              )}>
                {diagnosticCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                ) : (
                  <Sparkles className="w-8 h-8 text-secondary" />
                )}
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mb-2",
                    diagnosticCompleted ? "border-green-500 text-green-400" : "border-secondary text-secondary"
                  )}
                >
                  Módulo 0 • Ponto de Partida
                </Badge>
                <h2 className="text-2xl font-serif font-bold text-cream">
                  Raio X para os +50k
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Welcome Video - Step 0 */}
            {welcomeVideo && (
              <motion.button
                onClick={() => navigate(`/student/lesson/${welcomeVideo.id}`)}
                whileHover={{ scale: 1.01 }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 hover:bg-secondary/10 border border-secondary/20 transition-all text-left group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  welcomeVideo.completed 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-secondary/20 text-secondary"
                )}>
                  {welcomeVideo.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-cream/50 mb-0.5">Passo 0</p>
                  <p className="font-medium text-cream group-hover:text-secondary transition-colors">
                    {welcomeVideo.title}
                  </p>
                  {welcomeVideo.duration_minutes && (
                    <p className="text-xs text-cream/40 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {welcomeVideo.duration_minutes} min
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="border-secondary/30 text-secondary text-xs">
                  Vídeo
                </Badge>
              </motion.button>
            )}

            {/* Welcome message */}
            <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/20">
              <p className="text-cream/80 leading-relaxed">
                <span className="text-secondary font-semibold">Bem-vinda, Soberana!</span> Este é o primeiro dia da tua nova advocacia. 
                Antes de qualquer aula, precisamos de entender onde o teu negócio está para traçarmos o caminho até aos <span className="text-secondary font-bold">+50k/mês</span>.
              </p>
            </div>

            {/* Steps */}
            <div className="grid gap-4">
              {/* Step 1: Diagnostic */}
              <div className={cn(
                "relative rounded-xl p-5 border transition-all",
                diagnosticCompleted 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-secondary/10 border-secondary/30"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    diagnosticCompleted ? "bg-green-500/20" : "bg-secondary/20"
                  )}>
                    {diagnosticCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <ClipboardCheck className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-cream mb-1">
                      1. Preencha o Diagnóstico Inicial Soberano
                    </h3>
                    <p className="text-sm text-cream/60 mb-3">
                      Sem ele, não conseguiremos realizar as tuas sessões individuais com foco total no teu lucro.
                    </p>

                    {!diagnosticCompleted && diagnosticProgress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-cream/50 mb-1">
                          <span>Progresso</span>
                          <span>{diagnosticProgress}%</span>
                        </div>
                        <Progress value={diagnosticProgress} className="h-1.5 bg-secondary/20" />
                      </div>
                    )}

                    {!diagnosticCompleted && (
                      <Button
                        onClick={() => setShowDiagnosticForm(true)}
                        className="bg-secondary hover:bg-secondary/90 text-black"
                      >
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        {diagnosticProgress > 0 ? "Continuar Diagnóstico" : "Preencher Diagnóstico"}
                      </Button>
                    )}

                    {diagnosticCompleted && (
                      <div className="space-y-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Diagnóstico Completo
                        </Badge>
                        {filledFromCourse && (
                          <p className="text-xs text-cream/50 italic">
                            Preenchido via {filledFromCourse}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Schedule Onboarding */}
              <div className={cn(
                "relative rounded-xl p-5 border transition-all",
                !diagnosticCompleted && "opacity-60",
                diagnosticCompleted ? "bg-secondary/10 border-secondary/30" : "bg-zinc-800/50 border-zinc-700"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    diagnosticCompleted ? "bg-secondary/20" : "bg-zinc-700"
                  )}>
                    {diagnosticCompleted ? (
                      <Calendar className="w-5 h-5 text-secondary" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-cream mb-1">
                      2. Agende seu Onboarding Individual
                    </h3>
                    <p className="text-sm text-cream/60 mb-3">
                      Encontro individual para traçar sua estratégia personalizada rumo aos +50k.
                    </p>

                    {diagnosticCompleted ? (
                      <Button
                        asChild
                        className="bg-secondary hover:bg-secondary/90 text-black"
                      >
                        <a href={calendarLink} target="_blank" rel="noopener noreferrer">
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar Onboarding
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-cream/40 italic">
                        Complete o diagnóstico para liberar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Diagnostic Form Modal */}
      {showDiagnosticForm && (
        <DiagnosticForm
          onComplete={handleDiagnosticComplete}
          onClose={() => setShowDiagnosticForm(false)}
          initialStep={1}
          courseId={courseId}
        />
      )}
    </>
  );
};
