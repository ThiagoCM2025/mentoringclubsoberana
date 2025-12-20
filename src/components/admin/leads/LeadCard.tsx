import { Flame, Thermometer, ThermometerSnowflake, MessageCircle, Mail, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
}

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

const temperatureConfig = {
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "bg-blue-100 text-blue-700" },
  warm: { label: "Morno", icon: Thermometer, color: "bg-yellow-100 text-yellow-700" },
  hot: { label: "Quente", icon: Flame, color: "bg-red-100 text-red-700" },
};

export function LeadCard({ lead, onClick, onDragStart }: LeadCardProps) {
  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
  const daysSinceCreation = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const isDelayed = !lead.last_contact_at && daysSinceCreation > 2;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing",
        "hover:shadow-md hover:border-secondary/50 transition-all duration-200",
        "select-none"
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
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {temp && (
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", temp.color)}>
            <temp.icon className="w-3 h-3" />
            {temp.label}
          </span>
        )}
        {isDelayed && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <Clock className="w-3 h-3" />
            Atrasado
          </span>
        )}
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
  );
}
