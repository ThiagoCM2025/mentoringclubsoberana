import { useState, useCallback } from "react";
import { LeadColumn } from "./LeadColumn";
import { LeadMessageModal } from "./LeadMessageModal";
import { LeadConversionDialog } from "./LeadConversionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  nurturing_active?: boolean | null;
  nurturing_step?: number | null;
}

interface LeadPipelineViewProps {
  leads: Lead[];
  onRefresh: () => void;
}

const columns = [
  { status: "new" as LeadStatus, label: "Novos", color: "text-blue-700", bgColor: "bg-blue-50" },
  { status: "contacted" as LeadStatus, label: "Contactados", color: "text-orange-700", bgColor: "bg-orange-50" },
  { status: "negotiating" as LeadStatus, label: "Em Tratativa", color: "text-purple-700", bgColor: "bg-purple-50" },
  { status: "converted" as LeadStatus, label: "Clientes", color: "text-green-700", bgColor: "bg-green-50" },
  { status: "lost" as LeadStatus, label: "Descartados", color: "text-gray-700", bgColor: "bg-gray-100" },
];

export function LeadPipelineView({ leads, onRefresh }: LeadPipelineViewProps) {
  const { toast } = useToast();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  
  // Message modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Conversion dialog
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((status: LeadStatus) => {
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    setDragOverColumn(null);
    setDraggedLeadId(null);

    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Se está movendo para "converted", abrir dialog de conversão
    if (newStatus === "converted") {
      setConvertingLead(lead);
      setConversionDialogOpen(true);
      return;
    }

    // Atualizar status diretamente
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      toast({ title: `Lead movido para ${columns.find(c => c.status === newStatus)?.label}` });
      onRefresh();
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({ title: "Erro ao mover lead", variant: "destructive" });
    }
  }, [leads, onRefresh, toast]);

  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setMessageModalOpen(true);
  }, []);

  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  return (
    <>
      <div 
        className="flex gap-4 overflow-x-auto pb-4"
        onDragLeave={handleDragLeave}
      >
        {columns.map((column) => (
          <div
            key={column.status}
            onDragEnter={() => handleDragEnter(column.status)}
          >
            <LeadColumn
              config={column}
              leads={getLeadsByStatus(column.status)}
              onLeadClick={handleLeadClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverColumn === column.status}
              onNurturingToggle={onRefresh}
            />
          </div>
        ))}
      </div>

      {/* Message Modal */}
      <LeadMessageModal
        open={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onMessageSent={onRefresh}
      />

      {/* Conversion Dialog */}
      <LeadConversionDialog
        open={conversionDialogOpen}
        onClose={() => {
          setConversionDialogOpen(false);
          setConvertingLead(null);
        }}
        leadId={convertingLead?.id || null}
        leadName={convertingLead?.full_name || ""}
        onConversionComplete={onRefresh}
      />
    </>
  );
}
