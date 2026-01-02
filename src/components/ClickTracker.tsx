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

const getLeadId = (): string | null => {
  return localStorage.getItem("soberana_lead_id");
};

const getElementSelector = (element: HTMLElement): string => {
  if (element.id) return `#${element.id}`;
  
  const tagName = element.tagName.toLowerCase();
  const classes = Array.from(element.classList).slice(0, 2).join(".");
  
  if (classes) return `${tagName}.${classes}`;
  
  // Try to get text content for buttons/links
  if (tagName === "button" || tagName === "a") {
    const text = element.textContent?.trim().slice(0, 20);
    if (text) return `${tagName}[text="${text}"]`;
  }
  
  return tagName;
};

export const ClickTracker = () => {
  const lastClickTime = useRef<number>(0);
  const clickQueue = useRef<Array<{
    x_percent: number;
    y_px: number;
    element: string;
    page_width: number;
    page_height: number;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    const sessionId = getSessionId();

    const flushQueue = async () => {
      if (clickQueue.current.length === 0) return;
      
      const clicks = [...clickQueue.current];
      clickQueue.current = [];

      // Batch insert all clicks
      const leadId = getLeadId();
      const events = clicks.map((click) => ({
        session_id: sessionId,
        event_type: "click_position" as const,
        event_name: "click_position",
        event_data: click,
        page_url: window.location.href,
        page_title: document.title,
        lead_id: leadId,
      }));

      try {
        await supabase.from("lead_events").insert(events);
      } catch (error) {
        console.error("Error tracking clicks:", error);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      
      // Throttle: ignore clicks within 100ms of each other
      if (now - lastClickTime.current < 100) return;
      lastClickTime.current = now;

      const target = e.target as HTMLElement;
      if (!target) return;

      // Skip tracking on admin pages
      if (window.location.pathname.startsWith("/admin")) return;

      const pageWidth = window.innerWidth;
      const pageHeight = document.documentElement.scrollHeight;
      
      // Calculate position relative to viewport width (%) and absolute Y position
      const xPercent = Math.round((e.clientX / pageWidth) * 100);
      const yPx = Math.round(e.pageY);

      clickQueue.current.push({
        x_percent: xPercent,
        y_px: yPx,
        element: getElementSelector(target),
        page_width: pageWidth,
        page_height: pageHeight,
        timestamp: now,
      });
    };

    // Flush queue every 5 seconds if there are pending clicks
    const flushInterval = setInterval(flushQueue, 5000);

    // Add click listener
    document.addEventListener("click", handleClick, true);

    // Flush on page exit
    const handleUnload = () => {
      if (clickQueue.current.length > 0) {
        const leadId = getLeadId();
        const payload = clickQueue.current.map((click) => ({
          session_id: sessionId,
          event_type: "click_position",
          event_name: "click_position",
          event_data: click,
          page_url: window.location.href,
          page_title: document.title,
          lead_id: leadId,
        }));

        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lead_events`,
          blob
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(flushInterval);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      flushQueue(); // Flush remaining clicks on unmount
    };
  }, []);

  return null;
};
