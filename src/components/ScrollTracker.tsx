import { useEffect, useRef } from "react";
import { useEventTracking } from "@/hooks/useEventTracking";

interface ScrollTrackerProps {
  thresholds?: number[];
}

export const ScrollTracker = ({ thresholds = [25, 50, 75, 100] }: ScrollTrackerProps) => {
  const { trackScrollDepth } = useEventTracking();
  const trackedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      thresholds.forEach((threshold) => {
        if (
          scrollPercentage >= threshold &&
          !trackedThresholds.current.has(threshold)
        ) {
          trackedThresholds.current.add(threshold);
          trackScrollDepth(threshold);
        }
      });
    };

    // Debounce para performance
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", debouncedScroll, { passive: true });

    // Check inicial caso a página já esteja scrollada
    handleScroll();

    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [thresholds, trackScrollDepth]);

  // Reset quando muda de página
  useEffect(() => {
    trackedThresholds.current.clear();
  }, []);

  return null;
};

export default ScrollTracker;
