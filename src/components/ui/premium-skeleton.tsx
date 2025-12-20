import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PremiumSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "avatar" | "text" | "button";
}

function PremiumSkeleton({ className, variant = "default", ...props }: PremiumSkeletonProps) {
  const baseClasses = "relative overflow-hidden bg-muted rounded-md";
  
  const variantClasses = {
    default: "",
    card: "rounded-xl",
    avatar: "rounded-full",
    text: "h-4 rounded",
    button: "h-10 rounded-lg",
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Preset skeleton components
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <PremiumSkeleton variant="card" className="h-48 w-full" />
      <div className="space-y-2 p-4">
        <PremiumSkeleton variant="text" className="h-4 w-3/4" />
        <PremiumSkeleton variant="text" className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <PremiumSkeleton variant="avatar" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <PremiumSkeleton variant="text" className="w-3/4" />
            <PremiumSkeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border">
          <PremiumSkeleton variant="text" className="w-1/2 mb-2" />
          <PremiumSkeleton className="h-8 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCourseGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid md:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <PremiumSkeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <PremiumSkeleton variant="text" className="w-3/4 h-5" />
            <PremiumSkeleton variant="text" className="w-full h-4" />
            <PremiumSkeleton variant="text" className="w-1/2 h-4" />
            <div className="flex justify-between items-center pt-2">
              <PremiumSkeleton className="w-20 h-2 rounded-full" />
              <PremiumSkeleton variant="button" className="w-24" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SkeletonHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-[420px] md:h-[480px] w-full overflow-hidden", className)}>
      <PremiumSkeleton className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
      <div className="relative z-10 h-full flex items-center p-8">
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-4">
            <PremiumSkeleton variant="avatar" className="w-20 h-20" />
            <PremiumSkeleton className="h-12 w-48" />
          </div>
          <PremiumSkeleton variant="text" className="h-8 w-3/4" />
          <PremiumSkeleton variant="text" className="h-6 w-full" />
          <PremiumSkeleton variant="text" className="h-6 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export { 
  PremiumSkeleton, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonStats, 
  SkeletonCourseGrid,
  SkeletonHero
};
