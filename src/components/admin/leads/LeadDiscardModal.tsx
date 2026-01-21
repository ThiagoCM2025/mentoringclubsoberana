import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, XCircle } from "lucide-react";

const DISCARD_REASONS = [
  { value: "sem_interesse", label: "Sem interesse no momento" },
  { value: "sem_condicoes", label: "Sem condições financeiras" },
  { value: "perfil_inadequado", label: "Perfil não adequado" },
  { value: "concorrente", label: "Já é cliente de concorrente" },
  { value: "sem_resposta", label: "Não respondeu após múltiplas tentativas" },
  { value: "duplicado", label: "Lead duplicado/inválido" },
  { value: "outro", label: "Outro motivo" },
];

interface LeadDiscardModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  leadName: string;
  onDiscardComplete: () => void;
}

export function LeadDiscardModal({
  open,
  onClose,
  leadId,
  leadName,
  onDiscardComplete,
}: LeadDiscardModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [discardReason, setDiscardReason] = useState("");
  const [discardNotes, setDiscardNotes] = useState("");

  const handleSave = async () => {
    if (!leadId) return;

    if (!discardReason) {
      toast({ title: "Selecione um motivo", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const reasonLabel = DISCARD_REASONS.find(r => r.value === discardReason)?.label || discardReason;
      
      const { error } = await supabase
        .from("leads")
        .update({
          status: "discarded",
          discard_reason: reasonLabel,
          discard_notes: discardNotes || null,
          nurturing_active: false,
          last_contact_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (error) throw error;

      toast({ title: "Lead descartado" });
      onDiscardComplete();
      resetAndClose();
    } catch (error) {
      console.error("Error discarding lead:", error);
      toast({ title: "Erro ao descartar lead", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setDiscardReason("");
    setDiscardNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden bg-card border-border">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            Descartar Lead: {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
          {/* Discard Reason */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Motivo do Descarte <span className="text-destructive">*</span>
            </Label>
            <Select value={discardReason} onValueChange={setDiscardReason}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione o motivo..." />
              </SelectTrigger>
              <SelectContent>
                {DISCARD_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discard Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Observações Adicionais
            </Label>
            <Textarea
              value={discardNotes}
              onChange={(e) => setDiscardNotes(e.target.value)}
              placeholder="Adicione mais detalhes sobre o descarte..."
              className="min-h-[80px] bg-background border-border"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              Ao descartar, a nutrição automática será desativada para este lead.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button variant="outline" onClick={resetAndClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="destructive"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Descartar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
