import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MediaPayload {
  phone: string;
  mediaUrl: string;
  mediaType: "image" | "audio" | "document" | "video";
  caption?: string;
  filename?: string;
  conversationId?: string;
  mimetype?: string;
  fileSize?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      return new Response(
        JSON.stringify({ error: "Evolution API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      phone, 
      mediaUrl, 
      mediaType, 
      caption, 
      filename, 
      conversationId,
      mimetype,
      fileSize 
    }: MediaPayload = await req.json();

    if (!phone || !mediaUrl || !mediaType) {
      return new Response(
        JSON.stringify({ error: "Phone, mediaUrl, and mediaType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("55")) {
      formattedPhone = "55" + formattedPhone;
    }

    console.log(`Sending ${mediaType} to ${formattedPhone} via Evolution API`);

    let evolutionUrl: string;
    let evolutionBody: Record<string, unknown>;

    if (mediaType === "audio") {
      // Use sendWhatsAppAudio endpoint for audio
      evolutionUrl = `${EVOLUTION_API_URL}/message/sendWhatsAppAudio/${EVOLUTION_INSTANCE}`;
      evolutionBody = {
        number: formattedPhone,
        audio: mediaUrl,
      };
    } else {
      // Use sendMedia endpoint for images, videos, and documents
      evolutionUrl = `${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`;
      
      const mediaTypeMap: Record<string, string> = {
        image: "image",
        video: "video",
        document: "document",
      };

      evolutionBody = {
        number: formattedPhone,
        mediatype: mediaTypeMap[mediaType] || "document",
        media: mediaUrl,
        caption: caption || undefined,
        fileName: filename || undefined,
      };
    }

    const evolutionResponse = await fetch(evolutionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify(evolutionBody),
    });

    const evolutionData = await evolutionResponse.json();
    console.log("Evolution API response:", evolutionData);

    if (!evolutionResponse.ok) {
      console.error("Evolution API error:", evolutionData);
      return new Response(
        JSON.stringify({ error: "Failed to send media", details: evolutionData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save message to database if conversationId is provided
    if (conversationId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Get current user from auth header
      const authHeader = req.headers.get("Authorization");
      let sentBy = null;
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        sentBy = user?.id || null;
      }

      const { error: msgError } = await supabase.from("whatsapp_messages").insert({
        conversation_id: conversationId,
        phone: formattedPhone,
        direction: "outgoing",
        message: caption || `[${mediaType.toUpperCase()}]`,
        message_type: mediaType,
        media_url: mediaUrl,
        media_type: mediaType,
        media_filename: filename || null,
        media_mimetype: mimetype || null,
        media_size: fileSize || null,
        status: "sent",
        evolution_id: evolutionData?.key?.id || null,
        sent_by: sentBy,
      });

      if (msgError) {
        console.error("Error saving message:", msgError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${mediaType} sent successfully`,
        evolutionResponse: evolutionData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-whatsapp-media function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
