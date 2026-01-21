import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useWhatsAppConversations, type WhatsAppConversation } from "@/hooks/useWhatsAppConversations";
import { useWhatsAppSound } from "@/hooks/useWhatsAppSound";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { TemplateDrawer } from "./TemplateDrawer";
import { NewConversationDialog } from "./NewConversationDialog";
import { LeadDetailModal } from "@/components/admin/leads/LeadDetailModal";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppInboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPhone?: string;
  initialContactName?: string;
  initialContactType?: "lead" | "student";
  initialContactId?: string;
}

export function WhatsAppInboxModal({
  open,
  onOpenChange,
  initialPhone,
  initialContactName,
  initialContactType,
  initialContactId,
}: WhatsAppInboxModalProps) {
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [archivedConversations, setArchivedConversations] = useState<WhatsAppConversation[]>([]);
  const [leadDetailOpen, setLeadDetailOpen] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);
  const { soundEnabled, toggleSound } = useWhatsAppSound();
  
  const {
    conversations,
    loading,
    selectedConversation,
    messages,
    messagesLoading,
    selectConversation,
    sendMessage,
    getOrCreateConversation,
    archiveConversation,
    unarchiveConversation,
    fetchArchivedConversations,
  } = useWhatsAppConversations();

  // Fetch archived conversations when modal opens
  useEffect(() => {
    if (open) {
      fetchArchivedConversations().then(setArchivedConversations);
    }
  }, [open, fetchArchivedConversations]);

  // Handle conversation selection when initialPhone changes (even if modal already open)
  useEffect(() => {
    const selectInitialConversation = async () => {
      if (!open || !initialPhone) return;
      
      // Clean phone number - remove all non-numeric characters
      const cleanPhone = initialPhone.replace(/\D/g, '');
      // Format phone with country code if needed
      const formattedPhone = cleanPhone.startsWith('55') 
        ? cleanPhone 
        : `55${cleanPhone}`;
      
      const conversation = await getOrCreateConversation(
        formattedPhone,
        initialContactName,
        initialContactType,
        initialContactId
      );
      if (conversation) {
        selectConversation(conversation);
      }
    };
    
    selectInitialConversation();
  }, [open, initialPhone, initialContactName, initialContactType, initialContactId]);

  const handleUnarchive = async (conversationId: string) => {
    await unarchiveConversation(conversationId);
    // Refresh archived list
    const archived = await fetchArchivedConversations();
    setArchivedConversations(archived);
  };

  // Handle initial contact when modal opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && initialPhone) {
      // Clean phone number - remove all non-numeric characters first
      const cleanPhone = initialPhone.replace(/\D/g, '');
      // Format phone with country code if needed
      const formattedPhone = cleanPhone.startsWith('55') 
        ? cleanPhone 
        : `55${cleanPhone}`;
      
      const conversation = await getOrCreateConversation(
        formattedPhone,
        initialContactName,
        initialContactType,
        initialContactId
      );
      if (conversation) {
        selectConversation(conversation);
      }
    } else if (!isOpen) {
      // Reset selection when closing
      selectConversation(null as any);
    }
    onOpenChange(isOpen);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;
    await sendMessage(selectedConversation.phone, message, selectedConversation.id);
  };

  const handleSelectTemplate = (message: string) => {
    // Template will be inserted via the input
    const input = document.querySelector('input[placeholder="Digite uma mensagem..."]') as HTMLInputElement;
    if (input) {
      input.value = message;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    }
  };

  const handleNewConversation = async (
    phone: string,
    name: string,
    type: "lead" | "student",
    id: string
  ) => {
    const conversation = await getOrCreateConversation(phone, name, type, id || undefined);
    if (conversation) {
      selectConversation(conversation);
    }
  };

  const handleViewContact = async () => {
    if (!selectedConversation) return;
    
    if (selectedConversation.contact_type === "lead" && selectedConversation.contact_id) {
      // Fetch lead data and open modal
      const { data: lead } = await supabase
        .from("leads")
        .select("*")
        .eq("id", selectedConversation.contact_id)
        .maybeSingle();
      
      if (lead) {
        setLeadData(lead);
        setLeadDetailOpen(true);
      }
    } else if (selectedConversation.contact_type === "student" && selectedConversation.contact_id) {
      onOpenChange(false);
      navigate(`/admin/alunos/${selectedConversation.contact_id}`);
    }
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    await archiveConversation(selectedConversation.id);
  };

  const handleBackToList = () => {
    selectConversation(null as any);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-full h-[90vh] sm:h-[85vh] p-0 gap-0 overflow-hidden rounded-xl" hideClose aria-describedby={undefined}>
          <VisuallyHidden>
            <DialogTitle>WhatsApp Business Inbox</DialogTitle>
          </VisuallyHidden>
          {/* Custom header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#00a884] to-[#128C7E]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <h2 className="font-semibold text-white text-sm sm:text-base">WhatsApp Business</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Main content - responsive layout */}
          <div className="flex flex-1 min-h-0 overflow-hidden relative">
            {/* Conversation list - left panel */}
            <div className={cn(
              "w-full sm:w-80 border-r border-border flex-shrink-0 transition-all duration-200",
              selectedConversation && "hidden sm:block"
            )}>
              <ConversationList
                conversations={conversations}
                archivedConversations={archivedConversations}
                loading={loading}
                selectedId={selectedConversation?.id || null}
                onSelect={selectConversation}
                onNewConversation={() => setShowNewConversation(true)}
                onUnarchive={handleUnarchive}
              />
            </div>

            {/* Chat window - right panel */}
            <div className={cn(
              "flex-1 flex flex-col",
              !selectedConversation && "hidden sm:flex"
            )}>
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                loading={messagesLoading}
                onSendMessage={handleSendMessage}
                onOpenTemplates={() => setShowTemplates(true)}
                onArchive={handleArchive}
                onViewContact={handleViewContact}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                onBack={handleBackToList}
              />
            </div>

            {/* Template drawer */}
            <TemplateDrawer
              isOpen={showTemplates}
              onClose={() => setShowTemplates(false)}
              onSelectTemplate={handleSelectTemplate}
              contactName={selectedConversation?.contact_name || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onSelectContact={handleNewConversation}
      />

      {/* Lead detail modal */}
      <LeadDetailModal
        open={leadDetailOpen}
        onClose={() => {
          setLeadDetailOpen(false);
          setLeadData(null);
        }}
        lead={leadData}
        onLeadUpdated={() => {
          // Optionally refresh conversation data
        }}
      />
    </>
  );
}
