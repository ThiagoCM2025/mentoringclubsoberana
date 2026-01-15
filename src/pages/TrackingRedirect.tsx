import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const TrackingRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processTracking = async () => {
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        // Buscar token no banco
        const { data: tokenData, error: fetchError } = await supabase
          .from("lead_tracking_tokens")
          .select("id, lead_id, target_url, expires_at")
          .eq("token", token)
          .single();

        if (fetchError || !tokenData) {
          console.warn("Token não encontrado:", token);
          navigate("/", { replace: true });
          return;
        }

        // Verificar se expirou
        if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
          console.warn("Token expirado:", token);
          navigate("/", { replace: true });
          return;
        }

        // Salvar lead_id no localStorage para tracking futuro
        if (tokenData.lead_id) {
          localStorage.setItem("soberana_lead_id", tokenData.lead_id);
          console.log("Lead vinculado à sessão:", tokenData.lead_id);
        }

        // Marcar como clicado
        await supabase
          .from("lead_tracking_tokens")
          .update({ clicked_at: new Date().toISOString() })
          .eq("id", tokenData.id);

        // Registrar evento de clique
        if (tokenData.lead_id) {
          await supabase.from("lead_events").insert({
            lead_id: tokenData.lead_id,
            session_id: localStorage.getItem("soberana_session_id") || crypto.randomUUID(),
            event_type: "tracking_click",
            event_name: "Link de Tracking Clicado",
            page_url: window.location.href,
            page_title: document.title,
            event_data: { token, target_url: tokenData.target_url },
          });
        }

        // Redirecionar para URL destino
        const targetUrl = tokenData.target_url || "/";
        
        // Se for URL interna, usa navigate; senão, redireciona normalmente
        if (targetUrl.startsWith("/")) {
          navigate(targetUrl, { replace: true });
        } else {
          window.location.href = targetUrl;
        }
      } catch (err) {
        console.error("Erro ao processar tracking:", err);
        setError("Erro ao processar redirecionamento");
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    };

    processTracking();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackingRedirect;
