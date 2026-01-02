import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tipos de eventos
export type EventType = 
  | "cta_click" 
  | "scroll_depth" 
  | "form_start" 
  | "form_complete" 
  | "page_view";

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

// Gerar ou recuperar session_id único
const getSessionId = (): string => {
  const key = "soberana_session_id";
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

// Push para dataLayer do GTM
const pushToDataLayer = (eventName: string, eventData: EventData) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  }
};

// Salvar evento no Supabase
const saveEventToSupabase = async (
  sessionId: string,
  eventType: EventType,
  eventName: string,
  eventData: EventData
) => {
  try {
    await supabase.from("lead_events").insert({
      session_id: sessionId,
      event_type: eventType,
      event_name: eventName,
      event_data: eventData,
      page_url: window.location.href,
      page_title: document.title,
    });
  } catch (error) {
    console.error("Error saving event:", error);
  }
};

export const useEventTracking = () => {
  const sessionId = useRef(getSessionId());
  const trackedScrollDepths = useRef<Set<number>>(new Set());

  // Track page view on mount
  useEffect(() => {
    const pageViewKey = `pv_${window.location.pathname}`;
    const alreadyTracked = sessionStorage.getItem(pageViewKey);
    
    if (!alreadyTracked) {
      trackEvent("page_view", "page_view", {
        path: window.location.pathname,
        referrer: document.referrer,
      });
      sessionStorage.setItem(pageViewKey, "1");
    }
  }, []);

  // Função genérica de tracking
  const trackEvent = useCallback(
    (eventType: EventType, eventName: string, eventData: EventData = {}) => {
      // Push para GTM
      pushToDataLayer(eventName, {
        event_type: eventType,
        session_id: sessionId.current,
        ...eventData,
      });

      // Salvar no Supabase
      saveEventToSupabase(sessionId.current, eventType, eventName, eventData);
    },
    []
  );

  // Track clique em CTA
  const trackCTAClick = useCallback(
    (ctaName: string, data: EventData = {}) => {
      trackEvent("cta_click", ctaName, {
        cta_name: ctaName,
        ...data,
      });
    },
    [trackEvent]
  );

  // Track profundidade de scroll
  const trackScrollDepth = useCallback(
    (depth: number) => {
      // Evitar duplicatas na mesma página/sessão
      const pageKey = window.location.pathname;
      const depthKey = `${pageKey}_${depth}`;
      
      if (trackedScrollDepths.current.has(depth)) return;
      trackedScrollDepths.current.add(depth);

      trackEvent("scroll_depth", `scroll_${depth}`, {
        depth,
        page: pageKey,
      });
    },
    [trackEvent]
  );

  // Track eventos de formulário
  const trackFormStart = useCallback(
    (formName: string, data: EventData = {}) => {
      const formKey = `form_start_${formName}`;
      if (sessionStorage.getItem(formKey)) return;
      sessionStorage.setItem(formKey, "1");

      trackEvent("form_start", `${formName}_start`, {
        form_name: formName,
        ...data,
      });
    },
    [trackEvent]
  );

  const trackFormComplete = useCallback(
    (formName: string, data: EventData = {}) => {
      trackEvent("form_complete", `${formName}_complete`, {
        form_name: formName,
        ...data,
      });
    },
    [trackEvent]
  );

  // Vincular eventos a um lead
  const linkEventsToLead = useCallback(async (leadId: string) => {
    try {
      await supabase
        .from("lead_events")
        .update({ lead_id: leadId })
        .eq("session_id", sessionId.current)
        .is("lead_id", null);
    } catch (error) {
      console.error("Error linking events to lead:", error);
    }
  }, []);

  return {
    sessionId: sessionId.current,
    trackEvent,
    trackCTAClick,
    trackScrollDepth,
    trackFormStart,
    trackFormComplete,
    linkEventsToLead,
  };
};
