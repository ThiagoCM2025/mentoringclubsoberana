import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// Pattern imports
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import patternCirclesMarsala from "@/assets/brand/pattern-circles-marsala.png";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import patternGeometricGold from "@/assets/brand/pattern-geometric-gold.png";

// Isotipo imports
import isotipoGold from "@/assets/brand/isotipo-s-gold.png";
import isotipoWhite from "@/assets/brand/isotipo-s-white.png";
import isotipoMarsala from "@/assets/brand/isotipo-s-marsala.png";

type PatternType = "circles-gold" | "circles-marsala" | "circles-white" | "geometric";
type IsotipoColor = "gold" | "white" | "marsala";
type GlowColor = "gold" | "marsala";
type BackgroundVariant = "light" | "dark" | "marsala" | "gradient";

interface PremiumBackgroundProps {
  children: React.ReactNode;
  variant?: BackgroundVariant;
  pattern?: PatternType;
  patternOpacity?: number;
  patternSize?: string;
  showIsotipos?: boolean;
  isotipoColor?: IsotipoColor;
  showVignette?: boolean;
  vignetteIntensity?: number;
  showGlow?: boolean;
  glowColor?: GlowColor;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
  className?: string;
  sectionPadding?: boolean;
}

const patternMap: Record<PatternType, string> = {
  "circles-gold": patternCirclesGold,
  "circles-marsala": patternCirclesMarsala,
  "circles-white": patternCirclesWhite,
  "geometric": patternGeometricGold,
};

const isotipoMap: Record<IsotipoColor, string> = {
  gold: isotipoGold,
  white: isotipoWhite,
  marsala: isotipoMarsala,
};

const variantClasses: Record<BackgroundVariant, string> = {
  light: "bg-muted/30",
  dark: "bg-foreground",
  marsala: "bg-primary",
  gradient: "bg-gradient-to-b from-foreground via-foreground to-foreground/95",
};

const glowColorMap: Record<GlowColor, string> = {
  gold: "bg-secondary/8",
  marsala: "bg-primary/10",
};

export const PremiumBackground = ({
  children,
  variant = "light",
  pattern,
  patternOpacity = 0.06,
  patternSize = "350px",
  showIsotipos = false,
  isotipoColor = "gold",
  showVignette = false,
  vignetteIntensity = 0.15,
  showGlow = false,
  glowColor = "gold",
  showTopBorder = false,
  showBottomBorder = false,
  className,
  sectionPadding = true,
}: PremiumBackgroundProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const patternSrc = pattern ? patternMap[pattern] : null;
  const isotipoSrc = isotipoMap[isotipoColor];

  return (
    <section
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        variantClasses[variant],
        sectionPadding && "section-padding",
        className
      )}
    >
      {/* Golden top border gradient */}
      {showTopBorder && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      )}

      {/* Pattern overlay */}
      {patternSrc && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${patternSrc})`,
            backgroundSize: `${patternSize} ${patternSize}`,
            backgroundRepeat: "repeat",
            opacity: patternOpacity,
          }}
        />
      )}

      {/* Floating Isotipos */}
      {showIsotipos && (
        <>
          <motion.img
            src={isotipoSrc}
            alt=""
            className="absolute top-20 right-16 w-14 md:w-20 h-auto animate-float-slow pointer-events-none"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.12 } : {}}
            transition={{ duration: 1 }}
          />
          <motion.img
            src={isotipoSrc}
            alt=""
            className="absolute bottom-24 left-12 w-12 md:w-16 h-auto animate-float-slow pointer-events-none"
            style={{ animationDelay: "1.5s" }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.08 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </>
      )}

      {/* Radial vignette */}
      {showVignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
          }}
        />
      )}

      {/* Central glow */}
      {showGlow && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none",
            glowColorMap[glowColor]
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Golden bottom border gradient */}
      {showBottomBorder && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      )}
    </section>
  );
};
