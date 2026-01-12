import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Obter data/hora atual no horário de Brasília (GMT-3)
 */
function getBrazilNow(): Date {
  const now = new Date();
  const brazilOffset = -3 * 60;
  const utcOffset = now.getTimezoneOffset();
  const diff = brazilOffset + utcOffset;
  return new Date(now.getTime() + diff * 60 * 1000);
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  source: string | null;
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
  source_filter: string | null;
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

const generateProfessionalTemplate = (recipientName: string, subject: string, content: string): string => {
  // Convert all line breaks to proper HTML paragraphs
  const formattedContent = content
    .replace(/\\n\\n/g, "</p><p style='margin: 16px 0; color: #333333; font-size: 16px; line-height: 1.8;'>")
    .replace(/\\n/g, "<br>")
    .replace(/\n\n/g, "</p><p style='margin: 16px 0; color: #333333; font-size: 16px; line-height: 1.8;'>")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #F2F1EF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F2F1EF;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(100,0,28,0.1);">
          
          <!-- Header with Marsala gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #64001C 0%, #8B0027 50%, #A61C3C 100%); padding: 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <!-- Logo S styled as inline table for email compatibility -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px;">
                      <tr>
                        <td style="width: 60px; height: 60px; border: 2px solid #FFDFA6; border-radius: 12px; text-align: center; vertical-align: middle;">
                          <span style="color: #FFDFA6; font-family: Georgia, serif; font-size: 32px; font-weight: 700;">S</span>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #FFDFA6; font-size: 10px; margin: 0 0 4px 0; letter-spacing: 3px; text-transform: uppercase;">Mentoring Club</p>
                    <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px;">SOBERANA</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Decorative gold line -->
          <tr>
            <td style="background: linear-gradient(90deg, #A69061 0%, #FFDFA6 50%, #A69061 100%); height: 4px;"></td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.8;">
                ${formattedContent}
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 48px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://wa.me/5511999999999?text=Ol%C3%A1%20Fabiana!%20Vim%20pelo%20email%20e%20quero%20saber%20mais%20sobre%20a%20Mentoria%20Soberana" 
                       style="display: inline-block; background: linear-gradient(135deg, #A69061 0%, #8B7A4F 100%); color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(166,144,97,0.4); letter-spacing: 0.5px;">
                      💬 Falar com Fabiana no WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #e5e5e5;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <p style="color: #A69061; font-family: Georgia, serif; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
                Fabiana Augusto
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0 0 16px 0;">
                Fundadora da Mentoria Soberana
              </p>
              <p style="color: #cccccc; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Soberana Mentoring Club • Todos os direitos reservados
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Unsubscribe text -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 20px auto 0;">
          <tr>
            <td style="text-align: center;">
              <p style="color: #999999; font-size: 11px; margin: 0;">
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

/**
 * Find the correct sequence for a lead based on their source and nurturing step
 * Priority: source-specific sequence > default sequence (no source_filter)
 */
const findSequenceForLead = (
  lead: Lead, 
  sequences: NurturingSequence[], 
  nextStep: number
): NurturingSequence | null => {
  const leadSource = lead.source || '';
  
  // First, try to find a source-specific sequence
  const sourceSpecificSequence = sequences.find((s) => 
    s.source_filter === leadSource && s.step_number === nextStep
  );
  
  if (sourceSpecificSequence) {
    console.log(`Found source-specific sequence for ${lead.email}: ${sourceSpecificSequence.name} (source: ${leadSource})`);
    return sourceSpecificSequence;
  }
  
  // Check if this source has ANY sequences defined (to avoid mixing with default)
  const hasAnySourceSequence = sequences.some((s) => s.source_filter === leadSource);
  
  if (hasAnySourceSequence) {
    // This source has sequences but not for this step - lead has completed their journey
    console.log(`Lead ${lead.email} (source: ${leadSource}) has no more steps in their sequence`);
    return null;
  }
  
  // Fall back to default sequence (no source_filter)
  const defaultSequence = sequences.find((s) => 
    !s.source_filter && s.step_number === nextStep
  );
  
  if (defaultSequence) {
    console.log(`Using default sequence for ${lead.email}: ${defaultSequence.name}`);
  }
  
  return defaultSequence || null;
};

/**
 * Get the max step for a lead's sequence (source-specific or default)
 */
const getMaxStepForLead = (lead: Lead, sequences: NurturingSequence[]): number => {
  const leadSource = lead.source || '';
  
  // Check if this source has specific sequences
  const sourceSequences = sequences.filter((s) => s.source_filter === leadSource);
  
  if (sourceSequences.length > 0) {
    return Math.max(...sourceSequences.map((s) => s.step_number));
  }
  
  // Fall back to default sequences
  const defaultSequences = sequences.filter((s) => !s.source_filter);
  if (defaultSequences.length > 0) {
    return Math.max(...defaultSequences.map((s) => s.step_number));
  }
  
  return 5; // Fallback
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

    // Get all active nurturing sequences (including source-specific ones)
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
    
    // Log sequence breakdown
    const defaultSeqs = sequences?.filter((s: NurturingSequence) => !s.source_filter) || [];
    const sourceSeqs = sequences?.filter((s: NurturingSequence) => s.source_filter) || [];
    console.log(`  - Default sequences: ${defaultSeqs.length}`);
    console.log(`  - Source-specific sequences: ${sourceSeqs.length}`);

    // Get leads with active nurturing - include source for matching
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, full_name, email, source, nurturing_step, last_contact_at, nurturing_active")
      .eq("nurturing_active", true);

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    console.log(`Found ${leads?.length || 0} leads with active nurturing`);
    
    // Usar horário de Brasília
    const now = getBrazilNow();

    for (const lead of leads || []) {
      const nextStep = (lead.nurturing_step || 0) + 1;
      
      // Find the appropriate sequence for this lead
      const sequence = findSequenceForLead(lead as Lead, sequences as NurturingSequence[], nextStep);

      if (!sequence) {
        // Check if lead has completed their sequence
        const maxStep = getMaxStepForLead(lead as Lead, sequences as NurturingSequence[]);
        if ((lead.nurturing_step || 0) >= maxStep) {
          console.log(`Lead ${lead.email} has completed their nurturing sequence (step ${lead.nurturing_step}/${maxStep})`);
          // Mark as inactive since they completed
          await supabase
            .from("leads")
            .update({ nurturing_active: false })
            .eq("id", lead.id);
        } else {
          console.log(`No sequence found for lead ${lead.email} at step ${nextStep}`);
        }
        continue;
      }

      // Check if enough time has passed since last contact
      const lastContact = lead.last_contact_at ? new Date(lead.last_contact_at) : null;
      const isNewLead = (lead.nurturing_step || 0) === 0 && !lastContact;
      
      // New leads (step 0, no contact) get immediate first email
      // Otherwise, wait for delay_hours since last contact
      const hoursElapsed = lastContact 
        ? (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60)
        : isNewLead 
          ? sequence.delay_hours + 1  // Bypass delay for new leads
          : 0;

      if (hoursElapsed < sequence.delay_hours) {
        console.log(`Lead ${lead.email}: waiting ${(sequence.delay_hours - hoursElapsed).toFixed(1)} more hours for ${sequence.name}`);
        continue;
      }
      
      if (isNewLead) {
        console.log(`New lead ${lead.email}: sending immediate email from sequence "${sequence.name}"`);
      }

      // Prepare personalized email
      const personalizedSubject = replaceVariables(sequence.email_subject, lead as Lead);
      const personalizedBody = replaceVariables(sequence.email_body, lead as Lead);
      const htmlContent = generateProfessionalTemplate(lead.full_name, personalizedSubject, personalizedBody);

      try {
        // Send email
        const emailResult = await resend.emails.send({
          from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
          to: [lead.email],
          subject: personalizedSubject,
          html: htmlContent,
        });

        console.log(`Email sent to ${lead.email} (sequence: ${sequence.name}):`, emailResult);

        // Get max step for this lead's sequence
        const maxStep = getMaxStepForLead(lead as Lead, sequences as NurturingSequence[]);

        // Update lead nurturing step
        await supabase
          .from("leads")
          .update({
            nurturing_step: nextStep,
            last_contact_at: now.toISOString(),
            nurturing_active: nextStep < maxStep,
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
          metadata: { 
            sequence_step: nextStep, 
            sequence_name: sequence.name,
            source_filter: sequence.source_filter || 'default'
          },
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
