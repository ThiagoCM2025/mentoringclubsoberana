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

    // Buscar destinatários configurados
    const { data: recipients, error: recipientsError } = await supabase
      .from("admin_alert_email_config")
      .select("*")
      .eq("is_active", true)
      .order("is_primary", { ascending: false });

    if (recipientsError || !recipients?.length) {
      throw new Error("Nenhum destinatário configurado");
    }

    const primaryRecipient = recipients.find((r: any) => r.is_primary) || recipients[0];
    const ccRecipients = recipients
      .filter((r: any) => r.email !== primaryRecipient.email)
      .map((r: any) => r.email);

    // Enviar email de teste
    const emailResponse = await resend.emails.send({
      from: 'Soberana Alertas <alertas@soberanamentoria.com.br>',
      to: [primaryRecipient.email],
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      subject: '✅ [TESTE] Sistema de Alertas Funcionando!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #64001C 0%, #8B0027 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #FFDFA6; margin: 0; font-size: 24px;">🔔 Teste de Alerta</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Sistema de Notificações Soberana</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="color: #22c55e; margin: 0 0 20px 0;">✅ Tudo Funcionando!</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Este é um email de teste para confirmar que o sistema de alertas está configurado corretamente.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
              <strong style="color: #15803d;">Destinatários configurados:</strong>
              <ul style="margin: 10px 0 0 0; color: #333;">
                <li><strong>Principal:</strong> ${primaryRecipient.name} (${primaryRecipient.email})</li>
                ${ccRecipients.map((email: string) => `<li><strong>Cópia:</strong> ${email}</li>`).join('')}
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              A partir de agora, vocês receberão alertas automáticos sobre:
            </p>
            <ul style="color: #666; font-size: 14px;">
              <li>Leads quentes sem contato há 24h</li>
              <li>Alunas inativas há 7 dias</li>
              <li>Missões pendentes de revisão há 48h</li>
              <li>Baixa conversão de leads</li>
              <li>Novas matrículas</li>
              <li>Posts denunciados na comunidade</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e5e5; border-top: none;">
            <p style="color: #A69061; font-size: 14px; margin: 0;">
              Soberana Mentoring Club
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              Enviado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </p>
          </div>
        </div>
      `,
    });

    console.log("Test alert email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email de teste enviado para ${primaryRecipient.email}` + 
                 (ccRecipients.length > 0 ? ` com cópia para ${ccRecipients.join(', ')}` : ''),
        emailResponse 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in test-alert-email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
