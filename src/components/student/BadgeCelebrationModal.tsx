import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/useConfetti";
import {
  Trophy,
  Star,
  Flame,
  Zap,
  Crown,
  Award,
  BookOpen,
  PlayCircle,
  Sparkles,
  X
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
}

interface BadgeCelebrationModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  "play-circle": PlayCircle,
  "book-open": BookOpen,
  "flame": Flame,
  "trophy": Trophy,
  "crown": Crown,
  "award": Award,
  "star": Star,
  "zap": Zap,
  "sparkles": Sparkles
};

export const BadgeCelebrationModal = ({ badge, isOpen, onClose }: BadgeCelebrationModalProps) => {
  const { fireCelebration, fireGoldConfetti } = useConfetti();

  useEffect(() => {
    if (isOpen && badge) {
      // Fire confetti when modal opens
      setTimeout(() => {
        fireCelebration();
        setTimeout(() => fireGoldConfetti(), 500);
      }, 300);
    }
  }, [isOpen, badge, fireCelebration, fireGoldConfetti]);

  if (!badge) return null;

  const IconComponent = iconMap[badge.icon] || Award;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-secondary/50 max-w-md p-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-cream/50 hover:text-cream hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="relative">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1.5 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"
            />
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, x: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: -100,
                  x: Math.sin(i) * 50
                }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute bottom-0 left-1/2 w-2 h-2 bg-secondary/60 rounded-full"
                style={{ left: `${20 + (i * 5)}%` }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="text-secondary/80 text-sm uppercase tracking-widest font-medium">
                Nova Conquista!
              </span>
            </motion.div>

            {/* Badge Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.3 
              }}
              className="relative mx-auto mb-6"
            >
              <div className="w-32 h-32 mx-auto relative">
                {/* Glow ring */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                  className="absolute inset-0 bg-secondary/20 rounded-full blur-xl"
                />
                
                {/* Main badge circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/80 to-amber-600 rounded-full shadow-[0_0_60px_rgba(166,144,97,0.5)] flex items-center justify-center">
                  <IconComponent className="w-16 h-16 text-black" />
                </div>

                {/* Sparkle effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      rotate: [0, 180]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.5 + i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      type: "tween"
                    }}
                    className="absolute"
                    style={{
                      top: `${10 + Math.random() * 80}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Badge Name */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-serif font-bold text-cream mb-2"
            >
              {badge.name}
            </motion.h2>

            {/* Badge Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-cream/70 mb-6"
            >
              {badge.description}
            </motion.p>

            {/* XP Reward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 rounded-full px-6 py-3 mb-6"
            >
              <Star className="w-5 h-5 text-secondary" />
              <span className="text-xl font-bold text-secondary">
                +{badge.xp_reward} XP
              </span>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={onClose}
                className="bg-secondary hover:bg-secondary/90 text-black font-semibold px-8 py-3"
              >
                Continuar Evoluindo
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
