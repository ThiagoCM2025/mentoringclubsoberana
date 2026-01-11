import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wand2, Loader2 } from "lucide-react";

interface Mission {
  id: string;
  course_id: string;
  week_number: number;
  month_number: number | null;
  month_title: string | null;
  title: string;
  challenge_description: string;
  why_do: string | null;
  gamification_emoji: string | null;
  gamification_title: string | null;
  gamification_reward: string | null;
  xp_reward: number | null;
  related_lesson_id: string | null;
  requires_proof: boolean | null;
  proof_type: string | null;
  is_active: boolean | null;
}

interface Lesson {
  id: string;
  title: string;
  module_title?: string;
}

interface MissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  mission: Mission | null;
  lessons: Lesson[];
  onSaved: () => void;
  prefillData?: {
    week_number?: number;
    month_number?: number;
    related_lesson_id?: string;
    title?: string;
    context?: string;
  };
}

const MONTH_OPTIONS = [
  { value: 1, label: "Mês 1: Fundação", title: "Fundação e Posicionamento" },
  { value: 2, label: "Mês 2: Conversão", title: "Conversão e Vendas" },
  { value: 3, label: "Mês 3: Escala", title: "Escala e Autoridade" },
];

const PROOF_TYPES = [
  { value: "comment", label: "Comentário na arena" },
  { value: "link", label: "Link externo" },
  { value: "image", label: "Imagem/Print" },
];

const EMOJI_OPTIONS = ["🎯", "🔥", "💎", "⚡", "🚀", "💰", "🏆", "✨", "💪", "🌟", "📈", "🎨"];

const MissionDialog = ({ 
  open, 
  onOpenChange, 
  courseId, 
  mission, 
  lessons,
  onSaved,
  prefillData
}: MissionDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    week_number: 1,
    month_number: 1,
    month_title: "Fundação e Posicionamento",
    title: "",
    challenge_description: "",
    why_do: "",
    gamification_emoji: "🎯",
    gamification_title: "",
    gamification_reward: "",
    xp_reward: 150,
    related_lesson_id: "",
    requires_proof: true,
    proof_type: "comment",
    is_active: true
  });

  useEffect(() => {
    if (mission) {
      setFormData({
        week_number: mission.week_number,
        month_number: mission.month_number || 1,
        month_title: mission.month_title || "",
        title: mission.title,
        challenge_description: mission.challenge_description,
        why_do: mission.why_do || "",
        gamification_emoji: mission.gamification_emoji || "🎯",
        gamification_title: mission.gamification_title || "",
        gamification_reward: mission.gamification_reward || "",
        xp_reward: mission.xp_reward || 150,
        related_lesson_id: mission.related_lesson_id || "",
        requires_proof: mission.requires_proof ?? true,
        proof_type: mission.proof_type || "comment",
        is_active: mission.is_active ?? true
      });
    } else if (prefillData) {
      setFormData(prev => ({
        ...prev,
        week_number: prefillData.week_number || 1,
        month_number: prefillData.month_number || 1,
        related_lesson_id: prefillData.related_lesson_id || "",
        title: prefillData.title || ""
      }));
    } else {
      // Reset form
      setFormData({
        week_number: 1,
        month_number: 1,
        month_title: "Fundação e Posicionamento",
        title: "",
        challenge_description: "",
        why_do: "",
        gamification_emoji: "🎯",
        gamification_title: "",
        gamification_reward: "",
        xp_reward: 150,
        related_lesson_id: "",
        requires_proof: true,
        proof_type: "comment",
        is_active: true
      });
    }
  }, [mission, prefillData, open]);

  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    const monthOption = MONTH_OPTIONS.find(m => m.value === month);
    setFormData({
      ...formData,
      month_number: month,
      month_title: monthOption?.title || ""
    });
  };

  const generateWithAI = async () => {
    setGeneratingAI(true);
    
    try {
      let context = prefillData?.context || "";
      
      if (formData.related_lesson_id) {
        const lesson = lessons.find(l => l.id === formData.related_lesson_id);
        if (lesson) {
          context = `Aula: ${lesson.title} (Módulo: ${lesson.module_title})`;
        }
      }

      const { data, error } = await supabase.functions.invoke("generate-mission", {
        body: { 
          context,
          courseId,
          weekNumber: formData.week_number,
          generateAll: false
        }
      });

      if (error) throw error;

      if (data?.mission) {
        setFormData(prev => ({
          ...prev,
          title: data.mission.title || prev.title,
          challenge_description: data.mission.challenge_description || prev.challenge_description,
          why_do: data.mission.why_do || prev.why_do,
          gamification_emoji: data.mission.gamification_emoji || prev.gamification_emoji,
          gamification_title: data.mission.gamification_title || prev.gamification_title,
          gamification_reward: data.mission.gamification_reward || prev.gamification_reward,
          xp_reward: data.mission.xp_reward || prev.xp_reward
        }));
        toast.success("Missão gerada com IA!");
      }
    } catch (error) {
      console.error("Error generating with AI:", error);
      toast.error("Erro ao gerar com IA");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.challenge_description) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);

    try {
      const missionData = {
        course_id: courseId,
        week_number: formData.week_number,
        month_number: formData.month_number,
        month_title: formData.month_title,
        title: formData.title,
        challenge_description: formData.challenge_description,
        why_do: formData.why_do || null,
        gamification_emoji: formData.gamification_emoji,
        gamification_title: formData.gamification_title || null,
        gamification_reward: formData.gamification_reward || null,
        xp_reward: formData.xp_reward,
        related_lesson_id: formData.related_lesson_id || null,
        requires_proof: formData.requires_proof,
        proof_type: formData.proof_type,
        is_active: formData.is_active
      };

      if (mission) {
        const { error } = await supabase
          .from("weekly_missions")
          .update({ ...missionData, updated_at: new Date().toISOString() })
          .eq("id", mission.id);

        if (error) throw error;
        toast.success("Missão atualizada!");
      } else {
        const { error } = await supabase
          .from("weekly_missions")
          .insert(missionData);

        if (error) throw error;
        toast.success("Missão criada!");
      }

      onSaved();
    } catch (error) {
      console.error("Error saving mission:", error);
      toast.error("Erro ao salvar missão");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mission ? "Editar Missão" : "Nova Missão"}
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes da missão semanal
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Week and Month Selection */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Semana *</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={formData.week_number}
                onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mês *</Label>
              <Select value={formData.month_number.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Select value={formData.gamification_emoji} onValueChange={(v) => setFormData({ ...formData, gamification_emoji: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOJI_OPTIONS.map(emoji => (
                    <SelectItem key={emoji} value={emoji}>
                      {emoji}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Related Lesson + AI Button */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aula Relacionada</Label>
              <Select 
                value={formData.related_lesson_id} 
                onValueChange={(v) => setFormData({ ...formData, related_lesson_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional - selecione uma aula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {lessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.module_title}: {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={generateWithAI}
                disabled={generatingAI}
                className="w-full"
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Preencher com IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Título da Missão *</Label>
            <Input
              placeholder="Missão Identidade Soberana"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Challenge Description */}
          <div className="space-y-2">
            <Label>Descrição do Desafio *</Label>
            <Textarea
              placeholder="O que a aluna deve fazer para completar esta missão..."
              value={formData.challenge_description}
              onChange={(e) => setFormData({ ...formData, challenge_description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Why Do */}
          <div className="space-y-2">
            <Label>Por que fazer esta missão</Label>
            <Textarea
              placeholder="Benefícios e resultados esperados..."
              value={formData.why_do}
              onChange={(e) => setFormData({ ...formData, why_do: e.target.value })}
              rows={2}
            />
          </div>

          {/* Gamification Title and Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título de Gamificação</Label>
              <Input
                placeholder="Autoridade em Construção"
                value={formData.gamification_title}
                onChange={(e) => setFormData({ ...formData, gamification_title: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Título desbloqueado ao completar</p>
            </div>
            <div className="space-y-2">
              <Label>Recompensa</Label>
              <Input
                placeholder="Selo 'Pronta para o Jogo'"
                value={formData.gamification_reward}
                onChange={(e) => setFormData({ ...formData, gamification_reward: e.target.value })}
              />
            </div>
          </div>

          {/* XP and Proof Type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>XP de Recompensa</Label>
              <Input
                type="number"
                min={0}
                value={formData.xp_reward}
                onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Comprovação</Label>
              <Select value={formData.proof_type} onValueChange={(v) => setFormData({ ...formData, proof_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROOF_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Requer Comprovação</Label>
              <div className="flex items-center pt-2">
                <Switch
                  checked={formData.requires_proof}
                  onCheckedChange={(v) => setFormData({ ...formData, requires_proof: v })}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.requires_proof ? "Sim" : "Não"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
            />
            <Label>Missão ativa</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : mission ? "Salvar Alterações" : "Criar Missão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MissionDialog;
