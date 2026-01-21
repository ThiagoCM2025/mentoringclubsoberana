import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Anti-spam configuration - must match send-bulk-whatsapp
const ANTI_SPAM_CONFIG = {
  HOURLY_LIMIT: 25,
  DAILY_LIMIT: 100,
};

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
        JSON.stringify({ 
          connected: false, 
          error: "Evolution API not configured" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check Evolution API connection status
    let connected = false;
    let state = "unknown";
    
    try {
      const statusResponse = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
        { headers: { "apikey": EVOLUTION_API_KEY } }
      );
      const statusData = await statusResponse.json();
      state = statusData?.instance?.state || "unknown";
      connected = state === "open";
    } catch (err) {
      console.error("Error checking Evolution API:", err);
      state = "error";
    }

    // Check rate limits
    let hourlyCount = 0;
    let dailyCount = 0;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { count: hCount } = await supabase
        .from("communication_history")
        .select("*", { count: "exact", head: true })
        .eq("channel", "whatsapp")
        .eq("status", "sent")
        .gte("sent_at", oneHourAgo);

      const { count: dCount } = await supabase
        .from("communication_history")
        .select("*", { count: "exact", head: true })
        .eq("channel", "whatsapp")
        .eq("status", "sent")
        .gte("sent_at", oneDayAgo);

      hourlyCount = hCount || 0;
      dailyCount = dCount || 0;
    }

    const hourlyRemaining = Math.max(0, ANTI_SPAM_CONFIG.HOURLY_LIMIT - hourlyCount);
    const dailyRemaining = Math.max(0, ANTI_SPAM_CONFIG.DAILY_LIMIT - dailyCount);

    return new Response(
      JSON.stringify({
        connected,
        state,
        rateLimit: {
          hourlyUsed: hourlyCount,
          hourlyLimit: ANTI_SPAM_CONFIG.HOURLY_LIMIT,
          hourlyRemaining,
          dailyUsed: dailyCount,
          dailyLimit: ANTI_SPAM_CONFIG.DAILY_LIMIT,
          dailyRemaining,
        },
        canSend: connected && hourlyRemaining > 0 && dailyRemaining > 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-whatsapp-status:", error);
    return new Response(
      JSON.stringify({ 
        connected: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
