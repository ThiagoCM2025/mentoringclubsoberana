import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getBrazilISOString, getBrazilYear } from "../_shared/dateUtils.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function replaceVariables(text: string, name: string): string {
  return text
    .replace(/\{\{nome\}\}/gi, name)
    .replace(/\{\{name\}\}/gi, name);
}

function generateEmailTemplate(subject: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; }
        .header img { height: 50px; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .content h1 { color: #1a1a2e; margin-bottom: 20px; }
        .footer { background-color: #1a1a2e; color: #ffffff; padding: 20px; text-align: center; font-size: 12px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1a1a2e !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://ugmvhuxcncfwbehjlwbe.supabase.co/storage/v1/object/public/ebooks/soberana-logo-gold.png" alt="Soberana" />
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>© ${getBrazilYear()} Soberana - Todos os direitos reservados</p>
          <p>Este e-mail foi enviado por Fabiana Ferreira</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("[process-scheduled-messages] Starting execution...");

  try {
    // Buscar disparos pendentes que já deveriam ter sido executados
    const now = getBrazilISOString();
    
    const { data: pendingMessages, error: fetchError } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error("[process-scheduled-messages] Error fetching messages:", fetchError);
      throw fetchError;
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      console.log("[process-scheduled-messages] No pending messages to process");
      return new Response(JSON.stringify({ message: "No pending messages", processed: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`[process-scheduled-messages] Found ${pendingMessages.length} pending messages`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const scheduledMsg of pendingMessages) {
      console.log(`[process-scheduled-messages] Processing message ${scheduledMsg.id}`);

      // Marcar como processing
      await supabase
        .from("scheduled_messages")
        .update({ status: "processing" })
        .eq("id", scheduledMsg.id);

      try {
        // Buscar leads baseado nos filtros
        let leadsQuery = supabase.from("leads").select("id, full_name, email, phone");
        
        if (scheduledMsg.source_filter) {
          if (scheduledMsg.source_filter.includes("%")) {
            leadsQuery = leadsQuery.ilike("source", scheduledMsg.source_filter);
          } else {
            leadsQuery = leadsQuery.eq("source", scheduledMsg.source_filter);
          }
        }

        if (scheduledMsg.status_filter) {
          leadsQuery = leadsQuery.eq("status", scheduledMsg.status_filter);
        }

        if (scheduledMsg.temperature_filter) {
          leadsQuery = leadsQuery.eq("temperature", scheduledMsg.temperature_filter);
        }

        const { data: leads, error: leadsError } = await leadsQuery;

        if (leadsError) {
          throw leadsError;
        }

        if (!leads || leads.length === 0) {
          console.log(`[process-scheduled-messages] No leads found for message ${scheduledMsg.id}`);
          await supabase
            .from("scheduled_messages")
            .update({ 
              status: "completed", 
              processed_at: getBrazilISOString(),
              sent_count: 0,
              error_message: "Nenhum lead encontrado para os filtros especificados"
            })
            .eq("id", scheduledMsg.id);
          continue;
        }

        console.log(`[process-scheduled-messages] Found ${leads.length} leads for message ${scheduledMsg.id}`);

        let sentCount = 0;
        let failedCount = 0;

        // Enviar emails
        if (scheduledMsg.channel === "email") {
          for (const lead of leads) {
            try {
              const personalizedMessage = replaceVariables(scheduledMsg.message, lead.full_name);
              const personalizedSubject = scheduledMsg.subject 
                ? replaceVariables(scheduledMsg.subject, lead.full_name)
                : "Mensagem da Soberana";

              const htmlContent = generateEmailTemplate(personalizedSubject, personalizedMessage);

              const emailResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                  from: "Fabiana Ferreira <contato@soberana.pro>",
                  to: [lead.email],
                  subject: personalizedSubject,
                  html: htmlContent,
                }),
              });

              if (!emailResponse.ok) {
                throw new Error(`Resend error: ${emailResponse.status}`);
              }

              console.log(`[process-scheduled-messages] Email sent to ${lead.email}`);

              // Registrar na tabela communication_history
              await supabase.from("communication_history").insert({
                recipient_id: lead.id,
                recipient_type: "lead",
                recipient_name: lead.full_name,
                recipient_email: lead.email,
                channel: "email",
                subject: personalizedSubject,
                message: personalizedMessage,
                status: "sent",
                template_id: scheduledMsg.template_id,
                metadata: { scheduled_message_id: scheduledMsg.id },
              });

              sentCount++;
            } catch (emailError: any) {
              console.error(`[process-scheduled-messages] Error sending email to ${lead.email}:`, emailError);
              failedCount++;

              await supabase.from("communication_history").insert({
                recipient_id: lead.id,
                recipient_type: "lead",
                recipient_name: lead.full_name,
                recipient_email: lead.email,
                channel: "email",
                subject: scheduledMsg.subject || "",
                message: scheduledMsg.message,
                status: "failed",
                template_id: scheduledMsg.template_id,
                metadata: { 
                  scheduled_message_id: scheduledMsg.id,
                  error: emailError.message 
                },
              });
            }
          }
        } else if (scheduledMsg.channel === "whatsapp") {
          // Enviar WhatsApp via Evolution API
          if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
            console.error("[process-scheduled-messages] Evolution API not configured");
            throw new Error("Evolution API not configured");
          }

          const evolutionUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

          for (const lead of leads) {
            if (!lead.phone) {
              console.log(`[process-scheduled-messages] Lead ${lead.full_name} has no phone, skipping`);
              continue;
            }

            try {
              const personalizedMessage = replaceVariables(scheduledMsg.message, lead.full_name);

              // Format phone number
              let formattedPhone = lead.phone.replace(/\D/g, "");
              if (!formattedPhone.startsWith("55")) {
                formattedPhone = "55" + formattedPhone;
              }

              console.log(`[process-scheduled-messages] Sending WhatsApp to ${formattedPhone}`);

              const evolutionResponse = await fetch(evolutionUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": EVOLUTION_API_KEY,
                },
                body: JSON.stringify({
                  number: formattedPhone,
                  text: personalizedMessage,
                  delay: 1200 + Math.random() * 800,
                }),
              });

              const evolutionData = await evolutionResponse.json();

              if (!evolutionResponse.ok) {
                throw new Error(evolutionData?.message || `Evolution error: ${evolutionResponse.status}`);
              }

              console.log(`[process-scheduled-messages] WhatsApp sent to ${lead.full_name}`);

              // Registrar na tabela communication_history
              await supabase.from("communication_history").insert({
                recipient_id: lead.id,
                recipient_type: "lead",
                recipient_name: lead.full_name,
                recipient_phone: lead.phone,
                channel: "whatsapp",
                message: personalizedMessage,
                status: "sent",
                template_id: scheduledMsg.template_id,
                metadata: { 
                  scheduled_message_id: scheduledMsg.id,
                  sent_via: "evolution_api_scheduled",
                  evolution_response: evolutionData,
                },
              });

              sentCount++;

              // Small delay between messages
              await new Promise(resolve => setTimeout(resolve, 500));

            } catch (whatsappError: any) {
              console.error(`[process-scheduled-messages] Error sending WhatsApp to ${lead.full_name}:`, whatsappError);
              failedCount++;

              await supabase.from("communication_history").insert({
                recipient_id: lead.id,
                recipient_type: "lead",
                recipient_name: lead.full_name,
                recipient_phone: lead.phone,
                channel: "whatsapp",
                message: scheduledMsg.message,
                status: "failed",
                template_id: scheduledMsg.template_id,
                metadata: { 
                  scheduled_message_id: scheduledMsg.id,
                  sent_via: "evolution_api_scheduled",
                  error: whatsappError.message,
                },
              });
            }
          }
        }

        // Atualizar status final
        await supabase
          .from("scheduled_messages")
          .update({
            status: failedCount === leads.length ? "failed" : "completed",
            processed_at: getBrazilISOString(),
            sent_count: sentCount,
            failed_count: failedCount,
            error_message: failedCount > 0 ? `${failedCount} envios falharam` : null,
          })
          .eq("id", scheduledMsg.id);

        totalSent += sentCount;
        totalFailed += failedCount;

        console.log(`[process-scheduled-messages] Message ${scheduledMsg.id} completed: ${sentCount} sent, ${failedCount} failed`);

      } catch (processError: any) {
        console.error(`[process-scheduled-messages] Error processing message ${scheduledMsg.id}:`, processError);
        
        await supabase
          .from("scheduled_messages")
          .update({
            status: "failed",
            processed_at: getBrazilISOString(),
            error_message: processError.message || "Erro desconhecido",
          })
          .eq("id", scheduledMsg.id);

        totalFailed++;
      }
    }

    // Registrar execução no histórico
    await supabase.from("nurturing_executions").insert({
      job_name: "process-scheduled-messages",
      emails_sent: totalSent,
      errors_count: totalFailed,
      execution_details: {
        messages_processed: pendingMessages.length,
        total_sent: totalSent,
        total_failed: totalFailed,
      },
    });

    console.log(`[process-scheduled-messages] Execution complete. Total: ${totalSent} sent, ${totalFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingMessages.length,
        totalSent,
        totalFailed,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[process-scheduled-messages] Fatal error:", error);
    
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
