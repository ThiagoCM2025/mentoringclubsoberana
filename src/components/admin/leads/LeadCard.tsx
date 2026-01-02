import { Flame, Thermometer, ThermometerSnowflake, MessageCircle, Clock, Mail, Send, Eye, Zap, ZapOff } from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Database } from "@/integrations/supabase/types";

type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string | null;
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
}

const temperatureConfig = {
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  warm: { label: "Morno", icon: Thermometer, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  hot: { label: "Quente", icon: Flame, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const stepColors = [
  "bg-gray-100 text-gray-600",      // 0 - not started
  "bg-blue-100 text-blue-700",       // 1
  "bg-cyan-100 text-cyan-700",       // 2
  "bg-emerald-100 text-emerald-700", // 3
  "bg-amber-100 text-amber-700",     // 4
  "bg-green-100 text-green-700",     // 5 - completed
];

export function LeadCard({ lead, onClick, onDragStart }: LeadCardProps) {
  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
  const daysSinceCreation = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const isDelayed = !lead.last_contact_at && daysSinceCreation > 2;
  
  const nurturingStep = lead.nurturing_step ?? 0;
  const isNurturingActive = lead.nurturing_active ?? false;
  const totalSteps = 5;
  
  // Calculate next send time (assuming 24h delay between steps)
  const getNextSendInfo = () => {
    if (!isNurturingActive || nurturingStep >= totalSteps) return null;
    
    if (!lead.last_contact_at) {
      return { text: "Enviando em breve", urgent: true };
    }
    
    const lastContact = new Date(lead.last_contact_at);
    const hoursElapsed = differenceInHours(new Date(), lastContact);
    const hoursRemaining = 24 - hoursElapsed;
    
    if (hoursRemaining <= 0) {
      return { text: "Enviando em breve", urgent: true };
    } else if (hoursRemaining <= 6) {
      return { text: `Em ${hoursRemaining}h`, urgent: true };
    } else {
      return { text: `Em ${hoursRemaining}h`, urgent: false };
    }
  };
  
  const nextSend = getNextSendInfo();

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
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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

        {/* Nurturing Status */}
        <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-md">
          <div className="flex items-center gap-1.5 flex-1">
            {isNurturingActive ? (
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <ZapOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className={cn(
              "text-[11px] font-medium px-1.5 py-0.5 rounded",
              stepColors[Math.min(nurturingStep, 5)]
            )}>
              {nurturingStep}/{totalSteps}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isNurturingActive ? "Ativo" : "Pausado"}
            </span>
          </div>
          
          {nextSend && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1",
                  nextSend.urgent 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <Send className="w-2.5 h-2.5" />
                  {nextSend.text}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Próximo e-mail de nurturing</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {isDelayed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <Clock className="w-3 h-3" />
              Atrasado
            </span>
          )}
        </div>

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
