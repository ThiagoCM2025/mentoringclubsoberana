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

function SkeletonWelcomeBanner({ className }: { className?: string }) {
  return (
    <div className={cn("grid md:grid-cols-3 gap-6", className)}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="aspect-[4/3] relative">
            <PremiumSkeleton className="absolute inset-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SkeletonChallenges({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <PremiumSkeleton className="w-5 h-5 rounded" />
        <PremiumSkeleton variant="text" className="w-32 h-5" />
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10"
          >
            <PremiumSkeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <PremiumSkeleton variant="text" className="w-3/4" />
              <PremiumSkeleton variant="text" className="w-1/2 h-3" />
            </div>
            <PremiumSkeleton className="w-16 h-6 rounded" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SkeletonCalendar({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PremiumSkeleton className="w-5 h-5 rounded" />
          <PremiumSkeleton variant="text" className="w-32 h-5" />
        </div>
        <PremiumSkeleton variant="text" className="w-20 h-4" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[...Array(3)].map((_, i) => (
          <PremiumSkeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <PremiumSkeleton key={i} className="aspect-square rounded" />
        ))}
      </div>
    </div>
  );
}

function SkeletonLeaderboard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <PremiumSkeleton className="w-5 h-5 rounded" />
        <PremiumSkeleton variant="text" className="w-24 h-5" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10"
          >
            <PremiumSkeleton className="w-8 h-8 rounded-full" />
            <PremiumSkeleton variant="avatar" className="w-8 h-8" />
            <div className="flex-1 space-y-2">
              <PremiumSkeleton variant="text" className="w-24" />
              <PremiumSkeleton variant="text" className="w-16 h-3" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SkeletonLearningPaths({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <PremiumSkeleton className="w-5 h-5 rounded" />
        <PremiumSkeleton variant="text" className="w-40 h-6" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <PremiumSkeleton className="h-32 w-full rounded-lg mb-3" />
            <PremiumSkeleton variant="text" className="w-3/4 mb-2" />
            <PremiumSkeleton variant="text" className="w-full h-3 mb-2" />
            <PremiumSkeleton variant="text" className="w-1/2 h-3" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SkeletonQuickActions({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <PremiumSkeleton className="w-12 h-12 rounded-full mb-3" />
          <PremiumSkeleton variant="text" className="w-20 mb-1" />
          <PremiumSkeleton variant="text" className="w-28 h-3" />
        </motion.div>
      ))}
    </div>
  );
}

function SkeletonDiagnosticBanner({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card rounded-xl border border-border p-5 mb-6", className)}
    >
      <div className="flex items-start gap-4">
        <PremiumSkeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-3">
          <PremiumSkeleton variant="text" className="w-3/4 h-5" />
          <PremiumSkeleton variant="text" className="w-full h-4" />
          <div className="flex items-center gap-3">
            <PremiumSkeleton className="h-2 flex-1 max-w-xs rounded-full" />
            <PremiumSkeleton variant="text" className="w-10" />
          </div>
          <PremiumSkeleton variant="button" className="w-40" />
        </div>
      </div>
    </motion.div>
  );
}

export { 
  PremiumSkeleton, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonStats, 
  SkeletonCourseGrid,
  SkeletonHero,
  SkeletonWelcomeBanner,
  SkeletonChallenges,
  SkeletonCalendar,
  SkeletonLeaderboard,
  SkeletonLearningPaths,
  SkeletonQuickActions,
  SkeletonDiagnosticBanner
};
