import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionSkeletonProps {
  variant?: "testimonials" | "faq";
  className?: string;
}

export const SectionSkeleton = ({ variant = "testimonials", className }: SectionSkeletonProps) => {
  if (variant === "faq") {
    return (
      <div className={`py-16 md:py-20 bg-cream ${className}`}>
        <div className="container-soberana">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-32 mx-auto mb-4 bg-secondary/10" />
            <Skeleton className="h-10 w-80 mx-auto mb-4 bg-secondary/10" />
            <Skeleton className="h-6 w-96 max-w-full mx-auto bg-secondary/10" />
          </div>
          
          {/* FAQ items skeleton */}
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-3/4 bg-secondary/10" />
                  <Skeleton className="h-6 w-6 rounded-full bg-secondary/10" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Testimonials variant
  return (
    <div className={`py-16 md:py-20 bg-cream ${className}`}>
      <div className="container-soberana">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-4 w-24 mx-auto mb-4 bg-secondary/10" />
          <Skeleton className="h-10 w-64 mx-auto mb-4 bg-secondary/10" />
          <Skeleton className="h-6 w-80 max-w-full mx-auto bg-secondary/10" />
        </div>
        
        {/* Testimonial card skeleton - single centered */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background rounded-xl p-8 shadow-sm"
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full bg-secondary/10" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 bg-secondary/10" />
                <Skeleton className="h-4 w-28 bg-secondary/10" />
              </div>
            </div>
            {/* Content */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-secondary/10" />
              <Skeleton className="h-4 w-full bg-secondary/10" />
              <Skeleton className="h-4 w-4/5 bg-secondary/10" />
              <Skeleton className="h-4 w-3/4 bg-secondary/10" />
            </div>
            {/* Stars */}
            <div className="flex gap-1 mt-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Skeleton key={star} className="h-5 w-5 rounded bg-secondary/10" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
