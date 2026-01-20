import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageType?: string;
    messageTimestamp?: number;
    status?: string;
  };
}

function normalizePhone(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");
  
  // Remove @s.whatsapp.net suffix if present
  cleaned = cleaned.replace(/@s\.whatsapp\.net$/, "");
  
  // Add Brazil code if not present
  if (!cleaned.startsWith("55") && cleaned.length <= 11) {
    cleaned = "55" + cleaned;
  }
  
  return cleaned;
}

function extractMessageText(data: EvolutionWebhookPayload["data"]): string {
  if (data.message?.conversation) {
    return data.message.conversation;
  }
  if (data.message?.extendedTextMessage?.text) {
    return data.message.extendedTextMessage.text;
  }
  return "";
}

// Map Evolution API message types to our internal types
function mapMessageType(evolutionType: string | undefined): string {
  const typeMap: Record<string, string> = {
    "conversation": "text",
    "extendedTextMessage": "text",
    "imageMessage": "image",
    "audioMessage": "audio",
    "videoMessage": "video",
    "documentMessage": "document",
    "stickerMessage": "sticker",
  };
  return typeMap[evolutionType || ""] || "text";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: EvolutionWebhookPayload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload, null, 2));

    const { event, data } = payload;

    // Handle incoming messages
    if (event === "messages.upsert" || event === "MESSAGE_RECEIVED") {
      const phone = normalizePhone(data.key.remoteJid);
      const messageText = extractMessageText(data);
      const isFromMe = data.key.fromMe;
      const contactName = data.pushName || null;

      if (!messageText) {
        console.log("No text message found, skipping");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find or create conversation
      let { data: conversation, error: convError } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("phone", phone)
        .single();

      if (convError && convError.code === "PGRST116") {
        // Conversation not found, try to find contact
        let contactType = "lead";
        let contactId = null;

        // Check if it's a lead
        const { data: lead } = await supabase
          .from("leads")
          .select("id, name")
          .eq("phone", phone)
          .single();

        if (lead) {
          contactType = "lead";
          contactId = lead.id;
        } else {
          // Check if it's a student (profile)
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("phone", phone)
            .single();

          if (profile) {
            contactType = "student";
            contactId = profile.id;
          }
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("whatsapp_conversations")
          .insert({
            phone,
            contact_name: contactName || lead?.name || null,
            contact_type: contactType,
            contact_id: contactId,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          throw createError;
        }

        conversation = newConv;
      } else if (convError) {
        console.error("Error fetching conversation:", convError);
        throw convError;
      }

      // Update contact name if we have a new one
      if (contactName && !conversation.contact_name) {
        await supabase
          .from("whatsapp_conversations")
          .update({ contact_name: contactName })
          .eq("id", conversation.id);
      }

      // Insert message with mapped type
      const mappedMessageType = mapMessageType(data.messageType);
      const { error: msgError } = await supabase.from("whatsapp_messages").insert({
        conversation_id: conversation.id,
        phone,
        direction: isFromMe ? "outgoing" : "incoming",
        message: messageText,
        message_type: mappedMessageType,
        status: "delivered",
        evolution_id: data.key.id,
      });

      if (msgError) {
        console.error("Error inserting message:", msgError);
        throw msgError;
      }

      console.log("Message saved successfully with type:", mappedMessageType);
      return new Response(
        JSON.stringify({ success: true, conversation_id: conversation.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle message status updates
    if (event === "messages.update" || event === "MESSAGE_UPDATE") {
      const evolutionId = data.key.id;
      const status = data.status;

      if (evolutionId && status) {
        // Map Evolution status to our status
        const statusMap: Record<string, string> = {
          PENDING: "pending",
          SENT: "sent",
          DELIVERY_ACK: "delivered",
          READ: "read",
          PLAYED: "read",
        };

        const mappedStatus = statusMap[status] || status.toLowerCase();

        const { error } = await supabase
          .from("whatsapp_messages")
          .update({ status: mappedStatus })
          .eq("evolution_id", evolutionId);

        if (error) {
          console.error("Error updating message status:", error);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Unknown event
    console.log("Unhandled event:", event);
    return new Response(JSON.stringify({ success: true, unhandled: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
