import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recipient {
  id: string;
  name: string;
  phone: string;
  type: "lead" | "student";
}

// Helper function to send with retry
async function sendWithRetry(
  evolutionUrl: string,
  apiKey: string,
  phone: string,
  message: string,
  maxRetries = 1
): Promise<{ ok: boolean; data: any }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(evolutionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
        },
        body: JSON.stringify({
          number: phone,
          text: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { ok: true, data };
      }

      // Retry on Connection Closed error
      if (attempt < maxRetries && data?.message === "Connection Closed") {
        console.log(`Retry ${attempt + 1} for ${phone} due to Connection Closed`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      return { ok: false, data };
    } catch (err) {
      if (attempt === maxRetries) {
        return { ok: false, data: { message: err instanceof Error ? err.message : "Unknown error" } };
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return { ok: false, data: { message: "Max retries exceeded" } };
}

serve(async (req) => {
  // Handle CORS preflight requests
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
      console.error("Missing Evolution API configuration");
      return new Response(
        JSON.stringify({ error: "Evolution API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Supabase not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify WhatsApp connection before starting
    console.log("Checking Evolution API connection status...");
    try {
      const statusResponse = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
        { headers: { "apikey": EVOLUTION_API_KEY } }
      );
      const statusData = await statusResponse.json();
      console.log("Connection status:", JSON.stringify(statusData));

      if (statusData?.instance?.state !== "open") {
        return new Response(
          JSON.stringify({ 
            error: "WhatsApp desconectado", 
            details: "Por favor reconecte o WhatsApp na Evolution API antes de enviar.",
            state: statusData?.instance?.state 
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (connErr) {
      console.error("Error checking connection:", connErr);
      // Continue anyway, let individual sends fail if needed
    }

    const { recipients, message, templateId } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Recipients array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const evolutionUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

    const results: { sent: number; failed: number; errors: Array<{ id: string; name: string; error: string }> } = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    console.log(`Starting bulk WhatsApp send to ${recipients.length} recipients`);

    for (const recipient of recipients as Recipient[]) {
      if (!recipient.phone) {
        results.failed++;
        results.errors.push({ id: recipient.id, name: recipient.name, error: "No phone number" });
        continue;
      }

      // Replace variables in message and convert literal \n to actual newlines
      const personalizedMessage = message
        .replace(/\{\{nome\}\}/gi, recipient.name || "")
        .replace(/\{\{name\}\}/gi, recipient.name || "")
        .replace(/\\n/g, '\n');

      // Format phone number (remove non-digits, ensure country code)
      let formattedPhone = recipient.phone.replace(/\D/g, "");
      if (!formattedPhone.startsWith("55")) {
        formattedPhone = "55" + formattedPhone;
      }

      try {
        console.log(`Sending WhatsApp to ${formattedPhone} (${recipient.name})`);

        // Send with retry logic
        const { ok, data: evolutionData } = await sendWithRetry(
          evolutionUrl,
          EVOLUTION_API_KEY,
          formattedPhone,
          personalizedMessage
        );

        if (!ok) {
          console.error(`Evolution API error for ${recipient.name}:`, evolutionData);
          results.failed++;
          results.errors.push({ 
            id: recipient.id, 
            name: recipient.name, 
            error: evolutionData?.message || "Evolution API error" 
          });

          // Log failed attempt
          await supabase.from("communication_history").insert({
            recipient_id: recipient.id,
            recipient_type: recipient.type,
            recipient_name: recipient.name,
            recipient_phone: recipient.phone,
            channel: "whatsapp",
            message: personalizedMessage,
            template_id: templateId || null,
            status: "failed",
            metadata: {
              sent_via: "evolution_api_bulk",
              error: evolutionData,
            },
          });
        } else {
          console.log(`WhatsApp sent successfully to ${recipient.name}`);
          results.sent++;

          // Find or create conversation for inbox sync
          let conversationId: string | null = null;
          try {
            // Check if conversation exists
            const { data: existingConv } = await supabase
              .from("whatsapp_conversations")
              .select("id")
              .eq("phone", formattedPhone)
              .maybeSingle();

            if (existingConv) {
              conversationId = existingConv.id;
            } else {
              // Create new conversation
              const { data: newConv } = await supabase
                .from("whatsapp_conversations")
                .insert({
                  phone: formattedPhone,
                  contact_name: recipient.name,
                  contact_type: recipient.type,
                  contact_id: recipient.id,
                  last_message_at: new Date().toISOString(),
                  last_message_preview: personalizedMessage.substring(0, 100),
                })
                .select("id")
                .single();
              
              if (newConv) {
                conversationId = newConv.id;
              }
            }

            // Insert message into whatsapp_messages for inbox visibility
            if (conversationId) {
              await supabase.from("whatsapp_messages").insert({
                conversation_id: conversationId,
                phone: formattedPhone,
                direction: "outgoing",
                message: personalizedMessage,
                message_type: "text",
                status: "sent",
                evolution_id: evolutionData?.key?.id || null,
              });

              // Update conversation last message
              await supabase
                .from("whatsapp_conversations")
                .update({
                  last_message_at: new Date().toISOString(),
                  last_message_preview: personalizedMessage.substring(0, 100),
                })
                .eq("id", conversationId);
            }
          } catch (syncErr) {
            console.error(`Error syncing to inbox for ${recipient.name}:`, syncErr);
            // Don't fail the whole send, just log the sync error
          }

          // Log successful send in communication_history
          await supabase.from("communication_history").insert({
            recipient_id: recipient.id,
            recipient_type: recipient.type,
            recipient_name: recipient.name,
            recipient_phone: recipient.phone,
            channel: "whatsapp",
            message: personalizedMessage,
            template_id: templateId || null,
            status: "sent",
            metadata: {
              sent_via: "evolution_api_bulk",
              evolution_response: evolutionData,
              conversation_id: conversationId,
            },
          });
        }

        // Increased delay between messages to avoid rate limiting (1s instead of 500ms)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`Error sending to ${recipient.name}:`, err);
        results.failed++;
        results.errors.push({ 
          id: recipient.id, 
          name: recipient.name, 
          error: err instanceof Error ? err.message : "Unknown error" 
        });

        // Log failed attempt
        await supabase.from("communication_history").insert({
          recipient_id: recipient.id,
          recipient_type: recipient.type,
          recipient_name: recipient.name,
          recipient_phone: recipient.phone,
          channel: "whatsapp",
          message: personalizedMessage,
          template_id: templateId || null,
          status: "failed",
          metadata: {
            sent_via: "evolution_api_bulk",
            error: err instanceof Error ? err.message : "Unknown error",
          },
        });
      }
    }

    console.log(`Bulk WhatsApp complete: ${results.sent} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-bulk-whatsapp function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
