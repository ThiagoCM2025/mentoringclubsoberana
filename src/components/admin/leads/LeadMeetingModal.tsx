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
import { Input } from "@/components/ui/input";
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
import { Loader2, Calendar, Link as LinkIcon, FileText } from "lucide-react";

const MEETING_STATUSES = [
  { value: "agendada", label: "Agendada" },
  { value: "realizada", label: "Realizada" },
  { value: "remarcada", label: "Remarcada" },
  { value: "nao_compareceu", label: "Não Compareceu" },
  { value: "cancelada", label: "Cancelada" },
];

interface LeadMeetingModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  leadName: string;
  existingData?: {
    meeting_scheduled_at?: string | null;
    meeting_status?: string | null;
    meeting_link?: string | null;
    meeting_notes?: string | null;
  };
  onMeetingScheduled: () => void;
}

export function LeadMeetingModal({
  open,
  onClose,
  leadId,
  leadName,
  existingData,
  onMeetingScheduled,
}: LeadMeetingModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [meetingDate, setMeetingDate] = useState(
    existingData?.meeting_scheduled_at
      ? new Date(existingData.meeting_scheduled_at).toISOString().slice(0, 16)
      : ""
  );
  const [meetingStatus, setMeetingStatus] = useState(
    existingData?.meeting_status || "agendada"
  );
  const [meetingLink, setMeetingLink] = useState(
    existingData?.meeting_link || ""
  );
  const [meetingNotes, setMeetingNotes] = useState(
    existingData?.meeting_notes || ""
  );

  const handleSave = async () => {
    if (!leadId) return;

    if (!meetingDate) {
      toast({ title: "Informe a data da reunião", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status: "meeting",
          meeting_scheduled_at: new Date(meetingDate).toISOString(),
          meeting_status: meetingStatus,
          meeting_link: meetingLink || null,
          meeting_notes: meetingNotes || null,
          last_contact_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (error) throw error;

      toast({ title: "Reunião agendada com sucesso!" });
      onMeetingScheduled();
      resetAndClose();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({ title: "Erro ao agendar reunião", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setMeetingDate("");
    setMeetingStatus("agendada");
    setMeetingLink("");
    setMeetingNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden bg-card border-border">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            Agendar Reunião: {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
          {/* Meeting Date/Time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data e Hora
            </Label>
            <Input
              type="datetime-local"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Meeting Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status da Reunião</Label>
            <Select value={meetingStatus} onValueChange={setMeetingStatus}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione o status..." />
              </SelectTrigger>
              <SelectContent>
                {MEETING_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Link da Reunião (opcional)
            </Label>
            <Input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/... ou zoom.us/..."
              className="bg-background border-border"
            />
          </div>

          {/* Meeting Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Observações
            </Label>
            <Textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Adicione observações sobre a reunião..."
              className="min-h-[80px] bg-background border-border"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button variant="outline" onClick={resetAndClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Agendar Reunião
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
