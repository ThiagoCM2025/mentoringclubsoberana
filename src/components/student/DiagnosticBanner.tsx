import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, X } from "lucide-react";
import { DiagnosticForm } from "./DiagnosticForm";

export function DiagnosticBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user) {
      checkDiagnosticStatus();
    }
  }, [user]);

  const checkDiagnosticStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("student_diagnostics")
      .select("completed, current_step")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      // No diagnostic started
      setShowBanner(true);
      setCurrentStep(1);
    } else if (!data.completed) {
      // Diagnostic started but not completed
      setShowBanner(true);
      setCurrentStep(data.current_step || 1);
    } else {
      setShowBanner(false);
    }
  };

  const handleComplete = () => {
    setShowForm(false);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!showBanner || dismissed) return null;

  const progressPercent = ((currentStep - 1) / 5) * 100;

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">
                Complete seu perfil para uma experiência personalizada!
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep === 1 
                  ? "Responda algumas perguntas rápidas para personalizarmos sua jornada."
                  : `Você parou na etapa ${currentStep}. Leva apenas 2 minutos para finalizar.`
                }
              </p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Progress value={progressPercent} className="h-2 flex-1 max-w-xs" />
                  <span className="text-muted-foreground">{Math.round(progressPercent)}% completo</span>
                </div>
                
                <Button size="sm" onClick={() => setShowForm(true)}>
                  {currentStep === 1 ? "Começar" : "Continuar"}
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showForm && (
        <DiagnosticForm
          onComplete={handleComplete}
          onClose={() => setShowForm(false)}
          initialStep={currentStep}
        />
      )}
    </>
  );
}
