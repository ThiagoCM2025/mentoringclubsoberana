import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Pattern assets
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import patternCirclesMarsala from "@/assets/brand/pattern-circles-marsala.png";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import patternCirclesBlack from "@/assets/brand/pattern-circles-black.png";
import patternGeometricGold from "@/assets/brand/pattern-geometric-gold.png";

// Isotipo assets
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import isotipoMarsala from "@/assets/brand/isotipo-marsala.png";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white.png";
import isotipoSMarsala from "@/assets/brand/isotipo-s-marsala.png";

type PatternType = "circles-gold" | "circles-marsala" | "circles-white" | "circles-black" | "geometric";
type IsotipoColor = "gold" | "white" | "marsala";
type VariantType = "light" | "dark" | "marsala" | "gradient";
type GlowColor = "gold" | "marsala";

interface PremiumBackgroundProps {
  children: React.ReactNode;
  variant?: VariantType;
  pattern?: PatternType;
  patternOpacity?: number;
  showIsotipos?: boolean;
  isotipoVariant?: IsotipoColor;
  showVignette?: boolean;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
  showGlow?: boolean;
  glowColor?: GlowColor;
  className?: string;
  sectionClassName?: string;
  isInView?: boolean;
}

const patternMap: Record<PatternType, string> = {
  "circles-gold": patternCirclesGold,
  "circles-marsala": patternCirclesMarsala,
  "circles-white": patternCirclesWhite,
  "circles-black": patternCirclesBlack,
  "geometric": patternGeometricGold,
};

const isotipoMap: Record<IsotipoColor, string> = {
  gold: isotipoGold,
  white: isotipoWhite,
  marsala: isotipoMarsala,
};

const isotipoSMap: Record<IsotipoColor, string> = {
  gold: isotipoSGold,
  white: isotipoSWhite,
  marsala: isotipoSMarsala,
};

const variantStyles: Record<VariantType, string> = {
  light: "bg-muted/30",
  dark: "bg-brand-black",
  marsala: "bg-primary",
  gradient: "bg-gradient-to-br from-primary via-primary to-foreground",
};

export const PremiumBackground = ({
  children,
  variant = "light",
  pattern,
  patternOpacity = 0.06,
  showIsotipos = false,
  isotipoVariant = "gold",
  showVignette = false,
  showTopBorder = false,
  showBottomBorder = false,
  showGlow = false,
  glowColor = "gold",
  className,
  sectionClassName,
  isInView = true,
}: PremiumBackgroundProps) => {
  const patternSrc = pattern ? patternMap[pattern] : null;
  const isotipoSrc = isotipoMap[isotipoVariant];

  return (
    <div className={cn("relative overflow-hidden", variantStyles[variant], sectionClassName)}>
      {/* Top border gradient */}
      {showTopBorder && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent z-10" />
      )}

      {/* Pattern overlay */}
      {patternSrc && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${patternSrc})`,
            backgroundSize: "350px 350px",
            backgroundRepeat: "repeat",
            opacity: patternOpacity,
          }}
        />
      )}

      {/* Radial vignette for depth */}
      {showVignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: variant === "dark" || variant === "marsala" || variant === "gradient"
              ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)"
              : "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)",
          }}
        />
      )}

      {/* Floating Isotipos */}
      {showIsotipos && (
        <>
          <motion.img
            src={isotipoSrc}
            alt=""
            className="absolute top-16 right-12 w-16 md:w-24 h-auto animate-float-slow pointer-events-none hidden lg:block"
            style={{ opacity: 0 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: variant === "light" ? 0.12 : 0.15, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
          <motion.img
            src={isotipoSrc}
            alt=""
            className="absolute bottom-20 left-12 w-14 md:w-20 h-auto animate-float-slow pointer-events-none hidden lg:block"
            style={{ animationDelay: "1.5s", opacity: 0 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: variant === "light" ? 0.08 : 0.12, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.6 }}
          />
        </>
      )}

      {/* Central glow */}
      {showGlow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 0.15, scale: 1 } : {}}
          transition={{ duration: 1.5 }}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]",
            glowColor === "gold" ? "bg-secondary" : "bg-primary"
          )}
        />
      )}

      {/* Bottom border gradient */}
      {showBottomBorder && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent z-10" />
      )}

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

// Export isotipo assets for direct use when needed
export { isotipoSGold, isotipoSWhite, isotipoSMarsala };
