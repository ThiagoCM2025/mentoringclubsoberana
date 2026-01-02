import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  id: string;
  full_name: string;
  email: string;
  nurturing_step: number;
  last_contact_at: string | null;
  nurturing_active: boolean;
}

interface NurturingSequence {
  id: string;
  step_number: number;
  name: string;
  delay_hours: number;
  email_subject: string;
  email_body: string;
  is_active: boolean;
}

const replaceVariables = (text: string, lead: Lead): string => {
  const firstName = lead.full_name.split(" ")[0] || "Querida";
  const fullName = lead.full_name || "Querida";
  
  return text
    .replace(/\{\{\{nome\}\}\}/g, firstName)
    .replace(/\{\{\{nome_completo\}\}\}/g, fullName)
    .replace(/\{\{nome\}\}/g, firstName)
    .replace(/\{\{nome_completo\}\}/g, fullName)
    .replace(/\{\{email\}\}/g, lead.email)
    .replace(/\{nome\}/g, firstName)
    .replace(/\{nome_completo\}/g, fullName)
    .replace(/\{email\}/g, lead.email)
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{full_name\}\}/g, fullName);
};

const generateEmailTemplate = (recipientName: string, subject: string, content: string): string => {
  const formattedContent = content
    .replace(/\\n\\n/g, "<br><br>")
    .replace(/\\n/g, "<br>")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #F2F1EF;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F2F1EF;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #64001C 0%, #8B0027 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #FFDFA6; font-size: 24px; margin: 0; font-family: 'Georgia', serif;">Soberana</h1>
              <p style="color: #ffffff; font-size: 12px; margin: 5px 0 0 0; letter-spacing: 2px;">MENTORING CLUB</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${formattedContent}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #A69061; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Soberana Mentoring Club
              </p>
              <p style="color: #999999; font-size: 11px; margin: 10px 0 0 0;">
                Você recebeu este email porque se cadastrou em nossa plataforma.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let emailsSent = 0;
  let errorsCount = 0;
  const leadsProcessed: string[] = [];

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active nurturing sequences
    const { data: sequences, error: seqError } = await supabase
      .from("nurturing_sequences")
      .select("*")
      .eq("is_active", true)
      .order("step_number");

    if (seqError) {
      console.error("Error fetching sequences:", seqError);
      throw seqError;
    }

    console.log(`Found ${sequences?.length || 0} active nurturing sequences`);

    // Get leads with active nurturing that need to be contacted
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, full_name, email, nurturing_step, last_contact_at, nurturing_active")
      .eq("nurturing_active", true)
      .lt("nurturing_step", 5);

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    console.log(`Found ${leads?.length || 0} leads with active nurturing`);

    const now = new Date();

    for (const lead of leads || []) {
      const nextStep = (lead.nurturing_step || 0) + 1;
      const sequence = sequences?.find((s: NurturingSequence) => s.step_number === nextStep);

      if (!sequence) {
        console.log(`No sequence found for step ${nextStep}`);
        continue;
      }

      // Check if enough time has passed since last contact
      const lastContact = lead.last_contact_at ? new Date(lead.last_contact_at) : null;
      const hoursElapsed = lastContact 
        ? (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60)
        : sequence.delay_hours + 1;

      if (hoursElapsed < sequence.delay_hours) {
        console.log(`Lead ${lead.email}: waiting ${(sequence.delay_hours - hoursElapsed).toFixed(1)} more hours`);
        continue;
      }

      // Prepare personalized email
      const personalizedSubject = replaceVariables(sequence.email_subject, lead as Lead);
      const personalizedBody = replaceVariables(sequence.email_body, lead as Lead);
      const htmlContent = generateEmailTemplate(lead.full_name, personalizedSubject, personalizedBody);

      try {
        // Send email
        const emailResult = await resend.emails.send({
          from: "Fabiana Augusto <noreply@soberana.com.br>",
          to: [lead.email],
          subject: personalizedSubject,
          html: htmlContent,
        });

        console.log(`Email sent to ${lead.email}:`, emailResult);

        // Update lead nurturing step
        await supabase
          .from("leads")
          .update({
            nurturing_step: nextStep,
            last_contact_at: now.toISOString(),
            nurturing_active: nextStep < 5,
          })
          .eq("id", lead.id);

        // Log communication
        await supabase.from("communication_history").insert({
          recipient_id: lead.id,
          recipient_type: "lead",
          recipient_name: lead.full_name,
          recipient_email: lead.email,
          channel: "email",
          subject: personalizedSubject,
          message: personalizedBody,
          status: "sent",
          metadata: { sequence_step: nextStep, sequence_name: sequence.name },
        });

        emailsSent++;
        leadsProcessed.push(lead.email);
      } catch (emailError) {
        console.error(`Error sending to ${lead.email}:`, emailError);
        errorsCount++;
      }
    }

    const executionTimeMs = Date.now() - startTime;
    console.log(`Nurturing complete: ${emailsSent} emails sent, ${errorsCount} errors in ${executionTimeMs}ms`);

    // Log execution to nurturing_executions table
    await supabase.from("nurturing_executions").insert({
      emails_sent: emailsSent,
      errors_count: errorsCount,
      leads_processed: leadsProcessed,
      execution_time_ms: executionTimeMs,
      status: errorsCount > 0 ? "partial" : "success",
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        errorsCount,
        executionTimeMs,
        message: `Nurturing processado: ${emailsSent} emails enviados, ${errorsCount} erros`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in nurturing function:", error);
    
    // Log failed execution
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("nurturing_executions").insert({
        emails_sent: emailsSent,
        errors_count: errorsCount + 1,
        leads_processed: leadsProcessed,
        execution_time_ms: Date.now() - startTime,
        status: "error",
        error_details: error.message,
      });
    }

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
