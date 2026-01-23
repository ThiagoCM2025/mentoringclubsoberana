import { useState, useEffect, useCallback } from "react";
import { X, MessageCircle, Wifi, WifiOff, Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useWhatsAppConversations, type WhatsAppConversation, type WhatsAppMessage } from "@/hooks/useWhatsAppConversations";
import { useWhatsAppSound } from "@/hooks/useWhatsAppSound";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { TemplateDrawer } from "./TemplateDrawer";
import { NewConversationDialog } from "./NewConversationDialog";
import { LeadDetailModal } from "@/components/admin/leads/LeadDetailModal";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const { playNotification, soundEnabled, toggleSound } = useWhatsAppSound();
  
  // Callback para tocar som quando mensagem recebida
  const handleNewIncomingMessage = useCallback((message: WhatsAppMessage) => {
    if (open && !message.sent_by) {
      playNotification();
    }
  }, [open, playNotification]);
  
  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    state: "checking" | "open" | "close" | "error";
    hourlyRemaining?: number;
    dailyRemaining?: number;
  }>({ connected: false, state: "checking" });
  
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
    deleteConversation,
    deleteMessage,
    fetchArchivedConversations,
    refreshConversations,
    pinConversation,
    muteConversation,
    favoriteConversation,
    blockConversation,
    markAsUnread,
  } = useWhatsAppConversations({ onNewIncomingMessage: handleNewIncomingMessage });

  // Check WhatsApp connection status
  const checkConnectionStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-whatsapp-status");
      if (error) throw error;
      
      setConnectionStatus({
        connected: data?.connected ?? false,
        state: data?.state === "open" ? "open" : data?.state === "error" ? "error" : "close",
        hourlyRemaining: data?.rateLimit?.hourlyRemaining,
        dailyRemaining: data?.rateLimit?.dailyRemaining,
      });
    } catch (err) {
      console.error("Error checking WhatsApp status:", err);
      setConnectionStatus({ connected: false, state: "error" });
    }
  }, []);

  // Fetch archived conversations and check status when modal opens
  useEffect(() => {
    if (open) {
      fetchArchivedConversations().then(setArchivedConversations);
      refreshConversations?.(); // Refresh active conversations
      checkConnectionStatus(); // Check status immediately
      
      // Check status every 30 seconds while modal is open
      const interval = setInterval(checkConnectionStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [open, fetchArchivedConversations, refreshConversations, checkConnectionStatus]);

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
    
    const { phone, contact_type, contact_id } = selectedConversation;
    
    if (contact_type === "lead") {
      let leadId = contact_id;
      
      // Fallback: buscar pelo telefone se não tiver contact_id
      if (!leadId) {
        const normalizedPhone = phone.replace(/^55/, '');
        const { data: foundLead } = await supabase
          .from("leads")
          .select("id")
          .or(`phone.eq.${phone},phone.eq.${normalizedPhone},phone.eq.55${normalizedPhone}`)
          .maybeSingle();
        
        if (foundLead) {
          leadId = foundLead.id;
          // Atualizar conversa para futuras consultas
          await supabase
            .from("whatsapp_conversations")
            .update({ contact_id: foundLead.id })
            .eq("id", selectedConversation.id);
        }
      }
      
      if (leadId) {
        const { data: lead } = await supabase
          .from("leads")
          .select("*")
          .eq("id", leadId)
          .maybeSingle();
        
        if (lead) {
          setLeadData(lead);
          setLeadDetailOpen(true);
          return;
        }
      }
      
    } else if (contact_type === "student") {
      let studentId = contact_id;
      
      // Fallback: buscar pelo telefone se não tiver contact_id
      if (!studentId) {
        const normalizedPhone = phone.replace(/^55/, '');
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .or(`phone.eq.${phone},phone.eq.${normalizedPhone},phone.eq.55${normalizedPhone}`)
          .maybeSingle();
        
        if (profile) {
          studentId = profile.user_id;
          await supabase
            .from("whatsapp_conversations")
            .update({ contact_id: profile.user_id })
            .eq("id", selectedConversation.id);
        }
      }
      
      if (studentId) {
        onOpenChange(false);
        navigate(`/admin/alunos/${studentId}`);
        return;
      }
    }
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    await archiveConversation(selectedConversation.id);
    // Atualizar lista de arquivadas imediatamente
    const archived = await fetchArchivedConversations();
    setArchivedConversations(archived);
  };

  const handleBackToList = () => {
    selectConversation(null as any);
  };

  // Context menu handlers
  const handlePin = async (conversationId: string, pin: boolean) => {
    await pinConversation(conversationId, pin);
  };

  const handleMute = async (conversationId: string, mute: boolean) => {
    await muteConversation(conversationId, mute);
  };

  const handleFavorite = async (conversationId: string, favorite: boolean) => {
    await favoriteConversation(conversationId, favorite);
  };

  const handleBlock = async (conversationId: string, block: boolean) => {
    await blockConversation(conversationId, block);
  };

  const handleMarkUnread = async (conversationId: string) => {
    await markAsUnread(conversationId);
  };


  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          variant="fullscreen"
          className="w-full h-full max-w-none max-h-none p-0 gap-0 overflow-hidden border-0 rounded-none" 
          hideClose 
          aria-describedby={undefined}
        >
          <VisuallyHidden>
            <DialogTitle>WhatsApp Business Inbox</DialogTitle>
          </VisuallyHidden>
          {/* Compact modern header with connection status - safe area top */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#00a884] safe-area-top flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <MessageCircle className="h-4 w-4 text-white flex-shrink-0" />
              <span className="font-medium text-white text-sm hidden sm:inline">WhatsApp Business</span>
              <span className="font-medium text-white text-sm sm:hidden">WhatsApp</span>
              
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 flex-shrink-0">
                {connectionStatus.state === "checking" ? (
                  <>
                    <Loader2 className="h-3 w-3 text-yellow-300 animate-spin" />
                    <span className="text-[10px] sm:text-xs text-white/80 hidden xs:inline">Verificando...</span>
                  </>
                ) : connectionStatus.state === "open" ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-300" />
                    <span className="text-[10px] sm:text-xs text-white/90">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-300" />
                    <span className="text-[10px] sm:text-xs text-white/80">Offline</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Rate limit badge */}
              {connectionStatus.hourlyRemaining !== undefined && connectionStatus.state === "open" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="text-xs text-white/80 border-white/30 hover:bg-white/10 cursor-help"
                    >
                      {connectionStatus.hourlyRemaining}/h
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{connectionStatus.hourlyRemaining} mensagens restantes nesta hora</p>
                    <p className="text-muted-foreground text-xs">{connectionStatus.dailyRemaining} restantes hoje</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Sound toggle button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSound}
                    className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {soundEnabled ? "Desativar notificação sonora" : "Ativar notificação sonora"}
                </TooltipContent>
              </Tooltip>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main content - responsive layout */}
          <div className="flex flex-1 min-h-0 overflow-hidden relative">
            {/* Conversation list - left panel */}
            <div className={cn(
              "w-full sm:w-[340px] lg:w-[380px] border-r border-border/50 flex-shrink-0 transition-all duration-300 bg-background",
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
                onDelete={deleteConversation}
                onArchive={archiveConversation}
                onPin={handlePin}
                onMute={handleMute}
                onFavorite={handleFavorite}
                onBlock={handleBlock}
                onMarkUnread={handleMarkUnread}
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
                onDeleteMessage={deleteMessage}
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
