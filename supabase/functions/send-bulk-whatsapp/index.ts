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

// Anti-spam configuration
const ANTI_SPAM_CONFIG = {
  MIN_DELAY_MS: 5000,      // Minimum 5 seconds between messages
  MAX_DELAY_MS: 10000,     // Maximum 10 seconds between messages
  BATCH_SIZE: 10,          // Messages per batch
  BATCH_PAUSE_MS: 60000,   // 1 minute pause between batches
  HOURLY_LIMIT: 25,        // Max messages per hour
  DAILY_LIMIT: 100,        // Max messages per day
};

// Helper function to get random delay
function getRandomDelay(): number {
  return ANTI_SPAM_CONFIG.MIN_DELAY_MS + 
    Math.random() * (ANTI_SPAM_CONFIG.MAX_DELAY_MS - ANTI_SPAM_CONFIG.MIN_DELAY_MS);
}

// Helper function to add small variations to avoid identical messages
function addTextVariation(text: string): string {
  const variations = ["", " ", "  ", ".", " ."];
  const randomSuffix = variations[Math.floor(Math.random() * variations.length)];
  return text + randomSuffix;
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

    // Check rate limits before starting
    console.log("Checking rate limits...");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: hourlyCount } = await supabase
      .from("communication_history")
      .select("*", { count: "exact", head: true })
      .eq("channel", "whatsapp")
      .eq("status", "sent")
      .gte("sent_at", oneHourAgo);

    const { count: dailyCount } = await supabase
      .from("communication_history")
      .select("*", { count: "exact", head: true })
      .eq("channel", "whatsapp")
      .eq("status", "sent")
      .gte("sent_at", oneDayAgo);

    console.log(`Rate limits - Hourly: ${hourlyCount}/${ANTI_SPAM_CONFIG.HOURLY_LIMIT}, Daily: ${dailyCount}/${ANTI_SPAM_CONFIG.DAILY_LIMIT}`);

    if ((hourlyCount || 0) >= ANTI_SPAM_CONFIG.HOURLY_LIMIT) {
      return new Response(
        JSON.stringify({ 
          error: "Limite horário atingido", 
          details: `Máximo de ${ANTI_SPAM_CONFIG.HOURLY_LIMIT} mensagens por hora. Tente novamente em 1 hora.`,
          hourlyCount,
          hourlyLimit: ANTI_SPAM_CONFIG.HOURLY_LIMIT
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((dailyCount || 0) >= ANTI_SPAM_CONFIG.DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ 
          error: "Limite diário atingido", 
          details: `Máximo de ${ANTI_SPAM_CONFIG.DAILY_LIMIT} mensagens por dia. Tente novamente amanhã.`,
          dailyCount,
          dailyLimit: ANTI_SPAM_CONFIG.DAILY_LIMIT
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Check if sending this batch would exceed hourly limit
    const remainingHourly = ANTI_SPAM_CONFIG.HOURLY_LIMIT - (hourlyCount || 0);
    if (recipients.length > remainingHourly) {
      return new Response(
        JSON.stringify({ 
          error: "Muitos destinatários", 
          details: `Você pode enviar apenas ${remainingHourly} mensagens nesta hora. Reduza o número de destinatários ou aguarde.`,
          remainingHourly,
          requestedCount: recipients.length
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const evolutionUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

    const results: { sent: number; failed: number; errors: Array<{ id: string; name: string; error: string }> } = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    const estimatedTime = recipients.length * 7.5; // ~7.5 seconds per message average
    console.log(`Starting bulk WhatsApp send to ${recipients.length} recipients. Estimated time: ${Math.ceil(estimatedTime / 60)} minutes`);

    for (let index = 0; index < recipients.length; index++) {
      const recipient = recipients[index] as Recipient;

      // Batch pause - after every BATCH_SIZE messages, take a longer break
      if (index > 0 && index % ANTI_SPAM_CONFIG.BATCH_SIZE === 0) {
        console.log(`Batch ${Math.floor(index / ANTI_SPAM_CONFIG.BATCH_SIZE)} complete. Pausing for 1 minute...`);
        await new Promise(r => setTimeout(r, ANTI_SPAM_CONFIG.BATCH_PAUSE_MS));
      }

      if (!recipient.phone) {
        results.failed++;
        results.errors.push({ id: recipient.id, name: recipient.name, error: "No phone number" });
        continue;
      }

      // Replace variables in message and convert literal \n to actual newlines
      let personalizedMessage = message
        .replace(/\{\{nome\}\}/gi, recipient.name || "")
        .replace(/\{\{name\}\}/gi, recipient.name || "")
        .replace(/\\n/g, '\n');

      // Add small variation to avoid identical message detection
      const finalMessage = addTextVariation(personalizedMessage);

      // Format phone number (remove non-digits, ensure country code)
      let formattedPhone = recipient.phone.replace(/\D/g, "");
      if (!formattedPhone.startsWith("55")) {
        formattedPhone = "55" + formattedPhone;
      }

      try {
        console.log(`[${index + 1}/${recipients.length}] Sending WhatsApp to ${formattedPhone} (${recipient.name})`);

        // Send with retry logic
        const { ok, data: evolutionData } = await sendWithRetry(
          evolutionUrl,
          EVOLUTION_API_KEY,
          formattedPhone,
          finalMessage
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

        // Randomized delay between 5-10 seconds to appear more human-like
        const randomDelay = getRandomDelay();
        console.log(`Waiting ${Math.round(randomDelay / 1000)}s before next message...`);
        await new Promise(resolve => setTimeout(resolve, randomDelay));

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
