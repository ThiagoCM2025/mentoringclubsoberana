import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getBrazilISOString } from "../_shared/dateUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("t");
    const targetUrl = url.searchParams.get("url");
    const fallbackUrl = "https://soberanamentoria.com.br";

    if (!trackingId || !targetUrl) {
      console.log("Missing tracking_id or url parameter");
      return Response.redirect(targetUrl || fallbackUrl, 302);
    }

    const decodedUrl = decodeURIComponent(targetUrl);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tracking record
    const { data: tracking, error: fetchError } = await supabase
      .from("email_tracking")
      .select("id, lead_id, clicked_at, clicked_count, clicked_links")
      .eq("tracking_id", trackingId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching tracking:", fetchError);
    }

    if (tracking) {
      const isFirstClick = !tracking.clicked_at;
      const now = getBrazilISOString();

      // Update clicked_links array
      const existingLinks = Array.isArray(tracking.clicked_links) ? tracking.clicked_links : [];
      const newLinks = [...existingLinks, { url: decodedUrl, clicked_at: now }];

      // Update tracking record
      const { error: updateError } = await supabase
        .from("email_tracking")
        .update({
          clicked_at: isFirstClick ? now : tracking.clicked_at,
          clicked_count: (tracking.clicked_count || 0) + 1,
          clicked_links: newLinks,
        })
        .eq("id", tracking.id);

      if (updateError) {
        console.error("Error updating tracking:", updateError);
      }

      // Register engagement event (only on first click)
      if (isFirstClick && tracking.lead_id) {
        const { error: eventError } = await supabase
          .from("lead_engagement_events")
          .insert({
            lead_id: tracking.lead_id,
            event_type: "email_clicked",
            points: 10,
            event_data: { tracking_id: trackingId, url: decodedUrl },
          });

        if (eventError) {
          console.error("Error inserting engagement event:", eventError);
        }

        console.log(`Link clicked for lead ${tracking.lead_id}: ${decodedUrl}`);
      }
    } else {
      console.log(`Tracking ID not found: ${trackingId}`);
    }

    // Redirect to the target URL
    return Response.redirect(decodedUrl, 302);
  } catch (error) {
    console.error("Error in track-link-click:", error);
    return Response.redirect("https://soberanamentoria.com.br", 302);
  }
});
