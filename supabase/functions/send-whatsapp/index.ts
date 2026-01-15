import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { phone, message, leadId, leadName, templateId } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Phone and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number (remove non-digits, ensure country code)
    let formattedPhone = phone.replace(/\D/g, "");
    
    // Add Brazil country code if not present
    if (!formattedPhone.startsWith("55")) {
      formattedPhone = "55" + formattedPhone;
    }

    console.log(`Sending WhatsApp to ${formattedPhone} via Evolution API`);

    // Send message via Evolution API
    const evolutionUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;
    
    const evolutionResponse = await fetch(evolutionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    const evolutionData = await evolutionResponse.json();
    console.log("Evolution API response:", evolutionData);

    if (!evolutionResponse.ok) {
      console.error("Evolution API error:", evolutionData);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp message", details: evolutionData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log to communication_history if leadId is provided
    if (leadId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      await supabase.from("communication_history").insert({
        recipient_id: leadId,
        recipient_type: "lead",
        recipient_name: leadName || null,
        recipient_phone: phone,
        channel: "whatsapp",
        message: message,
        template_id: templateId || null,
        status: "sent",
        metadata: {
          sent_via: "evolution_api",
          evolution_response: evolutionData,
        },
      });
      
      console.log("Communication history logged for lead:", leadId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp message sent successfully",
        evolutionResponse: evolutionData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-whatsapp function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
