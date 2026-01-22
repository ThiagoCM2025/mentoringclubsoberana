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
    // Standard message format
    key?: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    // Alternative format for messages.update events
    keyId?: string;
    remoteJid?: string;
    fromMe?: boolean;
    status?: string;
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
      imageMessage?: {
        url?: string;
        caption?: string;
        mimetype?: string;
        base64?: string;
      };
      audioMessage?: {
        url?: string;
        mimetype?: string;
        base64?: string;
      };
      videoMessage?: {
        url?: string;
        caption?: string;
        mimetype?: string;
        base64?: string;
      };
      documentMessage?: {
        url?: string;
        fileName?: string;
        mimetype?: string;
        base64?: string;
      };
      stickerMessage?: {
        url?: string;
        mimetype?: string;
        base64?: string;
      };
    };
    messageType?: string;
    messageTimestamp?: number;
  };
}

interface MediaInfo {
  mediaUrl: string | null;
  mediaType: string | null;
  mediaFilename: string | null;
  mediaMimetype: string | null;
  caption: string | null;
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

function extractMediaInfo(data: EvolutionWebhookPayload["data"]): MediaInfo {
  const msg = data.message;
  
  if (!msg) {
    return { mediaUrl: null, mediaType: null, mediaFilename: null, mediaMimetype: null, caption: null };
  }

  // Image message
  if (msg.imageMessage) {
    return {
      mediaUrl: msg.imageMessage.url || null,
      mediaType: "image",
      mediaFilename: null,
      mediaMimetype: msg.imageMessage.mimetype || "image/jpeg",
      caption: msg.imageMessage.caption || null,
    };
  }

  // Audio message
  if (msg.audioMessage) {
    return {
      mediaUrl: msg.audioMessage.url || null,
      mediaType: "audio",
      mediaFilename: null,
      mediaMimetype: msg.audioMessage.mimetype || "audio/ogg",
      caption: null,
    };
  }

  // Video message
  if (msg.videoMessage) {
    return {
      mediaUrl: msg.videoMessage.url || null,
      mediaType: "video",
      mediaFilename: null,
      mediaMimetype: msg.videoMessage.mimetype || "video/mp4",
      caption: msg.videoMessage.caption || null,
    };
  }

  // Document message
  if (msg.documentMessage) {
    return {
      mediaUrl: msg.documentMessage.url || null,
      mediaType: "document",
      mediaFilename: msg.documentMessage.fileName || null,
      mediaMimetype: msg.documentMessage.mimetype || "application/octet-stream",
      caption: null,
    };
  }

  // Sticker message
  if (msg.stickerMessage) {
    return {
      mediaUrl: msg.stickerMessage.url || null,
      mediaType: "sticker",
      mediaFilename: null,
      mediaMimetype: msg.stickerMessage.mimetype || "image/webp",
      caption: null,
    };
  }

  return { mediaUrl: null, mediaType: null, mediaFilename: null, mediaMimetype: null, caption: null };
}

// Map Evolution API message types to our internal types
function mapMessageType(evolutionType: string | undefined, mediaInfo: MediaInfo): string {
  // If we have media, use the media type
  if (mediaInfo.mediaType) {
    return mediaInfo.mediaType;
  }
  
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

    // Handle typing events
    if (event === "presence.update" || event === "PRESENCE_UPDATE") {
      const rawPhone = data.key?.remoteJid || data.remoteJid || "";
      const phone = normalizePhone(rawPhone);
      const isTyping = data.status === "composing";
      
      if (phone) {
        // Find conversation by phone
        const { data: conversation } = await supabase
          .from("whatsapp_conversations")
          .select("id")
          .eq("phone", phone)
          .single();
        
        if (conversation) {
          await supabase
            .from("whatsapp_typing_status")
            .upsert({
              conversation_id: conversation.id,
              phone,
              is_typing: isTyping,
              updated_at: new Date().toISOString()
            }, { onConflict: "conversation_id" });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle incoming messages
    if (event === "messages.upsert" || event === "MESSAGE_RECEIVED") {
      // Handle both formats: data.key.remoteJid or data.remoteJid
      const rawPhone = data.key?.remoteJid || data.remoteJid || "";
      if (!rawPhone) {
        console.log("No phone number found in payload, skipping");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const phone = normalizePhone(rawPhone);
      const messageText = extractMessageText(data);
      const mediaInfo = extractMediaInfo(data);
      const isFromMe = data.key?.fromMe ?? data.fromMe ?? false;
      const contactName = data.pushName || null;

      // Check if we have any content (text OR media)
      const hasContent = messageText || mediaInfo.mediaUrl;
      
      if (!hasContent) {
        console.log("No content found (text or media), skipping");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Determine the message content to save
      const finalMessage = messageText || mediaInfo.caption || `[${mediaInfo.mediaType?.toUpperCase() || "MEDIA"}]`;

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
          .select("id, full_name")
          .eq("phone", phone)
          .single();

        if (lead) {
          contactType = "lead";
          contactId = lead.id;
        } else {
          // Check if it's a student (profile)
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .eq("phone", phone)
            .single();

          if (profile) {
            contactType = "student";
            contactId = profile.user_id;
          }
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("whatsapp_conversations")
          .insert({
            phone,
            contact_name: contactName || lead?.full_name || null,
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

      // Insert message with media info
      const mappedMessageType = mapMessageType(data.messageType, mediaInfo);
      const { error: msgError } = await supabase.from("whatsapp_messages").insert({
        conversation_id: conversation.id,
        phone,
        direction: isFromMe ? "outgoing" : "incoming",
        message: finalMessage,
        message_type: mappedMessageType,
        media_url: mediaInfo.mediaUrl,
        media_type: mediaInfo.mediaType,
        media_filename: mediaInfo.mediaFilename,
        media_mimetype: mediaInfo.mediaMimetype,
        status: "delivered",
        evolution_id: data.key?.id || data.keyId || null,
      });

      if (msgError) {
        console.error("Error inserting message:", msgError);
        throw msgError;
      }

      // Create admin notification for incoming messages
      if (!isFromMe) {
        // Format notification message based on content type
        let notificationMessage = finalMessage;
        if (mediaInfo.mediaType && !messageText) {
          const mediaLabels: Record<string, string> = {
            image: "📷 Imagem",
            audio: "🎵 Áudio",
            video: "🎬 Vídeo",
            document: "📄 Documento",
            sticker: "😀 Sticker",
          };
          notificationMessage = mediaLabels[mediaInfo.mediaType] || "📎 Mídia";
          if (mediaInfo.caption) {
            notificationMessage += `: ${mediaInfo.caption.substring(0, 80)}`;
          }
        } else {
          notificationMessage = finalMessage.substring(0, 100) + (finalMessage.length > 100 ? "..." : "");
        }

        await supabase.from("admin_notifications").insert({
          event_type: "whatsapp_message",
          title: `Nova mensagem de ${contactName || phone}`,
          message: notificationMessage,
          metadata: { 
            conversation_id: conversation.id, 
            phone,
            has_media: !!mediaInfo.mediaUrl,
            media_type: mediaInfo.mediaType,
          },
        });
      }

      console.log("Message saved successfully with type:", mappedMessageType, "media:", mediaInfo.mediaType);
      return new Response(
        JSON.stringify({ success: true, conversation_id: conversation.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle message status updates
    if (event === "messages.update" || event === "MESSAGE_UPDATE") {
      // Evolution API can send keyId directly OR inside key.id
      const evolutionId = data.keyId || data.key?.id;
      const status = data.status;

      console.log("Status update received - evolutionId:", evolutionId, "status:", status);

      if (!evolutionId) {
        console.log("No evolution ID found in payload, skipping status update");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (status) {
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
        } else {
          console.log("Message status updated to:", mappedStatus);
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
