import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Users, Target, Sparkles } from "lucide-react";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem, staggerItemScale, staggerContainerSlow } from "@/lib/animations";

interface ProgramFeaturesProps {
  program: Program;
}

// Helper function to parse "Title: Description" format
const parseItemWithTitle = (item: string) => {
  const colonIndex = item.indexOf(":");
  if (colonIndex > 0 && colonIndex < 60) {
    return {
      title: item.substring(0, colonIndex).trim(),
      description: item.substring(colonIndex + 1).trim()
    };
  }
  return { title: null, description: item };
};

export const ProgramFeatures = ({ program }: ProgramFeaturesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <PremiumBackground
      variant="light"
      pattern="circles-marsala"
      patternOpacity={0.04}
      showIsotipos
      isotipoColor="gold"
      showGlow
      glowColor="gold"
      showTopBorder
      showBottomBorder
    >
      <div ref={ref} className="container-soberana">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Para Quem É */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  Para Quem É
                </h2>
                <p className="text-sm text-muted-foreground">Este programa foi criado especialmente para:</p>
              </div>
            </motion.div>
            
            <motion.div className="space-y-4" variants={staggerContainer}>
              {program.targetAudience.map((item, index) => {
                const { title, description } = parseItemWithTitle(item);
                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-secondary/40 hover:bg-card hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-secondary/30 transition-colors">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      {title ? (
                        <>
                          <span className="font-semibold text-foreground block mb-1">{title}</span>
                          <span className="text-muted-foreground text-sm leading-relaxed">{description}</span>
                        </>
                      ) : (
                        <span className="text-foreground">{description}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* O Que Você Recebe */}
          <motion.div
            variants={staggerContainerSlow}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg shadow-secondary/20">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  O Que Você Recebe
                </h2>
                <p className="text-sm text-muted-foreground">Ao participar deste programa, você terá acesso a:</p>
              </div>
            </motion.div>
            
            <motion.div className="space-y-4" variants={staggerContainer}>
              {program.deliverables.map((item, index) => {
                const { title, description } = parseItemWithTitle(item);
                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/30 transition-colors">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      {title ? (
                        <>
                          <span className="font-semibold text-foreground block mb-1">{title}</span>
                          <span className="text-muted-foreground text-sm leading-relaxed">{description}</span>
                        </>
                      ) : (
                        <span className="text-foreground">{description}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Modules Section (Metodologia) */}
        {program.modules && program.modules.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-24"
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 border border-secondary/20">
                Metodologia
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                O Passo a Passo da Transformação
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Uma jornada estruturada para você alcançar seus objetivos
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
            >
              {program.modules.map((module, index) => (
                <motion.div
                  key={index}
                  variants={staggerItemScale}
                  className="group relative bg-card rounded-2xl p-6 border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10"
                >
                  {/* Step number badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="font-semibold text-foreground mb-2 leading-tight">{module.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
                  </div>
                  
                  {/* Connector line (except last) */}
                  {index < program.modules!.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-secondary/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
};
