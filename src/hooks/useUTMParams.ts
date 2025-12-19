import { useEffect, useMemo } from "react";

interface UTMParams {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

const UTM_STORAGE_KEY = "utm_params";

export const useUTMParams = () => {
  // Capture UTM params from URL and store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const utmParams: UTMParams = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
    };

    // Only store if at least one UTM param is present
    const hasUTM = Object.values(utmParams).some((v) => v);
    if (hasUTM) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    }
  }, []);

  // Build URL with stored UTM params
  const buildUrlWithUTM = useMemo(() => {
    return (baseUrl: string): string => {
      try {
        const stored = localStorage.getItem(UTM_STORAGE_KEY);
        if (!stored) return baseUrl;

        const utmParams: UTMParams = JSON.parse(stored);
        const url = new URL(baseUrl);

        Object.entries(utmParams).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, value);
          }
        });

        return url.toString();
      } catch {
        return baseUrl;
      }
    };
  }, []);

  // Get stored UTM params
  const getStoredUTMs = (): UTMParams => {
    try {
      const stored = localStorage.getItem(UTM_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  return { buildUrlWithUTM, getStoredUTMs };
};
