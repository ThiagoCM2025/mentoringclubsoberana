import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1x1 transparent GIF pixel
const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
  0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

serve(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("t");

    if (!trackingId) {
      return new Response(TRANSPARENT_GIF, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tracking record
    const { data: tracking, error: fetchError } = await supabase
      .from("email_tracking")
      .select("id, lead_id, opened_count")
      .eq("tracking_id", trackingId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching tracking:", fetchError);
    }

    if (tracking) {
      const isFirstOpen = !tracking.opened_count || tracking.opened_count === 0;
      const now = new Date().toISOString();

      // Update tracking record
      const { error: updateError } = await supabase
        .from("email_tracking")
        .update({
          opened_at: isFirstOpen ? now : undefined,
          opened_count: (tracking.opened_count || 0) + 1,
        })
        .eq("id", tracking.id);

      if (updateError) {
        console.error("Error updating tracking:", updateError);
      }

      // Register engagement event (only on first open)
      if (isFirstOpen && tracking.lead_id) {
        const { error: eventError } = await supabase
          .from("lead_engagement_events")
          .insert({
            lead_id: tracking.lead_id,
            event_type: "email_opened",
            points: 5,
            event_data: { tracking_id: trackingId },
          });

        if (eventError) {
          console.error("Error inserting engagement event:", eventError);
        }

        console.log(`Email opened for lead ${tracking.lead_id} (tracking: ${trackingId})`);
      }
    } else {
      console.log(`Tracking ID not found: ${trackingId}`);
    }
  } catch (error) {
    console.error("Error in track-email-open:", error);
  }

  // Always return the transparent pixel
  return new Response(TRANSPARENT_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
});
