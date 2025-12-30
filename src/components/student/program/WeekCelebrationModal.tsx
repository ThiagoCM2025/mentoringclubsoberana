import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Star, ArrowRight, Award, Crown } from "lucide-react";
import { useEffect, useState } from "react";
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

const getPhaseInfo = (week: number): { phase: string; color: string; bgColor: string } => {
  if (week <= 4) {
    return { 
      phase: "Fundação", 
      color: "from-amber-500 to-yellow-400",
      bgColor: "bg-amber-500/20"
    };
  } else if (week <= 8) {
    return { 
      phase: "Conversão", 
      color: "from-emerald-500 to-teal-400",
      bgColor: "bg-emerald-500/20"
    };
  } else {
    return { 
      phase: "Escala", 
      color: "from-violet-500 to-purple-400",
      bgColor: "bg-violet-500/20"
    };
  }
};

const getWeekTitle = (week: number): string => {
  const titles: Record<number, string> = {
    1: "Autoridade em Construção",
    2: "Estrategista Digital",
    3: "Mestre do Conteúdo",
    4: "Arquiteta de Funil",
    5: "Especialista em Leads",
    6: "Comunicadora Magnética",
    7: "Negociadora de Elite",
    8: "Fechadora de Contratos",
    9: "Gestora de Crescimento",
    10: "Líder de Equipe",
    11: "Empreendedora Digital",
    12: "Advogada Soberana"
  };
  return titles[week] || "Advogada em Transformação";
};

// Floating particle component
const FloatingParticle = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, x }}
    animate={{ 
      opacity: [0, 1, 0],
      y: [-20, -150],
      x: [x, x + (Math.random() - 0.5) * 50]
    }}
    transition={{ 
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
    className="absolute bottom-0 pointer-events-none"
    style={{ left: `${x}%` }}
  >
    <Sparkles 
      className="text-secondary/40" 
      style={{ width: size, height: size }}
    />
  </motion.div>
);

export const WeekCelebrationModal = ({
  isOpen,
  onClose,
  weekNumber,
  missionTitle,
  xpEarned,
  emoji,
}: WeekCelebrationModalProps) => {
  const { fireGoldConfetti, fireCelebration } = useConfetti();
  const phaseInfo = getPhaseInfo(weekNumber);
  const weekTitle = getWeekTitle(weekNumber);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire multiple confetti bursts
      setTimeout(() => fireGoldConfetti(), 200);
      setTimeout(() => fireCelebration(), 600);
      setTimeout(() => fireGoldConfetti(), 1000);
      
      // Show title with delay
      setTimeout(() => setShowTitle(true), 1200);
    } else {
      setShowTitle(false);
    }
  }, [isOpen, fireGoldConfetti, fireCelebration]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg border-secondary/30 bg-gradient-to-br from-background via-background to-secondary/5 overflow-hidden">
            {/* Floating particles background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <FloatingParticle 
                  key={i} 
                  delay={i * 0.3} 
                  x={10 + i * 12} 
                  size={12 + Math.random() * 8}
                />
              ))}
            </div>

            {/* Decorative glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0.1, 0.2, 0.1], scale: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-60 h-60 bg-secondary rounded-full blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0.1, 0.15, 0.1], scale: 1 }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center py-6">
              {/* Trophy icon with enhanced glow */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
                className="relative mb-5"
              >
                <motion.div 
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-secondary/40 rounded-full blur-2xl"
                />
                <div className="relative w-24 h-24 bg-gradient-to-br from-secondary via-secondary to-secondary/70 rounded-full flex items-center justify-center shadow-2xl shadow-secondary/40">
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-5xl"
                  >
                    {emoji}
                  </motion.span>
                </div>
                
                {/* Orbiting sparkles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 left-1/2" />
                  <Star className="w-4 h-4 text-yellow-300 absolute top-1/2 -right-2 fill-yellow-300" />
                  <Sparkles className="w-4 h-4 text-yellow-400 absolute -bottom-1 left-1/4" />
                </motion.div>
              </motion.div>

              {/* Week badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r ${phaseInfo.color} text-white text-sm font-bold mb-4 shadow-lg`}
              >
                <Trophy className="w-4 h-4" />
                Semana {weekNumber} • {phaseInfo.phase}
              </motion.div>

              {/* Main title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-foreground mb-2"
              >
                Missão Completa! 🎉
              </motion.h2>

              {/* Mission title */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-5"
              >
                Você completou:
                <br />
                <span className="font-semibold text-foreground text-lg">{missionTitle}</span>
              </motion.p>

              {/* XP earned with enhanced styling */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary/20 via-secondary/10 to-secondary/20 border border-secondary/40 rounded-2xl mb-5 shadow-lg shadow-secondary/20"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Star className="w-8 h-8 text-secondary fill-secondary" />
                </motion.div>
                <span className="text-3xl font-bold text-secondary">+{xpEarned} XP</span>
              </motion.div>

              {/* New Title Badge - appears with delay */}
              <AnimatePresence>
                {showTitle && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className={`flex items-center gap-2 px-5 py-3 ${phaseInfo.bgColor} border border-secondary/30 rounded-xl mb-4`}
                  >
                    <Crown className="w-5 h-5 text-secondary" />
                    <div className="text-left">
                      <p className="text-xs text-cream/60 uppercase tracking-wider">Novo Título</p>
                      <p className="font-bold text-cream">{weekTitle}</p>
                    </div>
                    <Award className="w-5 h-5 text-secondary" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Motivational message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-cream/70 italic mb-6 px-4"
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
                  className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-secondary-foreground font-bold py-6 text-lg shadow-lg shadow-secondary/30"
                >
                  Continuar Jornada
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
