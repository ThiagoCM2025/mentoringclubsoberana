import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DiagnosticForm } from "@/components/student/DiagnosticForm";
import { cn } from "@/lib/utils";

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
        
        // Calculate progress
        const fields = [
          diagnostic.years_practicing,
          diagnostic.practice_area,
          diagnostic.has_office,
          diagnostic.office_size,
          diagnostic.monthly_revenue,
          diagnostic.revenue_goal,
          diagnostic.main_challenges,
          diagnostic.main_goals,
          diagnostic.marketing_knowledge,
          diagnostic.digital_presence,
          diagnostic.referral_source,
          diagnostic.weekly_study_hours
        ];
        const filledFields = fields.filter(f => f !== null && f !== undefined).length;
        setDiagnosticProgress(Math.round((filledFields / 12) * 100));

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
          initialStep={1}
          courseId={courseId}
          onComplete={handleComplete}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
};
