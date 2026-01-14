import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle2, 
  Target, 
  Users, 
  Heart, 
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Send
} from "lucide-react";

interface AvatarFormData {
  // NICHO
  nicho: string;
  subnicho: string;
  roma: string;
  // AVATAR
  avatar_idade: string;
  avatar_sexo: string;
  avatar_salario: string;
  avatar_profissao: string;
  avatar_religiao: string;
  avatar_orientacao_politica: string;
  avatar_momento_vida: string;
  // SEGMENTAÇÃO
  resumo_avatar: string;
  dores_pessoais: string[];
  dores_profissionais: string[];
  dores_emocionais: string[];
  dores_relacionamento: string[];
  // DESEJOS
  desejos_pessoais: string[];
  desejos_profissionais: string[];
  desejos_financeiros: string[];
}

interface AvatarMapFormProps {
  lessonId: string;
  missionId?: string;
  onComplete?: () => void;
  onMissionSubmit?: (missionId: string) => void;
}

const STEPS = [
  { id: 1, title: "Seu Nicho", icon: Target, description: "Defina seu nicho e subnicho de atuação" },
  { id: 2, title: "Características", icon: Users, description: "Perfil demográfico do seu avatar" },
  { id: 3, title: "Dores", icon: Heart, description: "As dores que seu avatar enfrenta" },
  { id: 4, title: "Desejos", icon: Sparkles, description: "O que seu avatar deseja conquistar" },
  { id: 5, title: "Resumo", icon: CheckCircle2, description: "Revise e finalize seu mapa" },
];

const INITIAL_DATA: AvatarFormData = {
  nicho: "",
  subnicho: "",
  roma: "",
  avatar_idade: "",
  avatar_sexo: "",
  avatar_salario: "",
  avatar_profissao: "",
  avatar_religiao: "",
  avatar_orientacao_politica: "",
  avatar_momento_vida: "",
  resumo_avatar: "",
  dores_pessoais: ["", "", "", "", ""],
  dores_profissionais: ["", "", "", "", ""],
  dores_emocionais: ["", "", "", "", ""],
  dores_relacionamento: ["", "", "", "", ""],
  desejos_pessoais: ["", "", "", "", ""],
  desejos_profissionais: ["", "", "", "", ""],
  desejos_financeiros: ["", "", "", "", ""],
};

export function AvatarMapForm({ lessonId, missionId, onComplete, onMissionSubmit }: AvatarMapFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AvatarFormData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);

  // Load existing form data
  useEffect(() => {
    if (user?.id && lessonId) {
      loadFormData();
    }
  }, [user?.id, lessonId]);

  const loadFormData = async () => {
    try {
      const { data, error } = await supabase
        .from("student_avatar_forms")
        .select("*")
        .eq("user_id", user!.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormId(data.id);
        setCurrentStep(data.current_step || 1);
        setIsCompleted(data.is_completed || false);
        setFormData({
          nicho: data.nicho || "",
          subnicho: data.subnicho || "",
          roma: data.roma || "",
          avatar_idade: data.avatar_idade || "",
          avatar_sexo: data.avatar_sexo || "",
          avatar_salario: data.avatar_salario || "",
          avatar_profissao: data.avatar_profissao || "",
          avatar_religiao: data.avatar_religiao || "",
          avatar_orientacao_politica: data.avatar_orientacao_politica || "",
          avatar_momento_vida: data.avatar_momento_vida || "",
          resumo_avatar: data.resumo_avatar || "",
          dores_pessoais: data.dores_pessoais?.length ? data.dores_pessoais : INITIAL_DATA.dores_pessoais,
          dores_profissionais: data.dores_profissionais?.length ? data.dores_profissionais : INITIAL_DATA.dores_profissionais,
          dores_emocionais: data.dores_emocionais?.length ? data.dores_emocionais : INITIAL_DATA.dores_emocionais,
          dores_relacionamento: data.dores_relacionamento?.length ? data.dores_relacionamento : INITIAL_DATA.dores_relacionamento,
          desejos_pessoais: data.desejos_pessoais?.length ? data.desejos_pessoais : INITIAL_DATA.desejos_pessoais,
          desejos_profissionais: data.desejos_profissionais?.length ? data.desejos_profissionais : INITIAL_DATA.desejos_profissionais,
          desejos_financeiros: data.desejos_financeiros?.length ? data.desejos_financeiros : INITIAL_DATA.desejos_financeiros,
        });
      }
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveForm = async (step?: number, completed?: boolean) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const formPayload = {
        user_id: user.id,
        lesson_id: lessonId,
        current_step: step || currentStep,
        is_completed: completed || false,
        completed_at: completed ? new Date().toISOString() : null,
        ...formData,
      };

      const { data, error } = await supabase
        .from("student_avatar_forms")
        .upsert(formPayload, { onConflict: "user_id,lesson_id" })
        .select()
        .single();

      if (error) throw error;

      if (data) setFormId(data.id);
      
      if (completed) {
        setIsCompleted(true);
        toast.success("Formulário salvo e finalizado!");
        onComplete?.();
      } else {
        toast.success("Rascunho salvo!");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Erro ao salvar formulário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await saveForm(currentStep + 1);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    await saveForm(5, true);
    
    // If there's a mission associated, submit it
    if (missionId && onMissionSubmit) {
      try {
        await supabase.from("user_mission_completions").upsert({
          user_id: user!.id,
          mission_id: missionId,
          status: "submitted",
          proof_content: `Formulário Mapa do Avatar preenchido e finalizado`,
          proof_links: [`/student/avatar-form/${formId || lessonId}`],
          submitted_at: new Date().toISOString(),
        }, { onConflict: "user_id,mission_id" });
        
        onMissionSubmit(missionId);
      } catch (error) {
        console.error("Error submitting mission:", error);
      }
    }
  };

  const updateField = <K extends keyof AvatarFormData>(field: K, value: AvatarFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof AvatarFormData, index: number, value: string) => {
    setFormData((prev) => {
      const arr = [...(prev[field] as string[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: keyof AvatarFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const removeArrayItem = (field: keyof AvatarFormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (currentStep / 5) * 100;
  const StepIcon = STEPS[currentStep - 1].icon;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <StepIcon className="h-6 w-6 text-primary" />
              Mapa do Avatar
            </h2>
            <p className="text-muted-foreground">
              Etapa {currentStep} de 5: {STEPS[currentStep - 1].title}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveForm()}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Rascunho
          </Button>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.id === currentStep
                    ? "border-primary bg-primary/10"
                    : step.id < currentStep
                    ? "border-green-500 bg-green-500/10"
                    : "border-muted"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs hidden md:block">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5 text-primary" />
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {STEPS[currentStep - 1].description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Nicho */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nicho">Qual é o seu NICHO de atuação?</Label>
                    <Input
                      id="nicho"
                      placeholder="Ex: Advocacia Imobiliária"
                      value={formData.nicho}
                      onChange={(e) => updateField("nicho", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      O nicho é a área principal onde você atua ou deseja atuar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subnicho">Qual é o seu SUBNICHO?</Label>
                    <Input
                      id="subnicho"
                      placeholder="Ex: Regularização de Imóveis"
                      value={formData.subnicho}
                      onChange={(e) => updateField("subnicho", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      O subnicho é uma especialização dentro do seu nicho principal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roma">ROMA (Resultado + Obstáculo + Meta + Aspiração)</Label>
                    <Textarea
                      id="roma"
                      placeholder="Descreva o resultado que você entrega, o obstáculo que seu cliente enfrenta, a meta dele e sua aspiração..."
                      value={formData.roma}
                      onChange={(e) => updateField("roma", e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      A ROMA é a sua promessa de transformação para o cliente
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Características do Avatar */}
              {currentStep === 2 && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade do Avatar</Label>
                    <Select
                      value={formData.avatar_idade}
                      onValueChange={(v) => updateField("avatar_idade", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa etária" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25-35">25 a 35 anos</SelectItem>
                        <SelectItem value="35-45">35 a 45 anos</SelectItem>
                        <SelectItem value="45-55">45 a 55 anos</SelectItem>
                        <SelectItem value="55+">55+ anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gênero do Avatar</Label>
                    <RadioGroup
                      value={formData.avatar_sexo}
                      onValueChange={(v) => updateField("avatar_sexo", v)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feminino" id="feminino" />
                        <Label htmlFor="feminino">Feminino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="masculino" id="masculino" />
                        <Label htmlFor="masculino">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ambos" id="ambos" />
                        <Label htmlFor="ambos">Ambos</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salario">Faixa Salarial</Label>
                    <Select
                      value={formData.avatar_salario}
                      onValueChange={(v) => updateField("avatar_salario", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ate-5k">Até R$ 5.000</SelectItem>
                        <SelectItem value="5k-10k">R$ 5.000 - R$ 10.000</SelectItem>
                        <SelectItem value="10k-20k">R$ 10.000 - R$ 20.000</SelectItem>
                        <SelectItem value="20k-50k">R$ 20.000 - R$ 50.000</SelectItem>
                        <SelectItem value="50k+">Acima de R$ 50.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input
                      id="profissao"
                      placeholder="Ex: Empresário, Servidor Público..."
                      value={formData.avatar_profissao}
                      onChange={(e) => updateField("avatar_profissao", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religiao">Religião (opcional)</Label>
                    <Input
                      id="religiao"
                      placeholder="Ex: Católica, Evangélica, Sem religião..."
                      value={formData.avatar_religiao}
                      onChange={(e) => updateField("avatar_religiao", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientacao">Orientação Política (opcional)</Label>
                    <Input
                      id="orientacao"
                      placeholder="Ex: Liberal, Conservador, Neutro..."
                      value={formData.avatar_orientacao_politica}
                      onChange={(e) => updateField("avatar_orientacao_politica", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="momento">Momento de Vida</Label>
                    <Textarea
                      id="momento"
                      placeholder="Descreva o momento de vida do seu avatar: casado, filhos, carreira, sonhos..."
                      value={formData.avatar_momento_vida}
                      onChange={(e) => updateField("avatar_momento_vida", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Dores */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <DoresSection
                    title="Dores Pessoais"
                    items={formData.dores_pessoais}
                    field="dores_pessoais"
                    placeholder="Ex: Não consigo equilibrar vida pessoal e trabalho..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                  />
                  
                  <DoresSection
                    title="Dores Profissionais"
                    items={formData.dores_profissionais}
                    field="dores_profissionais"
                    placeholder="Ex: Não sei precificar meus honorários..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                  />
                  
                  <DoresSection
                    title="Dores Emocionais"
                    items={formData.dores_emocionais}
                    field="dores_emocionais"
                    placeholder="Ex: Sinto-me insegura em negociações..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                  />
                  
                  <DoresSection
                    title="Dores de Relacionamento"
                    items={formData.dores_relacionamento}
                    field="dores_relacionamento"
                    placeholder="Ex: Tenho dificuldade em fazer networking..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                  />
                </div>
              )}

              {/* Step 4: Desejos */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <DoresSection
                    title="Desejos Pessoais"
                    items={formData.desejos_pessoais}
                    field="desejos_pessoais"
                    placeholder="Ex: Quero ter mais tempo para minha família..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                    isDesejo
                  />
                  
                  <DoresSection
                    title="Desejos Profissionais"
                    items={formData.desejos_profissionais}
                    field="desejos_profissionais"
                    placeholder="Ex: Quero ser referência na minha área..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                    isDesejo
                  />
                  
                  <DoresSection
                    title="Desejos Financeiros e Estratégicos"
                    items={formData.desejos_financeiros}
                    field="desejos_financeiros"
                    placeholder="Ex: Quero faturar R$ 50.000/mês..."
                    updateArrayField={updateArrayField}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                    isDesejo
                  />
                </div>
              )}

              {/* Step 5: Resumo */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resumo">Resuma seu Avatar em até 4 linhas</Label>
                    <Textarea
                      id="resumo"
                      placeholder="Meu avatar é uma advogada de 35-45 anos, casada, que busca..."
                      value={formData.resumo_avatar}
                      onChange={(e) => updateField("resumo_avatar", e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <SummaryCard title="Nicho" items={[formData.nicho, formData.subnicho].filter(Boolean)} />
                    <SummaryCard title="Perfil" items={[
                      formData.avatar_idade && `Idade: ${formData.avatar_idade}`,
                      formData.avatar_sexo && `Gênero: ${formData.avatar_sexo}`,
                      formData.avatar_profissao && `Profissão: ${formData.avatar_profissao}`,
                    ].filter(Boolean)} />
                    <SummaryCard 
                      title="Top Dores" 
                      items={[
                        ...formData.dores_pessoais,
                        ...formData.dores_profissionais,
                      ].filter(Boolean).slice(0, 5)} 
                    />
                    <SummaryCard 
                      title="Top Desejos" 
                      items={[
                        ...formData.desejos_pessoais,
                        ...formData.desejos_profissionais,
                      ].filter(Boolean).slice(0, 5)} 
                    />
                  </div>

                  {isCompleted && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-500">Formulário Completo!</p>
                        <p className="text-sm text-muted-foreground">
                          Você já finalizou este formulário. Pode editá-lo a qualquer momento.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={isSaving}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {missionId ? "Finalizar e Entregar Missão" : "Finalizar Formulário"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface DoresSectionProps {
  title: string;
  items: string[];
  field: keyof AvatarFormData;
  placeholder: string;
  updateArrayField: (field: keyof AvatarFormData, index: number, value: string) => void;
  addArrayItem: (field: keyof AvatarFormData) => void;
  removeArrayItem: (field: keyof AvatarFormData, index: number) => void;
  isDesejo?: boolean;
}

function DoresSection({ 
  title, 
  items, 
  field, 
  placeholder, 
  updateArrayField, 
  addArrayItem, 
  removeArrayItem,
  isDesejo 
}: DoresSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{title}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addArrayItem(field)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <div className={`flex items-center justify-center w-8 h-10 rounded text-sm font-medium ${
              isDesejo ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
            }`}>
              {index + 1}
            </div>
            <Input
              value={item}
              onChange={(e) => updateArrayField(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeArrayItem(field, index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-foreground">
              • {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">Não preenchido</p>
      )}
    </div>
  );
}
