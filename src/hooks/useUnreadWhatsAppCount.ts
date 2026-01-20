import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create untyped client to avoid type recursion issues
const untypedClient = createClient(supabaseUrl, supabaseKey);

export function useUnreadWhatsAppCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data, error } = await untypedClient
        .from("whatsapp_conversations")
        .select("unread_count")
        .eq("status", "active");

      if (!error && data) {
        let total = 0;
        for (const conv of data) {
          if (typeof conv.unread_count === "number") {
            total += conv.unread_count;
          }
        }
        setUnreadCount(total);
      }
    };

    fetchUnreadCount();

    // Subscribe to realtime updates
    const channel = untypedClient
      .channel("whatsapp-unread")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whatsapp_conversations",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      untypedClient.removeChannel(channel);
    };
  }, []);

  return unreadCount;
}
