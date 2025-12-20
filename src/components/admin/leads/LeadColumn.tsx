import { cn } from "@/lib/utils";
import { LeadCard } from "./LeadCard";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus | null;
  temperature: LeadTemperature | null;
  messages_sent: number | null;
  created_at: string;
  last_contact_at: string | null;
}

interface ColumnConfig {
  status: LeadStatus;
  label: string;
  color: string;
  bgColor: string;
}

interface LeadColumnProps {
  config: ColumnConfig;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
  isDragOver: boolean;
}

export function LeadColumn({
  config,
  leads,
  onLeadClick,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: LeadColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-lg border border-border bg-muted/30",
        "transition-all duration-200",
        isDragOver && "ring-2 ring-secondary/50 bg-secondary/5"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, config.status)}
    >
      {/* Header */}
      <div className={cn("px-4 py-3 rounded-t-lg", config.bgColor)}>
        <div className="flex items-center justify-between">
          <h3 className={cn("font-semibold text-sm", config.color)}>{config.label}</h3>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            "bg-background/80 text-foreground"
          )}>
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[200px]">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            Nenhum lead
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
