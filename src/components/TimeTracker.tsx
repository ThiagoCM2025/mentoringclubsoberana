import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = (): string => {
  const key = "soberana_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

export const TimeTracker = () => {
  const pageEntryTime = useRef<number>(Date.now());
  const hasTrackedExit = useRef<boolean>(false);
  const currentPath = useRef<string>(window.location.pathname);

  useEffect(() => {
    const sessionId = getSessionId();

    const trackPageExit = () => {
      if (hasTrackedExit.current) return;
      hasTrackedExit.current = true;

      const timeOnPage = Math.round((Date.now() - pageEntryTime.current) / 1000);
      
      // Only track if user spent more than 1 second
      if (timeOnPage < 1) return;

      // Use sendBeacon for reliability on page exit
      const payload = {
        session_id: sessionId,
        event_type: "page_exit",
        event_name: "page_exit",
        event_data: {
          time_on_page_seconds: timeOnPage,
          path: currentPath.current,
        },
        page_url: window.location.href,
        page_title: document.title,
      };

      // Try sendBeacon first (works on unload)
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const beaconUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lead_events`;
      
      navigator.sendBeacon(beaconUrl, blob);
      
      // Fallback: also try regular insert (for visibility change)
      supabase.from("lead_events").insert(payload).then(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackPageExit();
      }
    };

    const handleBeforeUnload = () => {
      trackPageExit();
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, []);

  return null;
};
