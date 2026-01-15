import { supabase } from "@/integrations/supabase/client";

/**
 * Gera um link de tracking personalizado para um lead
 * @param leadId - ID do lead no banco
 * @param targetUrl - URL de destino após redirect (ex: '/jornada-imobiliaria-2026')
 * @returns URL completa de tracking (ex: https://soberanamentoria.com.br/t/abc123)
 */
export const generateTrackingLink = async (
  leadId: string,
  targetUrl = "/"
): Promise<string | null> => {
  try {
    // Gerar token único de 12 caracteres
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Inserir no banco com expiração de 30 dias
    const { error } = await supabase.from("lead_tracking_tokens").insert({
      lead_id: leadId,
      token,
      target_url: targetUrl,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      console.error("Erro ao gerar token de tracking:", error);
      return null;
    }

    return `https://soberanamentoria.com.br/t/${token}`;
  } catch (err) {
    console.error("Erro inesperado ao gerar link de tracking:", err);
    return null;
  }
};

/**
 * Substitui a variável {{link_tracking}} por um link real de tracking
 * @param text - Texto com a variável
 * @param leadId - ID do lead
 * @param targetUrl - URL de destino
 * @returns Texto com link substituído
 */
export const replaceTrackingVariable = async (
  text: string,
  leadId: string,
  targetUrl = "/"
): Promise<string> => {
  if (!text.includes("{{link_tracking}}")) {
    return text;
  }

  const trackingLink = await generateTrackingLink(leadId, targetUrl);
  
  if (!trackingLink) {
    // Fallback para URL direta se não conseguir gerar token
    return text.replace(/\{\{link_tracking\}\}/g, `https://soberanamentoria.com.br${targetUrl}`);
  }

  return text.replace(/\{\{link_tracking\}\}/g, trackingLink);
};
