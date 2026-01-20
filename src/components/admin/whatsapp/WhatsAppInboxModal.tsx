import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWhatsAppConversations } from "@/hooks/useWhatsAppConversations";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { TemplateDrawer } from "./TemplateDrawer";
import { NewConversationDialog } from "./NewConversationDialog";
import { useNavigate } from "react-router-dom";

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
  } = useWhatsAppConversations();

  // Handle initial contact when modal opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && initialPhone) {
      const conversation = await getOrCreateConversation(
        initialPhone,
        initialContactName,
        initialContactType,
        initialContactId
      );
      if (conversation) {
        selectConversation(conversation);
      }
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

  const handleViewContact = () => {
    if (!selectedConversation) return;
    
    onOpenChange(false);
    
    if (selectedConversation.contact_type === "lead" && selectedConversation.contact_id) {
      // Navigate to leads page (the detail modal can be opened from there)
      navigate("/admin/leads");
    } else if (selectedConversation.contact_type === "student" && selectedConversation.contact_id) {
      navigate(`/admin/alunos/${selectedConversation.contact_id}`);
    }
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    await archiveConversation(selectedConversation.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0 overflow-hidden">
          {/* Custom header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#00a884] dark:bg-[#00a884]">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <h2 className="font-semibold text-white">WhatsApp Business</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Conversation list - left panel */}
            <div className="w-80 border-r border-border flex-shrink-0">
              <ConversationList
                conversations={conversations}
                loading={loading}
                selectedId={selectedConversation?.id || null}
                onSelect={selectConversation}
                onNewConversation={() => setShowNewConversation(true)}
              />
            </div>

            {/* Chat window - right panel */}
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              loading={messagesLoading}
              onSendMessage={handleSendMessage}
              onOpenTemplates={() => setShowTemplates(true)}
              onArchive={handleArchive}
              onViewContact={handleViewContact}
            />

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
    </>
  );
}
