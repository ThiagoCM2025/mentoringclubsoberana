import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface CourseSplashScreenProps {
  onComplete?: () => void;
  courseTitle?: string;
  progress?: number; // 0-100
  autoProgress?: boolean;
}

export const CourseSplashScreen = ({ 
  onComplete, 
  courseTitle = "Carregando curso...",
  progress: externalProgress,
  autoProgress = true
}: CourseSplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [internalProgress, setInternalProgress] = useState(0);
  
  const progress = externalProgress ?? internalProgress;

  useEffect(() => {
    if (!autoProgress) return;
    
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onComplete?.(), 400);
          }, 300);
          return 100;
        }
        // Simulate realistic loading with variable speed
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [autoProgress, onComplete]);

  useEffect(() => {
    if (externalProgress === 100) {
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onComplete?.(), 400);
      }, 300);
    }
  }, [externalProgress, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,30%,51%,0.15)_0%,_transparent_60%)]"
            />
            
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  y: -100
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute w-1 h-1 rounded-full bg-secondary"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: `${10 + Math.random() * 20}%`,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center px-6">
            {/* Isotipo with pulsing glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              {/* Pulsing rings based on progress */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2 + (progress / 200), 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween"
                }}
                className="absolute inset-0 -m-6 rounded-full border border-secondary/40"
              />

              <motion.img
                src={isotipoGold}
                alt="Soberana"
                className="w-20 h-20 object-contain relative z-10"
                animate={{
                  filter: [
                    "drop-shadow(0 0 15px hsla(38, 30%, 51%, 0.4))",
                    `drop-shadow(0 0 ${25 + progress / 4}px hsla(38, 30%, 51%, ${0.5 + progress / 200}))`,
                    "drop-shadow(0 0 15px hsla(38, 30%, 51%, 0.4))"
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Brand text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center mb-6"
            >
              <p className="text-secondary/70 text-[10px] tracking-[0.3em] uppercase mb-1">
                Mentoring Club
              </p>
              <h1 className="text-secondary text-xl font-serif tracking-widest">
                SOBERANA
              </h1>
            </motion.div>

            {/* Course title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-cream text-lg md:text-xl font-medium text-center mb-6 max-w-md"
            >
              {courseTitle}
            </motion.h2>

            {/* Progress bar container */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full max-w-xs"
            >
              {/* Progress bar background */}
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-secondary via-secondary-light to-secondary rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress percentage */}
              <motion.p
                className="text-cream/60 text-xs text-center mt-3 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>

            {/* Loading steps indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2 mt-6"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    progress > (i + 1) * 30 ? "bg-secondary" : "bg-zinc-700"
                  }`}
                  animate={progress > (i + 1) * 30 ? {
                    scale: [1, 1.3, 1],
                  } : {}}
                  transition={{ duration: 0.3, type: "tween" }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseSplashScreen;
