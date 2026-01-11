import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramModulesTimelineProps {
  program: Program;
}

// Icons for each pillar
const PILLAR_EMOJIS = ["🧠", "🎯", "📣", "💰", "💎", "⚙️"];

export const ProgramModulesTimeline = ({ program }: ProgramModulesTimelineProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  if (!program.modules || program.modules.length === 0) return null;

  return (
    <PremiumBackground
      variant="dark"
      pattern="circles-gold"
      patternOpacity={0.03}
      showIsotipos
      isotipoVariant="gold"
      showVignette
      sectionClassName="section-padding bg-gradient-to-b from-foreground via-foreground to-primary/20"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-16"
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="text-center space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium border border-secondary/20">
              Metodologia Soberana
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-background">
              O Passo a Passo da{" "}
              <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
                Transformação
              </span>
            </h2>
            <p className="text-background/60 max-w-2xl mx-auto text-lg">
              6 pilares fundamentais para você construir um escritório estruturado e lucrativo
            </p>
          </motion.div>

          {/* Timeline Visual - Desktop */}
          <motion.div variants={staggerItem} className="hidden lg:block">
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
              
              {/* Timeline Points */}
              <div className="grid grid-cols-6 gap-4">
                {program.modules.map((module, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Number Circle */}
                    <motion.div
                      className={cn(
                        "relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300",
                        expandedModule === index
                          ? "bg-gradient-to-br from-secondary to-accent scale-110"
                          : "bg-gradient-to-br from-primary to-secondary hover:scale-105"
                      )}
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Glow */}
                      <div className="absolute inset-0 rounded-full bg-secondary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <span className="text-3xl">{PILLAR_EMOJIS[index] || "📌"}</span>
                        <p className="text-background font-bold text-sm mt-1">{index + 1}</p>
                      </div>

                      {/* Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-secondary/30" />
                    </motion.div>

                    {/* Module Title */}
                    <p className="mt-4 text-center text-background font-medium text-sm max-w-[120px] leading-tight">
                      {module.title.replace(/^Pilar \d+: /, "")}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Expanded Card - Desktop */}
          {expandedModule !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="hidden lg:block"
            >
              <div className="relative max-w-2xl mx-auto">
                <div className="backdrop-blur-xl bg-background/5 border border-secondary/30 rounded-2xl p-8 shadow-2xl shadow-secondary/10">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-3xl shrink-0">
                      {PILLAR_EMOJIS[expandedModule]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-background mb-2">
                        {program.modules[expandedModule].title}
                      </h3>
                      <p className="text-background/70 leading-relaxed">
                        {program.modules[expandedModule].description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setExpandedModule(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/10 flex items-center justify-center text-background/60 hover:text-background hover:bg-background/20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mobile/Tablet - Accordion Style */}
          <motion.div variants={staggerItem} className="lg:hidden space-y-4">
            {program.modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="group"
              >
                <button
                  onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                  className={cn(
                    "w-full backdrop-blur-md bg-background/5 border rounded-xl p-4 flex items-center gap-4 transition-all",
                    expandedModule === index
                      ? "border-secondary/50 bg-secondary/10"
                      : "border-secondary/20 hover:border-secondary/40"
                  )}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <span className="text-2xl">{PILLAR_EMOJIS[index]}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <p className="text-secondary text-xs font-medium uppercase tracking-wide">
                      Pilar {index + 1}
                    </p>
                    <p className="text-background font-semibold">
                      {module.title.replace(/^Pilar \d+: /, "")}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  {expandedModule === index ? (
                    <ChevronUp className="w-5 h-5 text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-background/50" />
                  )}
                </button>

                {/* Expanded Content */}
                {expandedModule === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 px-4 py-4 bg-secondary/5 border border-secondary/20 rounded-xl"
                  >
                    <p className="text-background/70 leading-relaxed">
                      {module.description}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Impact Phrase */}
          <motion.div variants={staggerItem} className="text-center pt-8">
            <p className="text-xl md:text-2xl font-serif text-secondary italic">
              "{program.impactPhrase}"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
