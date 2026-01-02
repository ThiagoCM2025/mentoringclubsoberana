import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateProfessionalTemplate = (recipientName: string, subject: string, content: string, stepNumber: number): string => {
  // Convert all line breaks to proper HTML
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
                    <!-- Logo S -->
                    <div style="width: 60px; height: 60px; margin: 0 auto 16px; border: 2px solid #FFDFA6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: #FFDFA6; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700;">S</span>
                    </div>
                    <p style="color: #FFDFA6; font-size: 10px; margin: 0 0 4px 0; letter-spacing: 3px; text-transform: uppercase;">Mentoring Club</p>
                    <h1 style="color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px;">SOBERANA</h1>
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
                       style="display: inline-block; background: linear-gradient(135deg, #A69061 0%, #8B7A4F 100%); color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(166,144,97,0.4); letter-spacing: 0.5px;">
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
              <p style="color: #A69061; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Get user's email
    const adminEmail = user.email;
    if (!adminEmail) {
      throw new Error("Email do admin não encontrado");
    }

    // Parse request body
    const { step_number } = await req.json();

    if (!step_number || typeof step_number !== "number") {
      throw new Error("step_number é obrigatório");
    }

    // Fetch the nurturing sequence for this step
    const { data: sequence, error: seqError } = await supabase
      .from("nurturing_sequences")
      .select("*")
      .eq("step_number", step_number)
      .single();

    if (seqError || !sequence) {
      throw new Error(`Sequência da etapa ${step_number} não encontrada`);
    }

    // Replace {{nome}} with test name
    const emailBody = sequence.email_body.replace(/\{\{nome\}\}/g, "Maria");
    const emailSubject = `[TESTE] ${sequence.email_subject.replace(/\{\{nome\}\}/g, "Maria")}`;

    // Generate professional HTML template
    const htmlContent = generateProfessionalTemplate("Maria", emailSubject, emailBody, step_number);

    // Send test email
    const { error: sendError } = await resend.emails.send({
      from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
      to: adminEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    if (sendError) {
      console.error("Error sending test email:", sendError);
      throw new Error("Falha ao enviar e-mail de teste");
    }

    console.log(`Test email sent to ${adminEmail} for step ${step_number}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: adminEmail,
        message: `E-mail de teste enviado para ${adminEmail}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in test-nurturing-email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
