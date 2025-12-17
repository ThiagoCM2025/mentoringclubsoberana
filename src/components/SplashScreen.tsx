import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const SplashScreen = ({ onComplete, duration = 2500 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {/* Radial gradient glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,30%,51%,0.15)_0%,_transparent_70%)]"
            />
            
            {/* Floating golden particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-1 rounded-full bg-secondary"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
              />
            ))}
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
              {/* Glow rings */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 -m-8 rounded-full border-2 border-secondary/30"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 -m-12 rounded-full border border-secondary/20"
              />

              {/* Isotipo image */}
              <motion.img
                src={isotipoGold}
                alt="Soberana"
                className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10"
                style={{
                  filter: "drop-shadow(0 0 30px hsla(38, 30%, 51%, 0.5))"
                }}
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px hsla(38, 30%, 51%, 0.4))",
                    "drop-shadow(0 0 40px hsla(38, 30%, 51%, 0.7))",
                    "drop-shadow(0 0 20px hsla(38, 30%, 51%, 0.4))"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Brand text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <motion.h1 
                className="text-2xl md:text-3xl font-serif tracking-[0.3em] text-secondary"
                animate={{
                  textShadow: [
                    "0 0 10px hsla(38, 30%, 51%, 0.3)",
                    "0 0 20px hsla(38, 30%, 51%, 0.5)",
                    "0 0 10px hsla(38, 30%, 51%, 0.3)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                SOBERANA
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-cream/60 text-xs tracking-[0.2em] mt-2"
              >
                MENTORING CLUB
              </motion.p>
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
