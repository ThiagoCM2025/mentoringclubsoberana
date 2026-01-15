import { Flame, Thermometer, ThermometerSnowflake, MessageCircle, Clock, Mail, Send, Eye, Zap, ZapOff, Play, Pause, Calendar, GraduationCap, Trophy, FileText } from "lucide-react";
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

export function LeadCard({ lead, onClick, onOpenDetails, onOpenTemplates, onDragStart, onNurturingToggle, isSelectionMode = false, isSelected = false, onSelectionChange, onMakeStudent, columnStatus }: LeadCardProps) {
  const { toast } = useToast();
  const { getCampaignInfo, getSequenceInfo, calculateNextSend } = useNurturingSequences();
  
  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
  const daysSinceCreation = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const isDelayed = !lead.last_contact_at && daysSinceCreation > 2;
  
  const nurturingStep = lead.nurturing_step ?? 0;
  const isNurturingActive = lead.nurturing_active ?? false;
  const sequenceInfo = getSequenceInfo(lead.source, nurturingStep);
  const nextSend = calculateNextSend(lead.source, nurturingStep, lead.last_contact_at);

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.phone) return;
    
    try {
      const { error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          phone: lead.phone,
          message: `Olá ${lead.full_name}! Tudo bem?`,
          leadId: lead.id,
          leadName: lead.full_name,
        }
      });
      
      if (error) throw error;
      toast({ title: "Mensagem enviada via WhatsApp!" });
    } catch (err) {
      console.error("WhatsApp API error:", err);
      // Fallback para wa.me caso a API falhe
      const cleanPhone = lead.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${cleanPhone}`, "_blank");
      toast({ 
        title: "Abrindo WhatsApp Web", 
        description: "API indisponível, abrindo via wa.me" 
      });
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
          "bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing",
          "hover:shadow-md hover:border-secondary/50 transition-all duration-200",
          "select-none group"
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          {isSelectionMode && (
            <div className="flex-shrink-0 mt-1" onClick={(e) => { e.stopPropagation(); onSelectionChange?.(lead.id, !isSelected); }}>
              <Checkbox checked={isSelected} className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
            </div>
          )}
          
          <div className={cn("w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer", isSelected && "ring-2 ring-secondary ring-offset-2")} onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}>
            <span className="text-primary font-semibold text-sm">{lead.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}>
            <p className="font-medium text-foreground text-sm truncate hover:text-primary transition-colors">{lead.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{lead.source || "Direto"}</p>
          </div>
          {temp && (
            <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0", temp.color)}>
              <temp.icon className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Meeting Info */}
        {isMeetingColumn && lead.meeting_scheduled_at && (
          <div className="mb-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400">
                {format(new Date(lead.meeting_scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            {lead.meeting_status && meetingStatusConfig[lead.meeting_status] && (
              <span className={cn("inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium", meetingStatusConfig[lead.meeting_status].color)}>
                {meetingStatusConfig[lead.meeting_status].label}
              </span>
            )}
            {lead.meeting_notes && (
              <p className="text-[10px] text-muted-foreground line-clamp-2">{lead.meeting_notes}</p>
            )}
          </div>
        )}

        {/* Converted Info */}
        {isConvertedColumn && (
          <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md space-y-2">
            {lead.product_interest && (
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">{lead.product_interest}</span>
              </div>
            )}
            {!lead.student_user_id && onMakeStudent && (
              <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5 border-green-300 text-green-700 hover:bg-green-100" onClick={(e) => { e.stopPropagation(); onMakeStudent(); }}>
                <GraduationCap className="w-3.5 h-3.5" />
                Tornar Aluna
              </Button>
            )}
            {lead.student_user_id && (
              <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Já é aluna
              </span>
            )}
          </div>
        )}

        {/* Discarded Info */}
        {isDiscardedColumn && lead.discard_reason && (
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-400">Motivo: {lead.discard_reason}</p>
          </div>
        )}

        {/* Nurturing Status - Only for new/qualified columns */}
        {!isMeetingColumn && !isConvertedColumn && !isDiscardedColumn && (
          <div className="mb-2 p-2 bg-muted/50 rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <CampaignSelector leadId={lead.id} currentSource={lead.source} currentStep={nurturingStep} onCampaignChange={onNurturingToggle || (() => {})} variant="badge" />
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleToggleNurturing}>
                {isNurturingActive ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-green-500" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isNurturingActive ? <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" /> : <ZapOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              <span className="text-[11px] text-foreground">Step {nurturingStep}/{sequenceInfo.maxStep}</span>
            </div>
            {isNurturingActive && nextSend && (
              <div className="flex items-center gap-1.5">
                <Send className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                <span className={cn("text-[10px]", nextSend.isUrgent ? "text-amber-600 font-medium" : "text-muted-foreground")}>Próximo: {nextSend.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Delayed Badge */}
        {isDelayed && !isConvertedColumn && !isDiscardedColumn && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <Clock className="w-3 h-3" />Atrasado
            </span>
          </div>
        )}

        {/* Quick Actions - Always Visible */}
        <div className="flex items-center justify-between mb-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleWhatsAppClick} disabled={!lead.phone}><MessageCircle className={cn("w-3.5 h-3.5", lead.phone ? "text-green-600" : "text-muted-foreground")} /></Button></TooltipTrigger><TooltipContent>WhatsApp</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEmailClick}><Mail className="w-3.5 h-3.5" /></Button></TooltipTrigger><TooltipContent>Email</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-secondary" onClick={(e) => { e.stopPropagation(); onOpenTemplates(); }}><FileText className="w-3.5 h-3.5" /></Button></TooltipTrigger><TooltipContent>Templates</TooltipContent></Tooltip>
          </div>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}><Eye className="w-3.5 h-3.5" /></Button></TooltipTrigger><TooltipContent>Ver Detalhes</TooltipContent></Tooltip>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{lead.messages_sent || 0} msgs</span>
          <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
