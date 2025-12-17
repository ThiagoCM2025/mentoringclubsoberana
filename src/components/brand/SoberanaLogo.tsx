import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";

interface SoberanaLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: {
    icon: "w-8 h-8",
    labelText: "text-[7px]",
    brandText: "text-xs",
    gap: "gap-2"
  },
  md: {
    icon: "w-10 h-10",
    labelText: "text-[9px]",
    brandText: "text-sm",
    gap: "gap-3"
  },
  lg: {
    icon: "w-12 h-12",
    labelText: "text-[10px]",
    brandText: "text-base",
    gap: "gap-3"
  }
};

export const SoberanaLogo = ({ 
  size = "md", 
  showText = true,
  className,
  animated = true
}: SoberanaLogoProps) => {
  const sizeConfig = sizes[size];

  const TextContent = () => (
    <div className="flex flex-col leading-tight">
      <span className={cn(
        "text-cream/70 tracking-[0.15em] uppercase",
        sizeConfig.labelText
      )}>
        Mentoring
      </span>
      <span className={cn(
        "text-cream/70 tracking-[0.15em] uppercase -mt-0.5",
        sizeConfig.labelText
      )}>
        Club
      </span>
      <span className={cn(
        "font-serif font-bold text-secondary tracking-wider mt-0.5",
        sizeConfig.brandText
      )}>
        SOBERANA
      </span>
    </div>
  );

  return (
    <div className={cn("flex items-center", sizeConfig.gap, className)}>
      <img 
        src={isotipoGold} 
        alt="Soberana" 
        className={cn(
          sizeConfig.icon,
          "object-contain drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]"
        )}
      />
      {showText && (
        animated ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TextContent />
            </motion.div>
          </AnimatePresence>
        ) : (
          <TextContent />
        )
      )}
    </div>
  );
};

export default SoberanaLogo;
