import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Crown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import isotipoGold from "@/assets/brand/isotipo-s-gold.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const ExperienceExitPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  
  const isMobile = useIsMobile();
  const lastScrollY = useRef(0);
  const scrollUpDistance = useRef(0);
  const isActiveRef = useRef(false);

  // Desktop: Mouse leave detection
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        const sessionShown = sessionStorage.getItem("experience_exit_shown");
        if (!sessionShown) {
          setTimeout(() => {
            setShowPopup(true);
            setHasShown(true);
            sessionStorage.setItem("experience_exit_shown", "true");
          }, 300);
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown, isMobile]);

  // Mobile: Scroll-up detection (indicates intention to leave)
  useEffect(() => {
    if (!isMobile) return;
    
    const sessionShown = sessionStorage.getItem("experience_exit_shown");
    if (sessionShown || hasShown) return;

    const handleScroll = () => {
      if (!isActiveRef.current || hasShown) return;
      
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (currentScrollY / pageHeight) * 100;
      
      // Detect scroll up
      if (currentScrollY < lastScrollY.current) {
        scrollUpDistance.current += lastScrollY.current - currentScrollY;
        
        // Trigger after scrolling 30%+ of page AND scrolling up 100px+
        if (scrollUpDistance.current > 100 && scrollPercentage > 30) {
          setShowPopup(true);
          setHasShown(true);
          sessionStorage.setItem("experience_exit_shown", "true");
          window.removeEventListener("scroll", handleScroll);
        }
      } else {
        scrollUpDistance.current = 0;
      }
      
      lastScrollY.current = currentScrollY;
    };

    // Activate after 8 second delay to avoid premature triggers
    const timer = setTimeout(() => {
      lastScrollY.current = window.scrollY;
      isActiveRef.current = true;
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 8000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasShown, isMobile]);

  useEffect(() => {
    if (showPopup && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPopup, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => setShowPopup(false);

  const kiwifyLink = "https://pay.kiwify.com.br/MnhYIKz";

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl"
          >
            {/* Golden border with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold via-gold-light to-gold rounded-2xl p-[2px]">
              <div className="absolute inset-[2px] bg-gradient-to-br from-cream to-white rounded-2xl" />
            </div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative isotipo */}
              <motion.img
                src={isotipoGold}
                alt=""
                className="absolute -top-4 -left-4 w-16 h-16 opacity-20"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, type: "tween" }}
              />

              {/* Gift icon */}
              <motion.div
                variants={itemVariants}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-6 shadow-lg"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h3
                variants={itemVariants}
                className="text-2xl md:text-3xl font-playfair font-bold text-primary mb-3"
              >
                Espera! Um presente exclusivo para você...
              </motion.h3>

              {/* Bonus description */}
              <motion.div
                variants={itemVariants}
                className="bg-cream/50 border border-gold/30 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-gold" />
                  <span className="text-sm font-semibold text-gold uppercase tracking-wider">
                    Bônus Especial
                  </span>
                </div>
                <p className="text-lg font-semibold text-primary mb-1">
                  Checklist Exclusivo: "Organize sua Advocacia em 7 Dias"
                </p>
                <p className="text-sm text-foreground/70">
                  Material digital que vai te ajudar a se preparar para a imersão
                </p>
              </motion.div>

              {/* Countdown timer */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-2 mb-6 text-primary"
              >
                <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-sm">
                  Esta oferta expira em{" "}
                  <span className="font-bold text-red-500">
                    {formatTime(countdown)}
                  </span>
                </span>
              </motion.div>

              {/* CTA Button */}
              <motion.div variants={itemVariants}>
                <a href={kiwifyLink} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Gift className="w-5 h-5" />
                      QUERO MEU BÔNUS + VAGA
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Button>
                </a>
              </motion.div>

              {/* Trust text */}
              <motion.p
                variants={itemVariants}
                className="mt-4 text-xs text-foreground/50"
              >
                Pagamento 100% seguro • Garantia de 7 dias
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
