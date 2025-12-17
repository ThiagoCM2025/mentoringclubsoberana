import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "student" | "lead";
}

interface BulkEmailRequest {
  recipients: Recipient[];
  subject: string;
  message: string;
  templateId?: string;
  channel: "email" | "notification";
}

function replaceVariables(text: string, recipient: Recipient): string {
  return text
    .replace(/{nome}/g, recipient.name || "")
    .replace(/{email}/g, recipient.email || "")
    .replace(/{telefone}/g, recipient.phone || "");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid token");
    }

    const { recipients, subject, message, templateId, channel }: BulkEmailRequest = await req.json();

    console.log(`Processing ${channel} send to ${recipients.length} recipients`);

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      const personalizedSubject = replaceVariables(subject, recipient);
      const personalizedMessage = replaceVariables(message, recipient);

      try {
        if (channel === "email") {
          // Send email via Resend
          const emailResponse = await resend.emails.send({
            from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
            to: [recipient.email],
            subject: personalizedSubject,
            html: personalizedMessage.replace(/\n/g, "<br>"),
          });

          console.log(`Email sent to ${recipient.email}:`, emailResponse);

          // Log to communication_history
          await supabase.from("communication_history").insert({
            recipient_type: recipient.type,
            recipient_id: recipient.id,
            recipient_name: recipient.name,
            recipient_email: recipient.email,
            recipient_phone: recipient.phone,
            channel: "email",
            template_id: templateId || null,
            subject: personalizedSubject,
            message: personalizedMessage,
            status: "sent",
            sent_by: user.id,
            metadata: { resend_id: emailResponse.data?.id },
          });

          results.push({ 
            recipientId: recipient.id, 
            status: "sent", 
            email: recipient.email 
          });

        } else if (channel === "notification") {
          // Send in-app notification
          await supabase.from("notifications").insert({
            user_id: recipient.id,
            title: personalizedSubject,
            message: personalizedMessage,
            type: "info",
            created_by: user.id,
          });

          // Log to communication_history
          await supabase.from("communication_history").insert({
            recipient_type: recipient.type,
            recipient_id: recipient.id,
            recipient_name: recipient.name,
            recipient_email: recipient.email,
            recipient_phone: recipient.phone,
            channel: "notification",
            template_id: templateId || null,
            subject: personalizedSubject,
            message: personalizedMessage,
            status: "sent",
            sent_by: user.id,
          });

          results.push({ 
            recipientId: recipient.id, 
            status: "sent", 
            type: "notification" 
          });
        }

      } catch (error: any) {
        console.error(`Error sending to ${recipient.email}:`, error);
        
        // Log failed attempt
        await supabase.from("communication_history").insert({
          recipient_type: recipient.type,
          recipient_id: recipient.id,
          recipient_name: recipient.name,
          recipient_email: recipient.email,
          recipient_phone: recipient.phone,
          channel: channel,
          template_id: templateId || null,
          subject: personalizedSubject,
          message: personalizedMessage,
          status: "failed",
          sent_by: user.id,
          metadata: { error: error.message },
        });

        errors.push({ 
          recipientId: recipient.id, 
          email: recipient.email, 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: results.length, 
        failed: errors.length,
        results, 
        errors 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
