import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const SplashScreen = ({ onComplete, duration = 1500 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {/* Radial gradient glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,30%,51%,0.15)_0%,_transparent_70%)]"
            />
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Isotipo with glow animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2
              }}
              className="relative"
            >
              {/* Isotipo image */}
              <motion.img
                src={isotipoGold}
                alt="Soberana"
                className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10"
                style={{
                  filter: "drop-shadow(0 0 30px hsla(38, 30%, 51%, 0.5))"
                }}
              />
            </motion.div>

            {/* Brand text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-8 text-center"
            >
              <p className="text-cream/70 text-xs tracking-[0.2em] mb-2">
                MENTORING CLUB
              </p>
              <h1 className="text-2xl md:text-3xl font-serif tracking-[0.3em] text-secondary">
                SOBERANA
              </h1>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.8, duration: duration / 1000 - 0.8 }}
              className="mt-10 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent max-w-[200px]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
