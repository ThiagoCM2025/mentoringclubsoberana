import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// =====================================================
// IDs configurados via variáveis de ambiente
// Para configurar, adicione no .env:
// VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
// VITE_FB_PIXEL_ID=123456789012345
// =====================================================
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || "";

// Google Analytics initialization
const initGA = () => {
  if (!GA_MEASUREMENT_ID) return;

  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send page views manually for SPA
  });

  window.gtag = gtag;
};

// Facebook Pixel initialization
const initFBPixel = () => {
  if (!FB_PIXEL_ID) return;

  // Facebook Pixel base code
  (function (f: Window, b: Document, e: string, v: string) {
    let n: unknown;
    let t: HTMLScriptElement;
    let s: Element;
    if ((f as Window & { fbq?: unknown }).fbq) return;
    n = (f as Window & { fbq: unknown }).fbq = function (...args: unknown[]) {
      if ((n as { callMethod?: (...args: unknown[]) => void }).callMethod) {
        (n as { callMethod: (...args: unknown[]) => void }).callMethod(...args);
      } else {
        ((n as { queue: unknown[] }).queue = (n as { queue: unknown[] }).queue || []).push(args);
      }
    };
    (n as { push: unknown }).push = n;
    (n as { loaded: boolean }).loaded = true;
    (n as { version: string }).version = "2.0";
    (n as { queue: unknown[] }).queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", FB_PIXEL_ID);
};

// Track page view for both platforms
const trackPageView = (path: string) => {
  // Google Analytics
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
    });
  }

  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq("track", "PageView");
  }
};

// Custom event tracking
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  // Google Analytics
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", eventName, params);
  }

  // Facebook Pixel - map common events
  if (window.fbq && FB_PIXEL_ID) {
    const fbEventMap: Record<string, string> = {
      purchase: "Purchase",
      add_to_cart: "AddToCart",
      begin_checkout: "InitiateCheckout",
      sign_up: "CompleteRegistration",
      lead: "Lead",
      view_content: "ViewContent",
    };

    const fbEvent = fbEventMap[eventName] || eventName;
    window.fbq("track", fbEvent, params);
  }
};

// Track CTA clicks specifically for Experience Start
export const trackCTAClick = (ctaName: string, value?: number) => {
  trackEvent("cta_click", {
    cta_name: ctaName,
    page: "experience_start",
    value: value || 299,
    currency: "BRL",
  });

  // Also track as Lead for Facebook
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq("track", "Lead", {
      content_name: ctaName,
      value: value || 299,
      currency: "BRL",
    });
  }
};

// Analytics Provider Component
export const Analytics = () => {
  const location = useLocation();

  // Initialize analytics on mount
  useEffect(() => {
    initGA();
    initFBPixel();
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

// Type declarations for window
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
  }
}

export default Analytics;
