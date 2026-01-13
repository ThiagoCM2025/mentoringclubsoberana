import { Flame, Thermometer, ThermometerSnowflake, MessageCircle, Clock, Mail, Send, Eye, Zap, ZapOff, Play, Pause, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
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
}

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onNurturingToggle?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (leadId: string, selected: boolean) => void;
}

const temperatureConfig = {
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  warm: { label: "Morno", icon: Thermometer, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  hot: { label: "Quente", icon: Flame, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function LeadCard({ lead, onClick, onDragStart, onNurturingToggle, isSelectionMode = false, isSelected = false, onSelectionChange }: LeadCardProps) {
  const { toast } = useToast();
  const { getCampaignInfo, getSequenceInfo, calculateNextSend } = useNurturingSequences();
  
  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
  const daysSinceCreation = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const isDelayed = !lead.last_contact_at && daysSinceCreation > 2;
  
  const nurturingStep = lead.nurturing_step ?? 0;
  const isNurturingActive = lead.nurturing_active ?? false;
  
  // Get campaign and sequence info
  const campaign = getCampaignInfo(lead.source);
  const sequenceInfo = getSequenceInfo(lead.source, nurturingStep);
  const nextSend = calculateNextSend(lead.source, nurturingStep, lead.last_contact_at);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${cleanPhone}`, "_blank");
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
          {/* Checkbox for selection mode */}
          {isSelectionMode && (
            <div 
              className="flex-shrink-0 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelectionChange?.(lead.id, !isSelected);
              }}
            >
              <Checkbox 
                checked={isSelected}
                className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
              />
            </div>
          )}
          
          <div className={cn(
            "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0",
            isSelected && "ring-2 ring-secondary ring-offset-2"
          )}>
            <span className="text-primary font-semibold text-sm">
              {lead.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{lead.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{lead.source || "Direto"}</p>
          </div>
          {/* Temperature badge on header */}
          {temp && (
            <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0", temp.color)}>
              <temp.icon className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Nurturing Status - Enhanced */}
        <div className="mb-2 p-2 bg-muted/50 rounded-md space-y-1.5">
          {/* Campaign Selector */}
          <div className="flex items-center justify-between">
            <CampaignSelector
              leadId={lead.id}
              currentSource={lead.source}
              currentStep={nurturingStep}
              onCampaignChange={onNurturingToggle || (() => {})}
              variant="badge"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={handleToggleNurturing}
                >
                  {isNurturingActive ? (
                    <Pause className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Play className="w-3 h-3 text-green-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isNurturingActive ? "Pausar nurturing" : "Ativar nurturing"}
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Step Info */}
          <div className="flex items-center gap-2">
            {isNurturingActive ? (
              <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
            ) : (
              <ZapOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-[11px] text-foreground">
              Step {nurturingStep}/{sequenceInfo.maxStep}
              {nurturingStep > 0 && (
                <span className="text-muted-foreground"> • {sequenceInfo.currentName}</span>
              )}
            </span>
          </div>
          
          {/* Next Send */}
          {isNurturingActive && nextSend && (
            <div className="flex items-center gap-1.5">
              <Send className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
              <span className={cn(
                "text-[10px]",
                nextSend.isUrgent 
                  ? "text-amber-600 dark:text-amber-400 font-medium" 
                  : "text-muted-foreground"
              )}>
                Próximo: {nextSend.text}
                {nextSend.nextStepName && (
                  <span className="text-muted-foreground"> ({nextSend.nextStepName})</span>
                )}
              </span>
            </div>
          )}
          
          {/* Completed badge */}
          {sequenceInfo.isComplete && (
            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
              ✓ Sequência completa
            </span>
          )}
        </div>

        {/* Badges */}
        {isDelayed && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <Clock className="w-3 h-3" />
              Atrasado
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleEmailClick}
              >
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enviar Email</TooltipContent>
          </Tooltip>
          
          {lead.phone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abrir WhatsApp</TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver Detalhes</TooltipContent>
          </Tooltip>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {lead.messages_sent || 0} msgs
          </span>
          <span>
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
