import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, X } from "lucide-react";
import { DiagnosticForm } from "./DiagnosticForm";

// Total de campos do diagnóstico
const TOTAL_DIAGNOSTIC_FIELDS = 12;

// Função para calcular progresso baseado em campos preenchidos
function calculateProgress(data: {
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
  let filled = 0;

  if (data.years_practicing) filled++;
  if (data.practice_area) filled++;
  if (data.has_office !== null && data.has_office !== undefined) filled++;
  if (data.office_size) filled++;
  if (data.monthly_revenue) filled++;
  if (data.revenue_goal) filled++;
  if (data.main_challenges && data.main_challenges.length > 0) filled++;
  if (data.main_goals && data.main_goals.length > 0) filled++;
  if (data.marketing_knowledge) filled++;
  if (data.digital_presence) filled++;
  if (data.referral_source) filled++;
  if (data.weekly_study_hours) filled++;

  return Math.round((filled / TOTAL_DIAGNOSTIC_FIELDS) * 100);
}

export function DiagnosticBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
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
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      // No diagnostic started
      setShowBanner(true);
      setCurrentStep(1);
      setProgressPercent(0);
    } else if (!data.completed) {
      // Diagnostic started but not completed - calculate real progress
      setShowBanner(true);
      setCurrentStep(data.current_step || 1);
      setProgressPercent(calculateProgress(data));
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

  return (
    <>
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-black border border-secondary/30 rounded-xl p-5 mb-6 hover:border-secondary/50 transition-all duration-300 shadow-lg shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-cream text-lg">
                Complete seu perfil para uma experiência personalizada!
              </h4>
              <p className="text-sm text-cream/80 mt-1">
                {progressPercent === 0 
                  ? "Responda algumas perguntas rápidas para personalizarmos sua jornada."
                  : `Você já preencheu ${progressPercent}% do diagnóstico. Leva apenas 2 minutos para finalizar.`
                }
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Progress value={progressPercent} className="h-2 flex-1 max-w-xs bg-zinc-800" />
                  <span className="text-secondary font-medium">{progressPercent}%</span>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => setShowForm(true)}
                  className="bg-secondary hover:bg-secondary-light text-black font-semibold btn-glow-gold"
                >
                  {progressPercent === 0 ? "Começar Diagnóstico" : "Continuar Diagnóstico"}
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-cream/60 hover:text-cream hover:bg-zinc-800"
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
