import { cn } from "@/lib/utils";

interface SoberanaLogoMarkProps {
  variant?: "light" | "dark" | "scrolled";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FourPointStar = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
  </svg>
);

export const SoberanaLogoMark = ({ 
  variant = "dark", 
  size = "md",
  className 
}: SoberanaLogoMarkProps) => {
  const sizeClasses = {
    sm: {
      container: "gap-0.5",
      mentoring: "text-[8px] tracking-[0.25em]",
      soberana: "text-base",
      star: "w-1.5 h-1.5",
      oLetter: "w-[0.65em]",
    },
    md: {
      container: "gap-0.5",
      mentoring: "text-[10px] tracking-[0.3em]",
      soberana: "text-xl",
      star: "w-2 h-2",
      oLetter: "w-[0.7em]",
    },
    lg: {
      container: "gap-1",
      mentoring: "text-xs tracking-[0.35em]",
      soberana: "text-2xl",
      star: "w-2.5 h-2.5",
      oLetter: "w-[0.75em]",
    },
  };

  const colorClasses = {
    light: {
      mentoring: "text-cream/70",
      soberana: "text-cream",
      star: "text-secondary",
    },
    dark: {
      mentoring: "text-foreground/60",
      soberana: "text-foreground",
      star: "text-secondary",
    },
    scrolled: {
      mentoring: "text-foreground/70",
      soberana: "text-foreground",
      star: "text-secondary",
    },
  };

  const sizes = sizeClasses[size];
  const colors = colorClasses[variant];

  return (
    <div className={cn("flex flex-col items-center leading-none group", sizes.container, className)}>
      <span
        className={cn("font-light uppercase", sizes.mentoring, colors.mentoring)}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        Mentoring Club
      </span>
      <span
        className={cn("font-semibold tracking-wide flex items-center", sizes.soberana, colors.soberana)}
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        S
        <span className={cn("relative inline-flex items-center justify-center", sizes.oLetter)}>
          <span className="opacity-90">O</span>
          <span className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            "group-hover:drop-shadow-[0_0_6px_rgba(166,144,97,0.8)]",
            colors.star
          )}>
            <FourPointStar className={cn(sizes.star, "transition-transform duration-300 group-hover:scale-110")} />
          </span>
        </span>
        BERANA
      </span>
    </div>
  );
};
