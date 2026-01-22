import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WhatsAppConversation {
  id: string;
  phone: string;
  contact_name: string | null;
  contact_type: "lead" | "student";
  contact_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  status: "active" | "archived";
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  phone: string;
  direction: "incoming" | "outgoing";
  message: string;
  message_type: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  evolution_id: string | null;
  template_id: string | null;
  sent_by: string | null;
  error_message: string | null;
  created_at: string;
  // Media fields
  media_url: string | null;
  media_type: string | null;
  media_filename: string | null;
  media_mimetype: string | null;
  media_size: number | null;
}

interface UseWhatsAppConversationsOptions {
  onNewIncomingMessage?: (message: WhatsAppMessage) => void;
}

export function useWhatsAppConversations(options?: UseWhatsAppConversationsOptions) {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("status", "active")
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      setConversations(data as WhatsAppConversation[]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data as WhatsAppMessage[]);

      // Mark as read
      await supabase
        .from("whatsapp_conversations")
        .update({ unread_count: 0 })
        .eq("id", conversationId);

      // Update local state
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (phone: string, message: string, conversationId?: string) => {
      try {
        // Call the existing send-whatsapp edge function
        const { data: funcData, error: funcError } = await supabase.functions.invoke(
          "send-whatsapp",
          {
            body: { phone, message },
          }
        );

        if (funcError) throw funcError;

        // If we have a conversation, save the message locally
        if (conversationId) {
          const { data: user } = await supabase.auth.getUser();
          
          const { data: newMessage, error: msgError } = await supabase
            .from("whatsapp_messages")
            .insert({
              conversation_id: conversationId,
              phone,
              direction: "outgoing",
              message,
              message_type: "text",
              status: "sent",
              evolution_id: funcData?.key?.id || null,
              sent_by: user?.user?.id || null,
            })
            .select()
            .single();

          if (msgError) throw msgError;

          setMessages((prev) => [...prev, newMessage as WhatsAppMessage]);
        }

        return { success: true };
      } catch (error: any) {
        console.error("Error sending message:", error);
        toast.error("Erro ao enviar mensagem");
        return { success: false, error };
      }
    },
    []
  );

  // Create or get conversation for a contact
  const getOrCreateConversation = useCallback(
    async (phone: string, contactName?: string, contactType?: "lead" | "student", contactId?: string) => {
      try {
        // Normalize phone
        let normalizedPhone = phone.replace(/\D/g, "");
        if (!normalizedPhone.startsWith("55") && normalizedPhone.length <= 11) {
          normalizedPhone = "55" + normalizedPhone;
        }

        // Check if conversation exists
        const { data: existing, error: fetchError } = await supabase
          .from("whatsapp_conversations")
          .select("*")
          .eq("phone", normalizedPhone)
          .single();

        if (existing) {
          setSelectedConversation(existing as WhatsAppConversation);
          await fetchMessages(existing.id);
          return existing as WhatsAppConversation;
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("whatsapp_conversations")
          .insert({
            phone: normalizedPhone,
            contact_name: contactName || null,
            contact_type: contactType || "lead",
            contact_id: contactId || null,
          })
          .select()
          .single();

        if (createError) throw createError;

        const conversation = newConv as WhatsAppConversation;
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversation(conversation);
        setMessages([]);

        return conversation;
      } catch (error) {
        console.error("Error creating conversation:", error);
        toast.error("Erro ao criar conversa");
        return null;
      }
    },
    [fetchMessages]
  );

  // Archive a conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_conversations")
        .update({ status: "archived" })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      toast.success("Conversa arquivada");
    } catch (error) {
      console.error("Error archiving conversation:", error);
    toast.error("Erro ao arquivar conversa");
    }
  }, [selectedConversation]);

  // Delete conversation (including all messages)
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // 1. Delete all messages from the conversation first
      await supabase
        .from("whatsapp_messages")
        .delete()
        .eq("conversation_id", conversationId);

      // 2. Delete conversation tags
      await supabase
        .from("entity_tags")
        .delete()
        .eq("entity_id", conversationId)
        .eq("entity_type", "conversation");

      // 3. Delete the conversation
      const { error } = await supabase
        .from("whatsapp_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      // 4. Update local state
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      
      // 5. If it was the selected conversation, clear selection
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      toast.success("Conversa excluída");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Erro ao excluir conversa");
    }
  }, [selectedConversation]);

  // Unarchive a conversation
  const unarchiveConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_conversations")
        .update({ status: "active" })
        .eq("id", conversationId);

      if (error) throw error;

      toast.success("Conversa restaurada");
      fetchConversations();
    } catch (error) {
      console.error("Error unarchiving conversation:", error);
      toast.error("Erro ao restaurar conversa");
    }
  }, [fetchConversations]);

  // Fetch archived conversations
  const fetchArchivedConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("status", "archived")
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return data as WhatsAppConversation[];
    } catch (error) {
      console.error("Error fetching archived conversations:", error);
      toast.error("Erro ao carregar conversas arquivadas");
      return [];
    }
  }, []);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Find the message to get conversation info
      const messageToDelete = messages.find(m => m.id === messageId);
      if (!messageToDelete) return;

      const conversationId = messageToDelete.conversation_id;

      // Delete from database
      const { error } = await supabase
        .from("whatsapp_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      const remainingMessages = messages.filter(m => m.id !== messageId);
      setMessages(remainingMessages);

      // If there are remaining messages, update conversation preview
      if (remainingMessages.length > 0) {
        const lastMsg = remainingMessages[remainingMessages.length - 1];
        const preview = lastMsg.message.substring(0, 35) + (lastMsg.message.length > 35 ? "..." : "");
        
        await supabase
          .from("whatsapp_conversations")
          .update({
            last_message_preview: preview,
            last_message_at: lastMsg.created_at,
          })
          .eq("id", conversationId);
      } else {
        // No messages left, clear preview
        await supabase
          .from("whatsapp_conversations")
          .update({
            last_message_preview: null,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
      }

      toast.success("Mensagem excluída");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erro ao excluir mensagem");
    }
  }, [messages]);

  // Select a conversation
  const selectConversation = useCallback(
    (conversation: WhatsAppConversation | null) => {
      setSelectedConversation(conversation);
      if (conversation) {
        fetchMessages(conversation.id);
      } else {
        setMessages([]);
      }
    },
    [fetchMessages]
  );

  // Setup realtime subscriptions
  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel("whatsapp-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
        },
        (payload) => {
          const newMessage = payload.new as WhatsAppMessage;

          // Notify for incoming messages (not sent by us)
          if (newMessage.direction === "incoming" && options?.onNewIncomingMessage) {
            options.onNewIncomingMessage(newMessage);
          }

          // If it's for the current conversation, add to messages
          if (selectedConversation?.id === newMessage.conversation_id) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }

          // Update conversation list
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel("whatsapp-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whatsapp_conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [fetchConversations, selectedConversation?.id]);

  return {
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
    refreshConversations: fetchConversations,
  };
}
