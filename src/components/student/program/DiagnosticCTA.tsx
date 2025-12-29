import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DiagnosticForm } from "@/components/student/DiagnosticForm";
import { cn } from "@/lib/utils";

// Função para calcular o step correto baseado em campos preenchidos
function calculateResumeStep(data: {
  years_practicing?: string | null;
  practice_area?: string | null;
  has_office?: boolean | null;
  office_size?: string | null;
  monthly_revenue?: string | null;
  revenue_goal?: string | null;
  main_challenges?: string[] | null;
  main_goals?: string[] | null;
  marketing_knowledge?: string | null;
  digital_presence?: string | null;
  referral_source?: string | null;
  weekly_study_hours?: string | null;
}): number {
  // Step 1: years_practicing, practice_area, has_office
  if (!data.years_practicing || !data.practice_area || data.has_office === null) return 1;
  
  // Step 2: office_size, monthly_revenue
  if (!data.office_size || !data.monthly_revenue) return 2;
  
  // Step 3: revenue_goal, main_challenges, main_goals
  if (!data.revenue_goal || !data.main_challenges?.length || !data.main_goals?.length) return 3;
  
  // Step 4: marketing_knowledge, digital_presence, referral_source
  if (!data.marketing_knowledge || !data.digital_presence || !data.referral_source) return 4;
  
  // Step 5: weekly_study_hours
  if (!data.weekly_study_hours) return 5;
  
  return 5; // Completed all
}

interface DiagnosticCTAProps {
  courseId: string;
  onComplete?: () => void;
  className?: string;
}

export const DiagnosticCTA = ({ courseId, onComplete, className }: DiagnosticCTAProps) => {
  const { user } = useAuth();
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [filledFromCourse, setFilledFromCourse] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeStep, setResumeStep] = useState(1);

  useEffect(() => {
    if (user) {
      checkDiagnosticStatus();
    }
  }, [user]);

  const checkDiagnosticStatus = async () => {
    if (!user) return;

    try {
      const { data: diagnostic } = await supabase
        .from("student_diagnostics")
        .select("*, filled_from_course_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (diagnostic) {
        setDiagnosticCompleted(diagnostic.completed || false);
        
        // Calculate progress correctly (checking each field individually)
        let filled = 0;
        if (diagnostic.years_practicing) filled++;
        if (diagnostic.practice_area) filled++;
        if (diagnostic.has_office !== null && diagnostic.has_office !== undefined) filled++;
        if (diagnostic.office_size) filled++;
        if (diagnostic.monthly_revenue) filled++;
        if (diagnostic.revenue_goal) filled++;
        if (diagnostic.main_challenges && diagnostic.main_challenges.length > 0) filled++;
        if (diagnostic.main_goals && diagnostic.main_goals.length > 0) filled++;
        if (diagnostic.marketing_knowledge) filled++;
        if (diagnostic.digital_presence) filled++;
        if (diagnostic.referral_source) filled++;
        if (diagnostic.weekly_study_hours) filled++;
        
        setDiagnosticProgress(Math.round((filled / 12) * 100));

        // Calculate resume step based on filled fields
        const step = calculateResumeStep(diagnostic);
        setResumeStep(step);

        // Check origin course
        if (diagnostic.filled_from_course_id && diagnostic.filled_from_course_id !== courseId) {
          const { data: originCourse } = await supabase
            .from("courses")
            .select("title")
            .eq("id", diagnostic.filled_from_course_id)
            .maybeSingle();
          
          if (originCourse) {
            setFilledFromCourse(originCourse.title);
          }
        }
      }
    } catch (error) {
      console.error("Error checking diagnostic status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setDiagnosticCompleted(true);
    setShowForm(false);
    onComplete?.();
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-zinc-800 rounded-xl h-24" />
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative overflow-hidden rounded-xl p-1",
          !diagnosticCompleted && "animate-pulse-slow",
          className
        )}
        style={{
          background: diagnosticCompleted 
            ? 'linear-gradient(135deg, hsl(var(--secondary)/0.3), hsl(var(--secondary)/0.1))'
            : 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--accent)/0.8), hsl(var(--secondary)))'
        }}
      >
        <div className="relative bg-zinc-900 rounded-lg p-5">
          {/* Background shimmer effect for incomplete */}
          {!diagnosticCompleted && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div className="relative flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
              diagnosticCompleted 
                ? "bg-green-500/20" 
                : "bg-gradient-to-br from-secondary/30 to-accent/20"
            )}>
              {diagnosticCompleted ? (
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              ) : (
                <ClipboardCheck className="w-7 h-7 text-secondary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!diagnosticCompleted && (
                  <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                )}
                <h4 className={cn(
                  "font-serif font-bold text-lg",
                  diagnosticCompleted ? "text-cream/70" : "text-cream"
                )}>
                  {diagnosticCompleted 
                    ? "Diagnóstico Soberano Completo" 
                    : "Preencha seu Diagnóstico Soberano"
                  }
                </h4>
              </div>
              
              <p className="text-sm text-cream/60 mb-2">
                {diagnosticCompleted 
                  ? filledFromCourse 
                    ? `Preenchido via ${filledFromCourse}`
                    : "Seu plano personalizado foi criado"
                  : diagnosticProgress > 0
                    ? `Continue de onde parou - ${diagnosticProgress}% concluído`
                    : "Seu plano de transformação começa aqui"
                }
              </p>

              {!diagnosticCompleted && diagnosticProgress > 0 && (
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-3">
                  <div 
                    className="bg-secondary h-full rounded-full transition-all"
                    style={{ width: `${diagnosticProgress}%` }}
                  />
                </div>
              )}
            </div>

            {diagnosticCompleted ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completo
              </Badge>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-shrink-0 group"
              >
                {diagnosticProgress > 0 ? "Continuar" : "Preencher"}
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {showForm && (
        <DiagnosticForm
          initialStep={resumeStep}
          courseId={courseId}
          onComplete={handleComplete}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
};
