import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Star, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useConfetti } from "@/hooks/useConfetti";

interface WeekCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  missionTitle: string;
  xpEarned: number;
  emoji: string;
}

const getMotivationalMessage = (week: number): string => {
  if (week <= 3) {
    return "Você está construindo a fundação do seu sucesso!";
  } else if (week <= 6) {
    return "A transformação está acontecendo!";
  } else if (week <= 9) {
    return "Você está dominando a arte da conversão!";
  } else {
    return "Você está quase lá! A escala começa agora!";
  }
};

const getPhaseInfo = (week: number): { phase: string; color: string } => {
  if (week <= 4) {
    return { phase: "Fundação", color: "from-amber-500 to-yellow-400" };
  } else if (week <= 8) {
    return { phase: "Conversão", color: "from-emerald-500 to-teal-400" };
  } else {
    return { phase: "Escala", color: "from-violet-500 to-purple-400" };
  }
};

export const WeekCelebrationModal = ({
  isOpen,
  onClose,
  weekNumber,
  missionTitle,
  xpEarned,
  emoji,
}: WeekCelebrationModalProps) => {
  const { fireGoldConfetti } = useConfetti();
  const phaseInfo = getPhaseInfo(weekNumber);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti when modal opens
      setTimeout(() => fireGoldConfetti(), 200);
    }
  }, [isOpen, fireGoldConfetti]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md border-secondary/30 bg-gradient-to-br from-background via-background to-secondary/5 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.1, scale: 1 }}
                className="absolute -top-20 -right-20 w-40 h-40 bg-secondary rounded-full blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center py-4">
              {/* Trophy icon with glow */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center shadow-lg shadow-secondary/30">
                  <span className="text-4xl">{emoji}</span>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </motion.div>

              {/* Week badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${phaseInfo.color} text-white text-sm font-medium mb-3`}
              >
                <Trophy className="w-4 h-4" />
                Semana {weekNumber} • {phaseInfo.phase}
              </motion.div>

              {/* Main title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Parabéns! 🎉
              </motion.h2>

              {/* Mission title */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-4"
              >
                Você completou a missão:
                <br />
                <span className="font-semibold text-foreground">{missionTitle}</span>
              </motion.p>

              {/* XP earned */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center gap-2 px-6 py-3 bg-secondary/10 border border-secondary/30 rounded-xl mb-4"
              >
                <Star className="w-6 h-6 text-secondary fill-secondary" />
                <span className="text-2xl font-bold text-secondary">+{xpEarned} XP</span>
              </motion.div>

              {/* Motivational message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-cream/70 italic mb-6"
              >
                "{getMotivationalMessage(weekNumber)}"
              </motion.p>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Continuar Jornada
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
