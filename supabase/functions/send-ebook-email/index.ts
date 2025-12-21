import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EbookEmailRequest {
  name: string;
  email: string;
  ebook_name: string;
}

// Map ebook names to their download URLs and descriptions
const ebookConfig: Record<string, { downloadUrl: string; description: string; fileName: string }> = {
  "Checklist 5 Passos para Estruturar seu Escritório": {
    downloadUrl: "https://ugmvhuxcncfwbehjlwbe.supabase.co/storage/v1/object/public/ebooks/checklist-5-passos.pdf",
    description: "o Checklist com os 5 Passos Essenciais para Estruturar seu Escritório de forma profissional e eficiente",
    fileName: "Checklist 5 Passos para Estruturar seu Escritório.pdf"
  },
  "7 Erros que Travam seu Escritório": {
    downloadUrl: "https://ugmvhuxcncfwbehjlwbe.supabase.co/storage/v1/object/public/ebooks/7-erros-escritorio.pdf",
    description: "o Guia Exclusivo com os 7 Erros Fatais que Travam o Crescimento do seu Escritório (e como evitá-los)",
    fileName: "7 Erros que Travam seu Escritório.pdf"
  }
};

function generateEbookEmailTemplate(
  recipientName: string,
  ebookDescription: string,
  downloadUrl: string
): string {
  const firstName = recipientName.split(" ")[0];
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu E-book está pronto!</title>
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
                    <p style="margin: 0 0 20px 0; font-size: 20px; color: #64001C; font-family: Georgia, 'Times New Roman', serif;">
                      Olá, <strong>${firstName}</strong>! 🎉
                    </p>
                    <div style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.7; color: #333333;">
                      <p style="margin: 0 0 15px 0;">
                        Parabéns por dar esse passo importante na sua jornada como advogada empreendedora!
                      </p>
                      <p style="margin: 0 0 15px 0;">
                        Conforme prometido, aqui está ${ebookDescription}.
                      </p>
                      <p style="margin: 0;">
                        Clique no botão abaixo para baixar seu material exclusivo:
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Download Button -->
                <tr>
                  <td style="text-align: center; padding: 10px 0 30px 0;">
                    <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #A69061 0%, #FFDFA6 100%); color: #64001C; font-size: 16px; font-weight: bold; text-decoration: none; padding: 18px 45px; border-radius: 8px; box-shadow: 0 4px 15px rgba(166, 144, 97, 0.4);">
                      📥 Baixar E-book Agora
                    </a>
                  </td>
                </tr>
                
                <!-- Bonus info -->
                <tr>
                  <td style="background-color: #ffffff; padding: 25px; border-radius: 8px; border-left: 4px solid #A69061;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #64001C; font-weight: bold;">
                      💡 Dica especial:
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                      Aproveite para ler o material com calma e fazer anotações. Nos próximos dias, vou te enviar mais conteúdos exclusivos para te ajudar a transformar sua prática jurídica!
                    </p>
                  </td>
                </tr>
                
                <!-- Decorative Line -->
                <tr>
                  <td style="padding: 30px 0 20px 0;">
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);

    const { name, email, ebook_name }: EbookEmailRequest = await req.json();

    console.log(`Sending ebook "${ebook_name}" to ${email} (${name})`);

    // Get ebook configuration
    const ebook = ebookConfig[ebook_name];
    if (!ebook) {
      console.error(`Unknown ebook: ${ebook_name}`);
      // Use a default configuration
      const defaultConfig = {
        downloadUrl: "https://soberanamentoria.com.br/ebook",
        description: "o material exclusivo que você solicitou",
        fileName: "ebook.pdf"
      };
      
      const htmlContent = generateEbookEmailTemplate(
        name,
        defaultConfig.description,
        defaultConfig.downloadUrl
      );

      const emailResult = await resend.emails.send({
        from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
        to: [email],
        subject: `📚 Seu material exclusivo está pronto, ${name.split(" ")[0]}!`,
        html: htmlContent,
      });

      console.log("Email sent with default config:", emailResult);

      return new Response(
        JSON.stringify({ success: true, message: "Email sent with default config" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate email HTML
    const htmlContent = generateEbookEmailTemplate(
      name,
      ebook.description,
      ebook.downloadUrl
    );

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: "Fabiana - Mentoria Soberana <contato@soberanamentoria.com.br>",
      to: [email],
      subject: `📚 Seu E-book está pronto, ${name.split(" ")[0]}!`,
      html: htmlContent,
    });

    console.log("Ebook email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso",
        resend_id: emailResult.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-ebook-email function:", error);
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
