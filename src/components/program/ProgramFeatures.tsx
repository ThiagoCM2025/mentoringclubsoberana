import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Users, Target, Sparkles } from "lucide-react";
import { Program } from "@/data/programs";

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
    <section ref={ref} className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container-soberana relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Para Quem É */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  Para Quem É
                </h2>
                <p className="text-sm text-muted-foreground">Este programa foi criado especialmente para:</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {program.targetAudience.map((item, index) => {
                const { title, description } = parseItemWithTitle(item);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-secondary/30 hover:bg-card transition-all duration-300"
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
            </div>
          </motion.div>

          {/* O Que Você Recebe */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  O Que Você Recebe
                </h2>
                <p className="text-sm text-muted-foreground">Ao participar deste programa, você terá acesso a:</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {program.deliverables.map((item, index) => {
                const { title, description } = parseItemWithTitle(item);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
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
            </div>
          </motion.div>
        </div>

        {/* Modules Section (Metodologia) */}
        {program.modules && program.modules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                Metodologia
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                O Passo a Passo da Transformação
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Uma jornada estruturada para você alcançar seus objetivos
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {program.modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + 0.1 * index }}
                  className="group relative bg-card rounded-2xl p-6 border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5"
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
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-border to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
