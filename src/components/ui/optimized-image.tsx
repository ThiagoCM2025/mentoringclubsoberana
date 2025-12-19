import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  onLoad?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  placeholder = "blur",
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        wrapperClassName
      )}
    >
      {/* Placeholder blur effect */}
      {placeholder === "blur" && !isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          className={cn(
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
};

// Hook for detecting if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
};

// Hook for detecting mobile devices
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Animation variants optimized for mobile
export const mobileOptimizedVariants = {
  // Simpler fade for mobile (less transform = better performance)
  fadeIn: {
    mobile: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      }
    },
    desktop: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      }
    }
  },
  
  // Stagger children with mobile optimization
  staggerContainer: {
    mobile: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
      }
    },
    desktop: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
      }
    }
  },

  // Scale animation (reduced on mobile)
  scaleIn: {
    mobile: {
      hidden: { opacity: 0, scale: 0.98 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.3 }
      }
    },
    desktop: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { type: "spring", duration: 0.5 }
      }
    }
  },

  // Slide from side (simplified for mobile)
  slideIn: {
    mobile: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.4 }
      }
    },
    desktop: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      }
    }
  }
};

// Helper to get the right variant based on device
export const getResponsiveVariant = (
  variants: { mobile: object; desktop: object },
  isMobile: boolean
) => {
  return isMobile ? variants.mobile : variants.desktop;
};
