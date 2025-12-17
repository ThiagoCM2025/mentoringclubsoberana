import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  event_type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

const generateEmailTemplate = (title: string, message: string, eventType: string) => {
  const eventColors: Record<string, string> = {
    new_student: '#10b981',
    new_lead: '#ec4899',
    new_enrollment: '#8b5cf6',
    community_post: '#3b82f6'
  };

  const color = eventColors[eventType] || '#64001C';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 32px 32px 24px;">
                  <div style="width: 48px; height: 48px; background-color: ${color}; border-radius: 12px; margin-bottom: 20px;">
                  </div>
                  <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #1a1a1a;">
                    ${title}
                  </h1>
                  <p style="margin: 0; font-size: 15px; color: #666666; line-height: 1.5;">
                    ${message}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 32px 32px;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/admin" 
                     style="display: inline-block; padding: 12px 24px; background-color: #64001C; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                    Acessar Painel Admin
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 32px; background-color: #fafafa; border-radius: 0 0 16px 16px;">
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    Você recebeu este email porque está configurado para receber notificações da plataforma Soberana.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    console.log("Received notification payload:", payload);

    // Get admin users with email notifications enabled
    const { data: preferences, error: prefError } = await supabase
      .from("admin_notification_preferences")
      .select("user_id")
      .eq("email_notifications", true)
      .eq(`notify_${payload.event_type.replace('new_', '')}s`, true);

    if (prefError) {
      console.log("No preferences found or error:", prefError);
    }

    // If no preferences set, get all admins
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ message: "No admin users to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails from auth.users
    const adminUserIds = preferences?.map(p => p.user_id) || adminRoles.map(r => r.user_id);
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching users:", authError);
      throw authError;
    }

    const adminEmails = authUsers.users
      .filter(u => adminUserIds.includes(u.id))
      .map(u => u.email)
      .filter(Boolean) as string[];

    console.log("Sending notifications to:", adminEmails);

    if (adminEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No admin emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send emails
    const html = generateEmailTemplate(payload.title, payload.message, payload.event_type);

    const emailPromises = adminEmails.map(email =>
      resend.emails.send({
        from: "Soberana <onboarding@resend.dev>",
        to: [email],
        subject: `[Soberana] ${payload.title}`,
        html
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Emails sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Notifications sent`,
        successful,
        failed
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-admin-notification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
