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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
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
      let personalizedMessage = message
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

        const evolutionResponse = await fetch(evolutionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: personalizedMessage,
          }),
        });

        const evolutionData = await evolutionResponse.json();

        if (!evolutionResponse.ok) {
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

          // Log successful send
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
            },
          });
        }

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

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
