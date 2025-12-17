import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from "lucide-react";

interface DiagnosticFormProps {
  onComplete: () => void;
  onClose: () => void;
  initialStep?: number;
}

interface DiagnosticData {
  years_practicing: string;
  practice_area: string;
  practice_area_other: string;
  has_office: boolean | null;
  office_size: string;
  monthly_revenue: string;
  revenue_goal: string;
  main_challenges: string[];
  main_goals: string[];
  marketing_knowledge: string;
  digital_presence: string;
  referral_source: string;
  weekly_study_hours: string;
}

const TOTAL_STEPS = 5;

export function DiagnosticForm({ onComplete, onClose, initialStep = 1 }: DiagnosticFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DiagnosticData>({
    years_practicing: "",
    practice_area: "",
    practice_area_other: "",
    has_office: null,
    office_size: "",
    monthly_revenue: "",
    revenue_goal: "",
    main_challenges: [],
    main_goals: [],
    marketing_knowledge: "",
    digital_presence: "",
    referral_source: "",
    weekly_study_hours: ""
  });

  useEffect(() => {
    loadExistingData();
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;
    
    const { data: existing } = await supabase
      .from("student_diagnostics")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (existing) {
      setData({
        years_practicing: existing.years_practicing || "",
        practice_area: existing.practice_area || "",
        practice_area_other: existing.practice_area_other || "",
        has_office: existing.has_office,
        office_size: existing.office_size || "",
        monthly_revenue: existing.monthly_revenue || "",
        revenue_goal: existing.revenue_goal || "",
        main_challenges: existing.main_challenges || [],
        main_goals: existing.main_goals || [],
        marketing_knowledge: existing.marketing_knowledge || "",
        digital_presence: existing.digital_presence || "",
        referral_source: existing.referral_source || "",
        weekly_study_hours: existing.weekly_study_hours || ""
      });
      setCurrentStep(existing.current_step || 1);
    }
  };

  const saveProgress = async (completed = false) => {
    if (!user) return;
    setSaving(true);

    try {
      const payload = {
        user_id: user.id,
        ...data,
        current_step: currentStep,
        completed
      };

      const { error } = await supabase
        .from("student_diagnostics")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving diagnostic:", error);
      toast.error("Erro ao salvar progresso");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveProgress();
    } else {
      await saveProgress(true);
      toast.success("Diagnóstico concluído com sucesso!");
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChallengeToggle = (challenge: string) => {
    setData(prev => ({
      ...prev,
      main_challenges: prev.main_challenges.includes(challenge)
        ? prev.main_challenges.filter(c => c !== challenge)
        : prev.main_challenges.length < 3
          ? [...prev.main_challenges, challenge]
          : prev.main_challenges
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      main_goals: prev.main_goals.includes(goal)
        ? prev.main_goals.filter(g => g !== goal)
        : prev.main_goals.length < 3
          ? [...prev.main_goals, goal]
          : prev.main_goals
    }));
  };

  // Calcular progresso baseado em campos preenchidos, não em steps
  const calculateProgressPercent = (): number => {
    let filled = 0;
    const totalFields = 12;

    if (data.years_practicing) filled++;
    if (data.practice_area) filled++;
    if (data.has_office !== null) filled++;
    if (data.office_size) filled++;
    if (data.monthly_revenue) filled++;
    if (data.revenue_goal) filled++;
    if (data.main_challenges.length > 0) filled++;
    if (data.main_goals.length > 0) filled++;
    if (data.marketing_knowledge) filled++;
    if (data.digital_presence) filled++;
    if (data.referral_source) filled++;
    if (data.weekly_study_hours) filled++;

    return Math.round((filled / totalFields) * 100);
  };

  const progressPercent = calculateProgressPercent();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Há quanto tempo você advoga?
              </Label>
              <RadioGroup
                value={data.years_practicing}
                onValueChange={(v) => setData(prev => ({ ...prev, years_practicing: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "menos_1", label: "Menos de 1 ano" },
                  { value: "1_3", label: "1 a 3 anos" },
                  { value: "3_5", label: "3 a 5 anos" },
                  { value: "5_10", label: "5 a 10 anos" },
                  { value: "mais_10", label: "Mais de 10 anos" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Qual sua principal área de atuação?
              </Label>
              <RadioGroup
                value={data.practice_area}
                onValueChange={(v) => setData(prev => ({ ...prev, practice_area: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "civil", label: "Direito Civil" },
                  { value: "trabalhista", label: "Direito Trabalhista" },
                  { value: "criminal", label: "Direito Criminal" },
                  { value: "tributario", label: "Direito Tributário" },
                  { value: "empresarial", label: "Direito Empresarial" },
                  { value: "familia", label: "Direito de Família" },
                  { value: "outro", label: "Outro" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`area_${option.value}`} />
                    <Label htmlFor={`area_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {data.practice_area === "outro" && (
                <Input
                  placeholder="Especifique a área"
                  value={data.practice_area_other}
                  onChange={(e) => setData(prev => ({ ...prev, practice_area_other: e.target.value }))}
                  className="mt-3"
                />
              )}
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Você possui escritório próprio?
              </Label>
              <RadioGroup
                value={data.has_office === null ? "" : data.has_office ? "sim" : "nao"}
                onValueChange={(v) => setData(prev => ({ ...prev, has_office: v === "sim" }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="office_sim" />
                  <Label htmlFor="office_sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="office_nao" />
                  <Label htmlFor="office_nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Qual o tamanho do seu escritório/equipe?
              </Label>
              <RadioGroup
                value={data.office_size}
                onValueChange={(v) => setData(prev => ({ ...prev, office_size: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "solo", label: "Advogada solo" },
                  { value: "pequeno", label: "Pequeno (2-5 pessoas)" },
                  { value: "medio", label: "Médio (6-15 pessoas)" },
                  { value: "grande", label: "Grande (16+ pessoas)" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`size_${option.value}`} />
                    <Label htmlFor={`size_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Qual seu faturamento mensal aproximado?
              </Label>
              <RadioGroup
                value={data.monthly_revenue}
                onValueChange={(v) => setData(prev => ({ ...prev, monthly_revenue: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "ate_5k", label: "Até R$ 5.000" },
                  { value: "5k_10k", label: "R$ 5.000 - R$ 10.000" },
                  { value: "10k_20k", label: "R$ 10.000 - R$ 20.000" },
                  { value: "20k_50k", label: "R$ 20.000 - R$ 50.000" },
                  { value: "mais_50k", label: "Mais de R$ 50.000" },
                  { value: "nao_informar", label: "Prefiro não informar" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`revenue_${option.value}`} />
                    <Label htmlFor={`revenue_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Qual sua meta de faturamento mensal?
              </Label>
              <RadioGroup
                value={data.revenue_goal}
                onValueChange={(v) => setData(prev => ({ ...prev, revenue_goal: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "ate_5k", label: "Até R$ 5.000" },
                  { value: "5k_10k", label: "R$ 5.000 - R$ 10.000" },
                  { value: "10k_20k", label: "R$ 10.000 - R$ 20.000" },
                  { value: "20k_50k", label: "R$ 20.000 - R$ 50.000" },
                  { value: "mais_50k", label: "Mais de R$ 50.000" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`goal_${option.value}`} />
                    <Label htmlFor={`goal_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Quais são seus principais desafios hoje? (Selecione até 3)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "captacao", label: "Captação de clientes" },
                  { value: "gestao", label: "Gestão do escritório" },
                  { value: "marketing", label: "Marketing pessoal" },
                  { value: "financeiro", label: "Gestão financeira" },
                  { value: "tempo", label: "Gestão de tempo" },
                  { value: "equipe", label: "Gestão de equipe" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`challenge_${option.value}`}
                      checked={data.main_challenges.includes(option.value)}
                      onCheckedChange={() => handleChallengeToggle(option.value)}
                    />
                    <Label htmlFor={`challenge_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Quais são seus principais objetivos? (Selecione até 3)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "faturamento", label: "Aumentar faturamento" },
                  { value: "clientes", label: "Conquistar mais clientes" },
                  { value: "marca", label: "Construir marca pessoal" },
                  { value: "networking", label: "Ampliar networking" },
                  { value: "organizacao", label: "Melhorar organização" },
                  { value: "vida", label: "Equilíbrio vida/trabalho" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal_${option.value}`}
                      checked={data.main_goals.includes(option.value)}
                      onCheckedChange={() => handleGoalToggle(option.value)}
                    />
                    <Label htmlFor={`goal_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Como você avalia seu conhecimento em marketing?
              </Label>
              <RadioGroup
                value={data.marketing_knowledge}
                onValueChange={(v) => setData(prev => ({ ...prev, marketing_knowledge: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "iniciante", label: "Iniciante" },
                  { value: "basico", label: "Básico" },
                  { value: "intermediario", label: "Intermediário" },
                  { value: "avancado", label: "Avançado" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`marketing_${option.value}`} />
                    <Label htmlFor={`marketing_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Como está sua presença digital atualmente?
              </Label>
              <RadioGroup
                value={data.digital_presence}
                onValueChange={(v) => setData(prev => ({ ...prev, digital_presence: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "nenhuma", label: "Nenhuma" },
                  { value: "basica", label: "Básica" },
                  { value: "moderada", label: "Moderada" },
                  { value: "forte", label: "Forte" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`presence_${option.value}`} />
                    <Label htmlFor={`presence_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Como você conheceu a Soberana?
              </Label>
              <RadioGroup
                value={data.referral_source}
                onValueChange={(v) => setData(prev => ({ ...prev, referral_source: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "instagram", label: "Instagram" },
                  { value: "indicacao", label: "Indicação" },
                  { value: "google", label: "Google" },
                  { value: "evento", label: "Evento" },
                  { value: "outro", label: "Outro" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`referral_${option.value}`} />
                    <Label htmlFor={`referral_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Quantas horas por semana você pode dedicar aos estudos?
              </Label>
              <RadioGroup
                value={data.weekly_study_hours}
                onValueChange={(v) => setData(prev => ({ ...prev, weekly_study_hours: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "1_2", label: "1-2 horas" },
                  { value: "3_5", label: "3-5 horas" },
                  { value: "5_10", label: "5-10 horas" },
                  { value: "mais_10", label: "Mais de 10 horas" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`hours_${option.value}`} />
                    <Label htmlFor={`hours_${option.value}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Quase lá!</h4>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Finalizar" para concluir seu diagnóstico e começar sua jornada personalizada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    "Sobre Você",
    "Seu Escritório",
    "Objetivos",
    "Conhecimento",
    "Disponibilidade"
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Diagnóstico Inicial</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground border-muted-foreground/30"
            >
              Preencher depois
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Etapa {currentStep} de {TOTAL_STEPS} - {stepTitles[currentStep - 1]}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Button onClick={handleNext} disabled={saving}>
              {currentStep === TOTAL_STEPS ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Lightbulb className="h-4 w-4 flex-shrink-0" />
            <span>Suas respostas nos ajudam a personalizar sua experiência de aprendizado!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
