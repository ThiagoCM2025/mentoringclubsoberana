import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { DiagnosticForm } from "@/components/student/DiagnosticForm";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeDiagnostic } from "@/hooks/useRealtimeDiagnostic";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DiagnosticCTAProps {
  courseId: string;
  onComplete?: () => void;
  className?: string;
}

export const DiagnosticCTA = ({ courseId, onComplete, className }: DiagnosticCTAProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Use realtime hook for instant updates across tabs/devices
  const { completed, progress, currentStep, loading, refetch } = useRealtimeDiagnostic(user?.id);

  const handleFormClose = () => {
    setShowForm(false);
    // Refetch to ensure local state is synced (backup for realtime)
    refetch();
  };

  const handleFormComplete = () => {
    setShowForm(false);
    refetch();
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
          "relative overflow-hidden rounded-xl border-2 p-5",
          completed 
            ? "bg-zinc-900 border-green-500/30" 
            : "bg-zinc-900 border-secondary/40",
          className
        )}
      >
        {/* Background shimmer effect for incomplete */}
        {!completed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="relative flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
            completed 
              ? "bg-green-500/20" 
              : "bg-gradient-to-br from-secondary/30 to-accent/20"
          )}>
            {completed ? (
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            ) : (
              <ClipboardCheck className="w-7 h-7 text-secondary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {!completed && (
                <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              )}
              <p className="text-xs text-cream/50">Passo 1</p>
            </div>
            <h4 className={cn(
              "font-serif font-bold text-lg",
              completed ? "text-cream/70" : "text-cream"
            )}>
              {completed 
                ? "Diagnóstico Soberano Completo" 
                : "Preencha seu Diagnóstico Soberano"
              }
            </h4>
            
            <p className="text-sm text-cream/60 mt-1">
              {completed 
                ? "Seu plano personalizado foi criado"
                : progress > 0
                  ? `Continue de onde parou - ${progress}% concluído`
                  : "Seu plano de transformação começa aqui"
              }
            </p>

            {!completed && progress > 0 && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3">
                <div 
                  className="bg-secondary h-full rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {completed ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completo
            </Badge>
          ) : (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-shrink-0 group"
            >
              {progress > 0 ? "Continuar" : "Preencher"}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </motion.div>

      {showForm && (
        <DiagnosticForm
          initialStep={currentStep}
          courseId={courseId}
          onComplete={handleFormComplete}
          onClose={handleFormClose}
        />
      )}
    </>
  );
};
