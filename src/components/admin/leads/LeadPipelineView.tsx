import { useState, useCallback } from "react";
import { LeadColumn } from "./LeadColumn";
import { LeadMessageModal } from "./LeadMessageModal";
import { LeadDetailModal } from "./LeadDetailModal";
import { LeadConversionDialog } from "./LeadConversionDialog";
import { LeadQualificationModal } from "./LeadQualificationModal";
import { LeadMeetingModal } from "./LeadMeetingModal";
import { LeadDiscardModal } from "./LeadDiscardModal";
import { LeadToStudentDialog } from "./LeadToStudentDialog";
import { BulkActionBar } from "./BulkActionBar";
import { MessageComposer } from "../messaging/MessageComposer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { UserPlus, UserCheck, Handshake, Calendar, Trophy, XCircle } from "lucide-react";

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

interface LeadPipelineViewProps {
  leads: Lead[];
  onRefresh: () => void;
  onOpenWhatsAppInbox?: (phone?: string, name?: string, type?: "lead" | "student", id?: string) => void;
}

const columns = [
  { status: "new" as LeadStatus, label: "Novos", color: "text-blue-700", bgColor: "bg-blue-50", icon: UserPlus },
  { status: "qualified" as LeadStatus, label: "Qualificados", color: "text-purple-700", bgColor: "bg-purple-50", icon: UserCheck },
  { status: "negotiating" as LeadStatus, label: "Negociando", color: "text-orange-700", bgColor: "bg-orange-50", icon: Handshake },
  { status: "meeting" as LeadStatus, label: "Reunião", color: "text-cyan-700", bgColor: "bg-cyan-50", icon: Calendar },
  { status: "converted" as LeadStatus, label: "Clientes", color: "text-green-700", bgColor: "bg-green-50", icon: Trophy },
  { status: "discarded" as LeadStatus, label: "Descartados", color: "text-gray-700", bgColor: "bg-gray-100", icon: XCircle },
];

export function LeadPipelineView({ leads, onRefresh, onOpenWhatsAppInbox }: LeadPipelineViewProps) {
  const { toast } = useToast();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  
  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  
  // Message composer for bulk sending
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false);
  
  // Message modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Conversion dialog
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  // New modals
  const [qualificationModalOpen, setQualificationModalOpen] = useState(false);
  const [qualifyingLead, setQualifyingLead] = useState<Lead | null>(null);
  
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingLead, setMeetingLead] = useState<Lead | null>(null);
  
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [discardingLead, setDiscardingLead] = useState<Lead | null>(null);
  
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [studentLead, setStudentLead] = useState<Lead | null>(null);

  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  // Selection handlers
  const handleSelectionChange = useCallback((leadId: string, selected: boolean) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(leadId);
      } else {
        next.delete(leadId);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLeadIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedLeadIds(new Set(leads.map(l => l.id)));
  }, [leads]);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => {
      if (prev) {
        setSelectedLeadIds(new Set());
      }
      return !prev;
    });
  }, []);

  const handleOpenBulkMessage = useCallback(() => {
    if (selectedLeadIds.size > 0) {
      setBulkMessageOpen(true);
    }
  }, [selectedLeadIds]);

  // Get selected leads as recipients for MessageComposer
  const selectedRecipients = leads
    .filter(l => selectedLeadIds.has(l.id))
    .map(l => ({
      id: l.id,
      name: l.full_name,
      email: l.email,
      phone: l.phone || undefined,
      type: "lead" as const,
    }));

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

    // Handle special status transitions with modals
    if (newStatus === "qualified" && lead.status === "new") {
      setQualifyingLead(lead);
      setQualificationModalOpen(true);
      return;
    }

    if (newStatus === "meeting") {
      setMeetingLead(lead);
      setMeetingModalOpen(true);
      return;
    }

    if (newStatus === "converted") {
      setConvertingLead(lead);
      setConversionDialogOpen(true);
      return;
    }

    if (newStatus === "discarded") {
      setDiscardingLead(lead);
      setDiscardModalOpen(true);
      return;
    }

    // Direct status update for other transitions
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus, last_contact_at: new Date().toISOString() })
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

  const handleOpenDetails = useCallback((lead: Lead) => {
    setDetailLead(lead);
    setDetailModalOpen(true);
  }, []);

  const handleOpenTemplates = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setMessageModalOpen(true);
  }, []);

  const handleMakeStudent = useCallback((lead: Lead) => {
    setStudentLead(lead);
    setStudentDialogOpen(true);
  }, []);

  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  return (
    <>
      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedLeadIds.size}
        onSendMessage={handleOpenBulkMessage}
        onClearSelection={handleClearSelection}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        onSelectAll={handleSelectAll}
        totalLeads={leads.length}
      />

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
              onOpenDetails={handleOpenDetails}
              onOpenTemplates={handleOpenTemplates}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverColumn === column.status}
              onNurturingToggle={onRefresh}
              isSelectionMode={isSelectionMode}
              selectedLeadIds={selectedLeadIds}
              onSelectionChange={handleSelectionChange}
              onMakeStudent={handleMakeStudent}
              onOpenWhatsAppInbox={onOpenWhatsAppInbox}
            />
          </div>
        ))}
      </div>

      {/* Message Modal for single lead */}
      <LeadMessageModal
        open={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onMessageSent={onRefresh}
      />

      {/* Detail Modal */}
      <LeadDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailLead(null);
        }}
        lead={detailLead}
        onLeadUpdated={onRefresh}
        onOpenQualification={() => {
          if (detailLead) {
            setQualifyingLead(detailLead);
            setQualificationModalOpen(true);
          }
        }}
        onOpenMessage={() => {
          if (detailLead) {
            setSelectedLead(detailLead);
            setMessageModalOpen(true);
          }
        }}
      />

      {/* Bulk Message Composer */}
      <MessageComposer
        isOpen={bulkMessageOpen}
        onClose={() => {
          setBulkMessageOpen(false);
          handleClearSelection();
          setIsSelectionMode(false);
        }}
        recipients={selectedRecipients}
        audienceType="lead"
      />

      {/* Qualification Modal */}
      <LeadQualificationModal
        open={qualificationModalOpen}
        onClose={() => {
          setQualificationModalOpen(false);
          setQualifyingLead(null);
        }}
        leadId={qualifyingLead?.id || null}
        leadName={qualifyingLead?.full_name || ""}
        onQualificationComplete={onRefresh}
      />

      {/* Meeting Modal */}
      <LeadMeetingModal
        open={meetingModalOpen}
        onClose={() => {
          setMeetingModalOpen(false);
          setMeetingLead(null);
        }}
        leadId={meetingLead?.id || null}
        leadName={meetingLead?.full_name || ""}
        existingData={meetingLead ? {
          meeting_scheduled_at: meetingLead.meeting_scheduled_at,
          meeting_status: meetingLead.meeting_status,
          meeting_link: meetingLead.meeting_link,
          meeting_notes: meetingLead.meeting_notes,
        } : undefined}
        onMeetingScheduled={onRefresh}
      />

      {/* Discard Modal */}
      <LeadDiscardModal
        open={discardModalOpen}
        onClose={() => {
          setDiscardModalOpen(false);
          setDiscardingLead(null);
        }}
        leadId={discardingLead?.id || null}
        leadName={discardingLead?.full_name || ""}
        onDiscardComplete={onRefresh}
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

      {/* Lead to Student Dialog */}
      <LeadToStudentDialog
        open={studentDialogOpen}
        onClose={() => {
          setStudentDialogOpen(false);
          setStudentLead(null);
        }}
        leadId={studentLead?.id || null}
        leadName={studentLead?.full_name || ""}
        leadEmail={studentLead?.email || ""}
        leadPhone={studentLead?.phone}
        onConversionComplete={onRefresh}
      />
    </>
  );
}
