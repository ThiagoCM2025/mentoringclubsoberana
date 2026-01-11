import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Users, Target, Sparkles } from "lucide-react";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ProgramFeaturesProps {
  program: Program;
}

// Helper function to parse "Title: Description" format
const parseItemWithTitle = (item: string) => {
  const colonIndex = item.indexOf(":");
  if (colonIndex > 0 && colonIndex < 60) {
    return {
      title: item.substring(0, colonIndex).trim(),
      description: item.substring(colonIndex + 1).trim(),
    };
  }
  return { title: null, description: item };
};

export const ProgramFeatures = ({ program }: ProgramFeaturesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <PremiumBackground
      variant="dark"
      pattern="circles-gold"
      patternOpacity={0.03}
      showIsotipos
      isotipoVariant="gold"
      showVignette
      sectionClassName="section-padding bg-gradient-to-b from-foreground to-foreground"
    >
      <div ref={ref} className="container-soberana">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-secondary" />
            <Sparkles className="w-5 h-5 text-secondary" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-secondary" />
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-background mb-4">
            Transformação Completa
          </motion.h2>
          <motion.p variants={staggerItem} className="text-background/60 text-lg max-w-2xl mx-auto">
            Um programa estruturado para advogadas que querem resultados reais
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Para Quem É */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center border border-secondary/30 backdrop-blur-sm shadow-lg shadow-secondary/20">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-background">
                  Para Quem É
                </h2>
                <p className="text-sm text-background/50">
                  Este programa foi criado especialmente para:
                </p>
              </div>
            </motion.div>

            <div className="space-y-4">
              {program.targetAudience.map((item, index) => {
                const { title, description } = parseItemWithTitle(item);
                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="group relative overflow-hidden"
                  >
                    {/* Card with glassmorphism */}
                    <div className="relative rounded-xl border border-secondary/20 backdrop-blur-sm bg-background/[0.03] p-5 
                      hover:border-secondary/50 hover:bg-background/[0.06] transition-all duration-500
                      hover:shadow-[0_0_35px_rgba(166,144,97,0.15)]">
                      
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </div>
                      
                      <div className="relative flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/40 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <Check className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          {title ? (
                            <>
                              <span className="font-semibold text-background block mb-1">
                                {title}
                              </span>
                              <span className="text-background/60 text-sm leading-relaxed">
                                {description}
                              </span>
                            </>
                          ) : (
                            <span className="text-background">{description}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Decorative line */}
                      <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* O Que Você Recebe */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/20">
                <Target className="w-7 h-7 text-primary-light" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-background">
                  O Que Você Recebe
                </h2>
                <p className="text-sm text-background/50">
                  Ao participar deste programa, você terá acesso a:
                </p>
              </div>
            </motion.div>

            <div className="space-y-4">
              {program.deliverables.map((item, index) => {
                const { title, description } = parseItemWithTitle(item);
                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="group relative overflow-hidden"
                  >
                    {/* Card with glassmorphism */}
                    <div className="relative rounded-xl border border-primary/20 backdrop-blur-sm bg-background/[0.03] p-5 
                      hover:border-primary/50 hover:bg-background/[0.06] transition-all duration-500
                      hover:shadow-[0_0_35px_rgba(139,0,39,0.15)]">
                      
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </div>
                      
                      <div className="relative flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <Sparkles className="w-5 h-5 text-primary-light" />
                        </div>
                        <div className="flex-1">
                          {title ? (
                            <>
                              <span className="font-semibold text-background block mb-1">
                                {title}
                              </span>
                              <span className="text-background/60 text-sm leading-relaxed">
                                {description}
                              </span>
                            </>
                          ) : (
                            <span className="text-background">{description}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Decorative line */}
                      <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
};
