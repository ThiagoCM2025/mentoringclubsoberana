import { Flame, Thermometer, ThermometerSnowflake, MessageCircle, Clock, Mail, Send, Eye, Zap, ZapOff, Play, Pause, Calendar, GraduationCap, Trophy, FileText, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Database } from "@/integrations/supabase/types";
import { useNurturingSequences } from "@/hooks/useNurturingSequences";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignSelector } from "./CampaignSelector";

type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];
type LeadStatus = Database["public"]["Enums"]["lead_status"];

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: string | null;
  temperature: LeadTemperature | null;
  messages_sent: number | null;
  created_at: string;
  last_contact_at: string | null;
  nurturing_active?: boolean | null;
  nurturing_step?: number | null;
  meeting_scheduled_at?: string | null;
  meeting_status?: string | null;
  meeting_notes?: string | null;
  product_interest?: string | null;
  discard_reason?: string | null;
  student_user_id?: string | null;
}

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onOpenDetails: () => void;
  onOpenTemplates: () => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onNurturingToggle?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (leadId: string, selected: boolean) => void;
  onMakeStudent?: () => void;
  columnStatus?: LeadStatus;
  onOpenWhatsAppInbox?: (phone?: string, name?: string, type?: "lead" | "student", id?: string) => void;
  onDelete?: () => void;
}

const temperatureConfig = {
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  warm: { label: "Morno", icon: Thermometer, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  hot: { label: "Quente", icon: Flame, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const meetingStatusConfig: Record<string, { label: string; color: string }> = {
  agendada: { label: "Agendada", color: "bg-cyan-100 text-cyan-700" },
  realizada: { label: "Realizada", color: "bg-green-100 text-green-700" },
  remarcada: { label: "Remarcada", color: "bg-amber-100 text-amber-700" },
  nao_compareceu: { label: "Não Compareceu", color: "bg-red-100 text-red-700" },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-700" },
};

export function LeadCard({ lead, onClick, onOpenDetails, onOpenTemplates, onDragStart, onNurturingToggle, isSelectionMode = false, isSelected = false, onSelectionChange, onMakeStudent, columnStatus, onOpenWhatsAppInbox, onDelete }: LeadCardProps) {
  const { toast } = useToast();
  const { getCampaignInfo, getSequenceInfo, calculateNextSend } = useNurturingSequences();
  
  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
  const daysSinceCreation = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const isDelayed = !lead.last_contact_at && daysSinceCreation > 2;
  
  const nurturingStep = lead.nurturing_step ?? 0;
  const isNurturingActive = lead.nurturing_active ?? false;
  const sequenceInfo = getSequenceInfo(lead.source, nurturingStep);
  const nextSend = calculateNextSend(lead.source, nurturingStep, lead.last_contact_at);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.phone) return;
    if (onOpenWhatsAppInbox) {
      const cleanPhone = lead.phone.replace(/\D/g, '');
      onOpenWhatsAppInbox(cleanPhone, lead.full_name, "lead", lead.id);
    } else {
      onOpenTemplates();
    }
  };
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`mailto:${lead.email}`, "_blank");
  };

  const handleToggleNurturing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !isNurturingActive;
    
    const { error } = await supabase
      .from("leads")
      .update({ nurturing_active: newStatus })
      .eq("id", lead.id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      toast({ title: newStatus ? "Nurturing ativado" : "Nurturing pausado" });
      onNurturingToggle?.();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir "${lead.full_name}"?`)) {
      onDelete?.();
    }
  };

  const isMeetingColumn = columnStatus === "meeting";
  const isConvertedColumn = columnStatus === "converted";
  const isDiscardedColumn = columnStatus === "discarded";

  return (
    <TooltipProvider>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, lead.id)}
        onClick={onClick}
        className={cn(
          "bg-card border border-border rounded-lg p-2 cursor-grab active:cursor-grabbing",
          "hover:shadow-md hover:border-secondary/50 transition-all duration-200",
          "select-none group"
        )}
      >
        {/* Header - Compact */}
        <div className="flex items-start gap-2 mb-1.5">
          {isSelectionMode && (
            <div className="flex-shrink-0 mt-0.5" onClick={(e) => { e.stopPropagation(); onSelectionChange?.(lead.id, !isSelected); }}>
              <Checkbox checked={isSelected} className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
            </div>
          )}
          
          <div className={cn("w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer", isSelected && "ring-2 ring-secondary ring-offset-1")} onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}>
            <span className="text-primary font-semibold text-xs">{lead.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}>
            <p className="font-medium text-foreground text-xs truncate hover:text-primary transition-colors leading-tight">{lead.full_name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{lead.source || "Direto"}</p>
          </div>
          {temp && (
            <span className={cn("inline-flex items-center px-1 py-0.5 rounded-full flex-shrink-0", temp.color)}>
              <temp.icon className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Meeting Info - Compact */}
        {isMeetingColumn && lead.meeting_scheduled_at && (
          <div className="mb-1.5 p-1.5 bg-cyan-50 dark:bg-cyan-900/20 rounded space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-cyan-600" />
              <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400">
                {format(new Date(lead.meeting_scheduled_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>
              {lead.meeting_status && meetingStatusConfig[lead.meeting_status] && (
                <span className={cn("text-[9px] px-1 py-0.5 rounded-full font-medium", meetingStatusConfig[lead.meeting_status].color)}>
                  {meetingStatusConfig[lead.meeting_status].label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Converted Info - Compact */}
        {isConvertedColumn && (
          <div className="mb-1.5 p-1.5 bg-green-50 dark:bg-green-900/20 rounded space-y-1">
            {lead.product_interest && (
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-medium text-green-700 dark:text-green-400 truncate">{lead.product_interest}</span>
              </div>
            )}
            {!lead.student_user_id && onMakeStudent && (
              <Button size="sm" variant="outline" className="w-full h-6 text-[10px] gap-1 border-green-300 text-green-700 hover:bg-green-100" onClick={(e) => { e.stopPropagation(); onMakeStudent(); }}>
                <GraduationCap className="w-3 h-3" />
                Tornar Aluna
              </Button>
            )}
            {lead.student_user_id && (
              <span className="text-[9px] text-green-600 font-medium flex items-center gap-1">
                <GraduationCap className="w-2.5 h-2.5" /> Já é aluna
              </span>
            )}
          </div>
        )}

        {/* Discarded Info - Compact */}
        {isDiscardedColumn && lead.discard_reason && (
          <div className="mb-1.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">Motivo: {lead.discard_reason}</p>
          </div>
        )}

        {/* Nurturing Status - Compact Single Line */}
        {!isMeetingColumn && !isConvertedColumn && !isDiscardedColumn && (
          <div className="mb-1.5 p-1.5 bg-muted/50 rounded">
            <div className="flex items-center justify-between gap-1">
              <CampaignSelector leadId={lead.id} currentSource={lead.source} currentStep={nurturingStep} onCampaignChange={onNurturingToggle || (() => {})} variant="badge" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{nurturingStep}/{sequenceInfo.maxStep}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleToggleNurturing}>
                  {isNurturingActive ? <Pause className="w-2.5 h-2.5 text-amber-500" /> : <Play className="w-2.5 h-2.5 text-green-500" />}
                </Button>
              </div>
            </div>
            {isNurturingActive && nextSend && (
              <div className="flex items-center gap-1 mt-0.5">
                <Send className="w-2 h-2 text-muted-foreground" />
                <span className={cn("text-[9px]", nextSend.isUrgent ? "text-amber-600 font-medium" : "text-muted-foreground")}>Próximo: {nextSend.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Delayed Badge - Compact */}
        {isDelayed && !isConvertedColumn && !isDiscardedColumn && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
              <Clock className="w-2.5 h-2.5" />Atrasado
            </span>
          </div>
        )}

        {/* Quick Actions - Compact */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
          <div className="flex items-center gap-0.5">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleWhatsAppClick} disabled={!lead.phone}><MessageCircle className={cn("w-3 h-3", lead.phone ? "text-green-600" : "text-muted-foreground")} /></Button></TooltipTrigger><TooltipContent>WhatsApp</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEmailClick}><Mail className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Email</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-secondary" onClick={(e) => { e.stopPropagation(); onOpenTemplates(); }}><FileText className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Templates</TooltipContent></Tooltip>
          </div>
          <div className="flex items-center gap-0.5">
            {onDelete && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteClick}><Trash2 className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Excluir</TooltipContent></Tooltip>
            )}
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}><Eye className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent>Ver Detalhes</TooltipContent></Tooltip>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 mt-1 border-t border-border/50">
          <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" />{lead.messages_sent || 0}</span>
          <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
