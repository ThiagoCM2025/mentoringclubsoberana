import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingStatus {
  conversation_id: string;
  phone: string;
  is_typing: boolean;
  updated_at: string;
}

export function useTypingStatus(conversationId: string | null) {
  const [isContactTyping, setIsContactTyping] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setIsContactTyping(false);
      return;
    }

    // Fetch initial status
    const fetchInitialStatus = async () => {
      const { data } = await (supabase as any)
        .from("whatsapp_typing_status")
        .select("is_typing")
        .eq("conversation_id", conversationId)
        .single();

      if (data) {
        setIsContactTyping(data.is_typing);
      }
    };

    fetchInitialStatus();

    // Subscribe to typing status changes
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whatsapp_typing_status",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const status = payload.new as TypingStatus | null;
          setIsContactTyping(status?.is_typing ?? false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { isContactTyping };
}
