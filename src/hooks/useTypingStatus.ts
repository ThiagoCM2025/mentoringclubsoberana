import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingStatus {
  conversation_id: string;
  phone: string;
  is_typing: boolean;
  updated_at: string;
}

const TYPING_TIMEOUT_MS = 10000; // Auto-clear after 10 seconds

export function useTypingStatus(conversationId: string | null) {
  const [isContactTyping, setIsContactTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-clear typing status after timeout
  useEffect(() => {
    if (isContactTyping) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout to clear typing status
      timeoutRef.current = setTimeout(() => {
        setIsContactTyping(false);
      }, TYPING_TIMEOUT_MS);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isContactTyping]);

  useEffect(() => {
    if (!conversationId) {
      setIsContactTyping(false);
      return;
    }

    // Fetch initial status
    const fetchInitialStatus = async () => {
      const { data } = await (supabase as any)
        .from("whatsapp_typing_status")
        .select("is_typing, updated_at")
        .eq("conversation_id", conversationId)
        .single();

      if (data) {
        // Only show typing if updated recently (within timeout period)
        const updatedAt = new Date(data.updated_at).getTime();
        const now = Date.now();
        const isRecent = now - updatedAt < TYPING_TIMEOUT_MS;
        
        setIsContactTyping(data.is_typing && isRecent);
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [conversationId]);

  return { isContactTyping };
}
