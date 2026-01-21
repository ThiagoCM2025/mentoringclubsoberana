import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Copy, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CAMPAIGN_ICONS = ["📧", "📊", "🏠", "🎯", "📌", "💼", "🚀", "💡", "🔥", "⭐"];

interface CampaignGroup {
  sourceFilter: string | null;
  name: string;
  sequences: any[];
}

interface NewCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCampaigns: CampaignGroup[];
  onCreated: () => void;
}

export function NewCampaignDialog({
  open,
  onOpenChange,
  existingCampaigns,
  onCreated,
}: NewCampaignDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📧");
  const [stepsCount, setStepsCount] = useState(4);
  const [stepDelays, setStepDelays] = useState<number[]>([0, 48, 96, 144]);
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Update step delays when stepsCount changes
  useEffect(() => {
    const newDelays = Array.from({ length: stepsCount }, (_, i) => 
      stepDelays[i] !== undefined ? stepDelays[i] : (i === 0 ? 0 : 48 * i)
    );
    setStepDelays(newDelays);
  }, [stepsCount]);

  const updateStepDelay = (index: number, value: number) => {
    const newDelays = [...stepDelays];
    newDelays[index] = value;
    setStepDelays(newDelays);
  };

  const handleCreate = async () => {
    if (!name.trim() || !sourceFilter.trim()) {
      toast.error("Preencha o nome e o filtro de origem");
      return;
    }

    // Check if source filter already exists
    const existingFilter = existingCampaigns.find(
      (c) => c.sourceFilter === sourceFilter
    );
    if (existingFilter) {
      toast.error("Já existe uma campanha com esse filtro de origem");
      return;
    }

    setCreating(true);
    try {
      // Calculate step numbers - use 100+ for custom campaigns
      const baseStep = 100 + existingCampaigns.length * 100;
      
      // Get template sequences if copying
      let templateSequences: any[] = [];
      if (copyFrom) {
        const sourceCampaign = existingCampaigns.find(
          (c) => c.sourceFilter === copyFrom || (copyFrom === "default" && c.sourceFilter === null)
        );
        if (sourceCampaign) {
          templateSequences = sourceCampaign.sequences.slice(0, stepsCount);
        }
      }

      // Create sequences with custom delays
      const sequencesToCreate = Array.from({ length: stepsCount }, (_, i) => {
        const template = templateSequences[i];

        return {
          step_number: baseStep + i + 1,
          name: template?.name || `Etapa ${i + 1}`,
          email_subject: template?.email_subject || `${name} - Etapa ${i + 1}`,
          email_body: template?.email_body || `Olá {{nome}},\n\nConteúdo do email da etapa ${i + 1}.\n\nAbraços,\nFabiana Ferreira`,
          delay_hours: stepDelays[i] ?? (i === 0 ? 0 : 48 * i),
          source_filter: sourceFilter,
          is_active: true,
        };
      });

      const { error } = await supabase
        .from("nurturing_sequences")
        .insert(sequencesToCreate);

      if (error) throw error;

      toast.success(`Campanha "${name}" criada com ${stepsCount} etapas!`);
      onOpenChange(false);
      onCreated();

      // Reset form
      setName("");
      setDescription("");
      setSourceFilter("");
      setSelectedIcon("📧");
      setStepsCount(4);
      setStepDelays([0, 48, 96, 144]);
      setCopyFrom(null);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erro ao criar campanha");
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (campaign: CampaignGroup) => {
    setName(`${campaign.name} (cópia)`);
    setSourceFilter(`${campaign.sourceFilter || "default"}_copy`);
    setStepsCount(campaign.sequences.length);
    setCopyFrom(campaign.sourceFilter);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova Campanha de Nurturing
          </DialogTitle>
          <DialogDescription>
            Crie uma nova sequência de emails para segmentar seus leads por origem.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4 pr-1">
          {/* Quick duplicate from existing */}
          {existingCampaigns.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Duplicar campanha existente:</Label>
              <div className="flex flex-wrap gap-2">
                {existingCampaigns.map((campaign) => (
                  <Button
                    key={campaign.sourceFilter || "default"}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleDuplicate(campaign)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {campaign.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Black Friday 2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceFilter">
              Filtro de Origem (source) *
              <Badge variant="secondary" className="ml-2 text-xs">
                Usado para filtrar leads
              </Badge>
            </Label>
            <Input
              id="sourceFilter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="Ex: black_friday_2026"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Leads com <code className="bg-muted px-1 rounded">source = {sourceFilter || "..."}</code> receberão esta sequência
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo desta campanha..."
              className="resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-1">
                {CAMPAIGN_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    variant={selectedIcon === icon ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-lg"
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Número de Etapas</Label>
              <Select value={stepsCount.toString()} onValueChange={(v) => setStepsCount(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {n === 1 ? 'etapa' : 'etapas'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Step Delays Configuration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Delay por Etapa (horas após etapa anterior)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: stepsCount }, (_, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground w-14">
                    Etapa {i + 1}:
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={stepDelays[i] || 0}
                    onChange={(e) => updateStepDelay(i, parseInt(e.target.value) || 0)}
                    className="w-16 h-7 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">h</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Etapa 1 geralmente é 0h (envia imediatamente). Etapas seguintes aguardam X horas após a etapa anterior.
            </p>
          </div>

          {existingCampaigns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="copyTemplates"
                  checked={!!copyFrom}
                  onCheckedChange={(checked) => setCopyFrom(checked ? "default" : null)}
                />
                <Label htmlFor="copyTemplates" className="text-sm font-normal cursor-pointer">
                  Copiar templates de outra campanha
                </Label>
              </div>
              
              {copyFrom && (
                <Select value={copyFrom} onValueChange={setCopyFrom}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a campanha base" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCampaigns.map((campaign) => (
                      <SelectItem 
                        key={campaign.sourceFilter || "default"} 
                        value={campaign.sourceFilter || "default"}
                      >
                        {campaign.name} ({campaign.sequences.length} etapas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating || !name || !sourceFilter}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Campanha
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
