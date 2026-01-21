import { cn } from "@/lib/utils";
import { LeadCard } from "./LeadCard";
import type { Database } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";

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
  nurturing_active?: boolean | null;
  nurturing_step?: number | null;
  // New fields
  pain_points?: string[] | null;
  mentoring_goals?: string | null;
  practice_area?: string | null;
  product_interest?: string | null;
  investment_range?: string | null;
  meeting_scheduled_at?: string | null;
  meeting_status?: string | null;
  meeting_link?: string | null;
  meeting_notes?: string | null;
  discard_reason?: string | null;
  discard_notes?: string | null;
  student_user_id?: string | null;
}

interface ColumnConfig {
  status: LeadStatus;
  label: string;
  color: string;
  bgColor: string;
  icon?: LucideIcon;
}

interface LeadColumnProps {
  config: ColumnConfig;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onOpenDetails: (lead: Lead) => void;
  onOpenTemplates: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
  isDragOver: boolean;
  onNurturingToggle?: () => void;
  isSelectionMode?: boolean;
  selectedLeadIds?: Set<string>;
  onSelectionChange?: (leadId: string, selected: boolean) => void;
  onMakeStudent?: (lead: Lead) => void;
  onOpenWhatsAppInbox?: (phone?: string, name?: string, type?: "lead" | "student", id?: string) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadColumn({
  config,
  leads,
  onLeadClick,
  onOpenDetails,
  onOpenTemplates,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  onNurturingToggle,
  isSelectionMode = false,
  selectedLeadIds = new Set(),
  onSelectionChange,
  onMakeStudent,
  onOpenWhatsAppInbox,
  onDeleteLead,
}: LeadColumnProps) {
  const Icon = config.icon;
  
  return (
    <div
      className={cn(
        "flex flex-col min-w-[240px] max-w-[280px] rounded-lg border border-border bg-muted/30",
        "transition-all duration-200",
        isDragOver && "ring-2 ring-secondary/50 bg-secondary/5"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, config.status)}
    >
      {/* Header */}
      <div className={cn("px-3 py-2 rounded-t-lg", config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Icon && <Icon className={cn("w-3.5 h-3.5", config.color)} />}
            <h3 className={cn("font-semibold text-xs", config.color)}>{config.label}</h3>
          </div>
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
            "bg-background/80 text-foreground"
          )}>
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px]">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
            Nenhum lead
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
              onOpenDetails={() => onOpenDetails(lead)}
              onOpenTemplates={() => onOpenTemplates(lead)}
              onDragStart={onDragStart}
              onNurturingToggle={onNurturingToggle}
              isSelectionMode={isSelectionMode}
              isSelected={selectedLeadIds.has(lead.id)}
              onSelectionChange={onSelectionChange}
              onMakeStudent={onMakeStudent ? () => onMakeStudent(lead) : undefined}
              columnStatus={config.status}
              onOpenWhatsAppInbox={onOpenWhatsAppInbox}
              onDelete={onDeleteLead ? () => onDeleteLead(lead.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
