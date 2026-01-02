import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Event types and their point values
const EVENT_POINTS: Record<string, number> = {
  "email.opened": 5,
  "email.clicked": 10,
  "email.bounced": -5,
  "email.complained": -10,
};

const EVENT_TYPES: Record<string, string> = {
  "email.opened": "email_opened",
  "email.clicked": "email_clicked",
  "email.bounced": "email_bounced",
  "email.complained": "email_complained",
};

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ResendWebhookPayload = await req.json();
    console.log("Received Resend webhook:", JSON.stringify(payload, null, 2));

    const { type, data } = payload;

    // Check if this is a tracked event type
    if (!EVENT_POINTS[type]) {
      console.log(`Ignoring untracked event type: ${type}`);
      return new Response(JSON.stringify({ message: "Event type not tracked" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get recipient email
    const recipientEmail = data.to?.[0];
    if (!recipientEmail) {
      console.log("No recipient email found in webhook payload");
      return new Response(JSON.stringify({ error: "No recipient email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find lead by email
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, email, score")
      .eq("email", recipientEmail.toLowerCase())
      .maybeSingle();

    if (leadError) {
      console.error("Error finding lead:", leadError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!lead) {
      console.log(`No lead found for email: ${recipientEmail}`);
      return new Response(JSON.stringify({ message: "Lead not found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const points = EVENT_POINTS[type];
    const eventType = EVENT_TYPES[type];

    // Build event data
    const eventData: Record<string, unknown> = {
      email_id: data.email_id,
      subject: data.subject,
      from: data.from,
    };

    if (type === "email.clicked" && data.click) {
      eventData.clicked_link = data.click.link;
      eventData.clicked_at = data.click.timestamp;
    }

    // Insert engagement event
    const { error: insertError } = await supabase
      .from("lead_engagement_events")
      .insert({
        lead_id: lead.id,
        event_type: eventType,
        points: points,
        event_data: eventData,
      });

    if (insertError) {
      console.error("Error inserting engagement event:", insertError);
      return new Response(JSON.stringify({ error: "Failed to record event" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // The lead score is automatically updated by the existing trigger: update_lead_score_on_event
    console.log(`Recorded ${eventType} event for lead ${lead.id} with ${points} points`);

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        event_type: eventType,
        points: points,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
