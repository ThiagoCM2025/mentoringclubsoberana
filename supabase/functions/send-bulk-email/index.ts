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
  const firstName = (recipient.name || "").split(" ")[0] || "Querida";
  const fullName = recipient.name || "Querida";
  
  return text
    // Padrão com três chaves (corrigir legado)
    .replace(/\{\{\{nome\}\}\}/g, firstName)
    .replace(/\{\{\{nome_completo\}\}\}/g, fullName)
    // Padrão com duas chaves (preferido)
    .replace(/\{\{nome\}\}/g, firstName)
    .replace(/\{\{nome_completo\}\}/g, fullName)
    .replace(/\{\{email\}\}/g, recipient.email || "")
    .replace(/\{\{telefone\}\}/g, recipient.phone || "")
    // Variação com uma chave (legado)
    .replace(/\{nome\}/g, firstName)
    .replace(/\{nome_completo\}/g, fullName)
    .replace(/\{email\}/g, recipient.email || "")
    .replace(/\{telefone\}/g, recipient.phone || "");
}

function generateEmailTemplate(
  recipientName: string,
  subject: string,
  content: string,
  recipientType: "student" | "lead"
): string {
  const ctaText = recipientType === "student" ? "Acessar Plataforma" : "Conhecer a Mentoria";
  const ctaUrl = recipientType === "student" 
    ? "https://soberanamentoria.com.br/student" 
    : "https://soberanamentoria.com.br";

    const formattedContent = content
      .replace(/\\n\\n/g, "<br><br>")
      .replace(/\\n/g, "<br>")
      .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #64001C 0%, #8B0027 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; letter-spacing: 3px; color: #FFDFA6; text-transform: uppercase;">✨ Mentoria ✨</p>
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; font-weight: normal; color: #FFDFA6; letter-spacing: 2px;">SOBERANA</h1>
                    <p style="margin: 12px 0 0 0; font-size: 14px; color: #ffffff; opacity: 0.9;">Fabiana Duarte</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background-color: #F2F1EF; padding: 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <div style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.7; color: #333333;">
                      ${formattedContent}
                    </div>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="text-align: center; padding: 10px 0 30px 0;">
                    <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #A69061 0%, #FFDFA6 100%); color: #64001C; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(166, 144, 97, 0.4);">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
                
                <!-- Decorative Line -->
                <tr>
                  <td style="padding: 20px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="border-top: 2px solid #A69061; height: 1px;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Signature -->
                <tr>
                  <td style="text-align: center; padding-top: 10px;">
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">Com carinho,</p>
                    <p style="margin: 0 0 5px 0; font-size: 18px; color: #64001C; font-family: Georgia, 'Times New Roman', serif; font-weight: bold;">Fabiana Duarte</p>
                    <p style="margin: 0; font-size: 13px; color: #A69061; letter-spacing: 1px;">Mentoria Soberana</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #64001C; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #FFDFA6;">
                © ${new Date().getFullYear()} Mentoria Soberana | Todos os direitos reservados
              </p>
              <p style="margin: 0; font-size: 11px; color: #ffffff; opacity: 0.7;">
                Transformando advogadas em empresárias de sucesso
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
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
          // Generate elegant HTML template
          const htmlContent = generateEmailTemplate(
            recipient.name || "Querida",
            personalizedSubject,
            personalizedMessage,
            recipient.type
          );

          // Send email via Resend
          const emailResponse = await resend.emails.send({
            from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
            to: [recipient.email],
            subject: personalizedSubject,
            html: htmlContent,
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
