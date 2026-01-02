import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const emailBody = sequence.email_body.replace(/\{\{nome\}\}/g, "Teste");
    const emailSubject = `[TESTE] ${sequence.email_subject.replace(/\{\{nome\}\}/g, "Teste")}`;

    // Send test email
    const { error: sendError } = await resend.emails.send({
      from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
      to: adminEmail,
      subject: emailSubject,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #c9a860; margin: 0; text-align: center;">E-mail de Teste - Etapa ${step_number}</h2>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              <strong>Sequência:</strong> ${sequence.name}<br>
              <strong>Delay original:</strong> ${sequence.delay_hours}h após último contato
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
            <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${emailBody}
            </div>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Este é um e-mail de teste enviado pelo painel admin.
          </p>
        </div>
      `,
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
