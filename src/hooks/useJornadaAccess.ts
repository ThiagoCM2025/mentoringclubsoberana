import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface JornadaAccessState {
  hasAccess: boolean;
  isChecking: boolean;
  accessToken: string | null;
}

export const useJornadaAccess = (jornadaSlug: string = "jornada-imobiliaria-2026") => {
  const [state, setState] = useState<JornadaAccessState>({
    hasAccess: false,
    isChecking: true,
    accessToken: null,
  });

  const checkAccess = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true }));

    try {
      // 1. Check localStorage first for quick response
      const storedToken = localStorage.getItem(`jornadaAccessToken_${jornadaSlug}`);
      const submitted = localStorage.getItem("jornadaLeadSubmitted");

      // If no local evidence of registration, user has no access
      if (!storedToken && !submitted) {
        setState({ hasAccess: false, isChecking: false, accessToken: null });
        return;
      }

      // 2. Validate token against database for security
      if (storedToken) {
        const { data } = await supabase
          .from("jornada_access")
          .select("id, access_token")
          .eq("access_token", storedToken)
          .eq("jornada_slug", jornadaSlug)
          .maybeSingle();

        if (data) {
          // Update last_accessed_at
          await supabase
            .from("jornada_access")
            .update({ last_accessed_at: new Date().toISOString() })
            .eq("id", data.id);

          setState({ hasAccess: true, isChecking: false, accessToken: storedToken });
          return;
        }
      }

      // Token invalid or missing, but user might have submitted form in this session
      // Check if there's access by email stored in another way
      if (submitted) {
        // User submitted form but doesn't have token - might be from before the system
        // Grant access for backwards compatibility
        setState({ hasAccess: true, isChecking: false, accessToken: null });
        return;
      }

      // No valid access found
      setState({ hasAccess: false, isChecking: false, accessToken: null });
    } catch (error) {
      console.error("Error checking jornada access:", error);
      // On error, check localStorage fallback
      const submitted = localStorage.getItem("jornadaLeadSubmitted");
      setState({ hasAccess: !!submitted, isChecking: false, accessToken: null });
    }
  }, [jornadaSlug]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const grantAccess = useCallback(async (email: string) => {
    try {
      // Fetch the access token for this email
      const { data } = await supabase
        .from("jornada_access")
        .select("access_token")
        .eq("email", email.toLowerCase().trim())
        .eq("jornada_slug", jornadaSlug)
        .maybeSingle();

      if (data?.access_token) {
        localStorage.setItem(`jornadaAccessToken_${jornadaSlug}`, data.access_token);
        setState({ hasAccess: true, isChecking: false, accessToken: data.access_token });
      } else {
        // Access might not be created yet by trigger, set flag and grant access
        localStorage.setItem("jornadaLeadSubmitted", "true");
        setState({ hasAccess: true, isChecking: false, accessToken: null });
      }
    } catch (error) {
      console.error("Error granting jornada access:", error);
      // Fallback - grant access via localStorage
      localStorage.setItem("jornadaLeadSubmitted", "true");
      setState({ hasAccess: true, isChecking: false, accessToken: null });
    }
  }, [jornadaSlug]);

  return {
    ...state,
    grantAccess,
    refreshAccess: checkAccess,
  };
};
