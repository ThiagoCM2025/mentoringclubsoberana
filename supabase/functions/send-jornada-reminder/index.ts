import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationQueueItem {
  id: string;
  session_id: string;
  jornada_slug: string;
  session_title: string;
  session_day: number;
  youtube_id: string | null;
  materials_url: string | null;
  processed: boolean;
}

interface JornadaAccess {
  id: string;
  email: string;
  lead_id: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 send-jornada-reminder function started");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for manual trigger
    let targetSessionId: string | null = null;
    try {
      const body = await req.json();
      targetSessionId = body.session_id || null;
    } catch {
      // No body provided, process all pending
    }

    // Get pending notifications from queue
    let query = supabase
      .from("jornada_notification_queue")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true });

    if (targetSessionId) {
      query = query.eq("session_id", targetSessionId);
    }

    const { data: pendingNotifications, error: queueError } = await query;

    if (queueError) {
      console.error("❌ Error fetching notification queue:", queueError);
      throw queueError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("ℹ️ No pending notifications to process");
      return new Response(
        JSON.stringify({ message: "No pending notifications", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📋 Found ${pendingNotifications.length} pending notification(s)`);

    let totalSent = 0;
    const results: { sessionId: string; sent: number; errors: string[] }[] = [];

    for (const notification of pendingNotifications as NotificationQueueItem[]) {
      console.log(`\n📧 Processing notification for session: ${notification.session_title}`);
      
      // Get all leads with access to this jornada
      const { data: jornadaAccess, error: accessError } = await supabase
        .from("jornada_access")
        .select("id, email, lead_id")
        .eq("jornada_slug", notification.jornada_slug);

      if (accessError) {
        console.error("❌ Error fetching jornada access:", accessError);
        results.push({ sessionId: notification.session_id, sent: 0, errors: [accessError.message] });
        continue;
      }

      if (!jornadaAccess || jornadaAccess.length === 0) {
        console.log("ℹ️ No leads found for this jornada");
        results.push({ sessionId: notification.session_id, sent: 0, errors: ["No leads found"] });
        continue;
      }

      console.log(`👥 Found ${jornadaAccess.length} lead(s) to notify`);

      // Get emails that already received reminder for this session
      const { data: alreadySent } = await supabase
        .from("jornada_reminders")
        .select("email")
        .eq("session_id", notification.session_id);

      const alreadySentEmails = new Set((alreadySent || []).map(r => r.email.toLowerCase()));
      console.log(`📝 ${alreadySentEmails.size} lead(s) already received reminder for this session`);

      // Filter out leads that already received reminder
      const leadsToNotify = (jornadaAccess as JornadaAccess[]).filter(
        access => !alreadySentEmails.has(access.email.toLowerCase())
      );

      console.log(`📤 Will send to ${leadsToNotify.length} lead(s)`);

      let sentCount = 0;
      const errors: string[] = [];

      for (const access of leadsToNotify) {
        try {
          // Build email HTML
          const emailHtml = buildEmailHtml(notification, access.email);
          
          // Send email via Resend
          const emailResponse = await resend.emails.send({
            from: "Jornada Imobiliária <naoresponda@clubesoberana.com.br>",
            to: [access.email],
            subject: `🎬 Nova aula liberada: ${notification.session_title}`,
            html: emailHtml,
          });

          console.log(`✅ Email sent to ${access.email}:`, emailResponse);

          // Record the reminder sent
          await supabase.from("jornada_reminders").insert({
            jornada_access_id: access.id,
            session_id: notification.session_id,
            email: access.email.toLowerCase(),
          });

          sentCount++;
          totalSent++;
        } catch (emailError: any) {
          console.error(`❌ Failed to send email to ${access.email}:`, emailError);
          errors.push(`${access.email}: ${emailError.message}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mark notification as processed
      await supabase
        .from("jornada_notification_queue")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("id", notification.id);

      results.push({ sessionId: notification.session_id, sent: sentCount, errors });
      console.log(`✨ Session ${notification.session_title}: ${sentCount} emails sent`);
    }

    console.log(`\n🎉 Total emails sent: ${totalSent}`);

    return new Response(
      JSON.stringify({ 
        message: "Reminders processed", 
        totalSent,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("❌ Error in send-jornada-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function buildEmailHtml(notification: NotificationQueueItem, email: string): string {
  const watchUrl = `https://soberana.com.br/jornada-imobiliaria-2026?session=${notification.session_day}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Aula Disponível</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; border: 1px solid #a69061; overflow: hidden;">
          
          <!-- Header com gradiente dourado -->
          <tr>
            <td style="background: linear-gradient(135deg, #a69061 0%, #8b7355 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #0a0a0a; font-size: 24px; margin: 0; font-weight: bold;">
                🎬 Nova Aula Liberada!
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #f5f5f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Olá! 👋
              </p>
              
              <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Excelente notícia! Uma nova aula da <strong style="color: #a69061;">Jornada Imobiliária 2026</strong> está disponível para você assistir:
              </p>
              
              <!-- Card da aula -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1f1f1f; border-radius: 12px; border-left: 4px solid #a69061; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="color: #a69061; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                      Dia ${notification.session_day}
                    </p>
                    <h2 style="color: #f5f5f0; font-size: 20px; margin: 0 0 10px; font-weight: bold;">
                      ${notification.session_title}
                    </h2>
                    ${notification.materials_url ? `
                    <p style="color: #888; font-size: 14px; margin: 0;">
                      📚 Material de apoio disponível
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${watchUrl}" style="display: inline-block; background: linear-gradient(135deg, #a69061 0%, #8b7355 100%); color: #0a0a0a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      ▶️ ASSISTIR AGORA
                    </a>
                  </td>
                </tr>
              </table>
              
              ${notification.materials_url ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td align="center">
                    <a href="${notification.materials_url}" style="color: #a69061; text-decoration: underline; font-size: 14px;">
                      📥 Baixar Material de Apoio
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 40px 0 0; text-align: center;">
                Não perca essa oportunidade de aprender e transformar sua carreira na advocacia imobiliária!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0d0d0d; padding: 25px 40px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                Soberana Mentoring Club
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                Com carinho, <strong style="color: #a69061;">Fabiana Duarte</strong>
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
}

serve(handler);
