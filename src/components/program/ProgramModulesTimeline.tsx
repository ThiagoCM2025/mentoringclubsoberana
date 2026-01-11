import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { 
  Brain, 
  Target, 
  Megaphone, 
  MessageSquare, 
  TrendingUp, 
  Cog,
  Sparkles 
} from "lucide-react";

interface ProgramModulesTimelineProps {
  program: Program;
}

// Define the 6 pillars of the methodology with icons
const methodologyPillars = [
  {
    number: 1,
    icon: Brain,
    title: "BASE TÉCNICA",
    subtitle: "Fundamentos Práticos",
    description: "Domine os fundamentos técnicos que sustentam um escritório lucrativo e profissional.",
    color: "gold" as const,
  },
  {
    number: 2,
    icon: Target,
    title: "POSICIONAMENTO",
    subtitle: "Autoridade e Nicho",
    description: "Construa sua marca pessoal e posicione-se como referência no seu nicho de atuação.",
    color: "gold" as const,
  },
  {
    number: 3,
    icon: Megaphone,
    title: "PROSPECÇÃO",
    subtitle: "Captação de Clientes",
    description: "Atraia os clientes certos com estratégias éticas e eficientes de marketing jurídico.",
    color: "gold" as const,
  },
  {
    number: 4,
    icon: MessageSquare,
    title: "COMUNICAÇÃO",
    subtitle: "Vendas com Segurança",
    description: "Negocie honorários com confiança e converta consultas em contratos fechados.",
    color: "marsala" as const,
  },
  {
    number: 5,
    icon: TrendingUp,
    title: "GESTÃO",
    subtitle: "Operação Lucrativa",
    description: "Organize processos, finanças e equipe para um escritório que funciona sem você.",
    color: "marsala" as const,
  },
  {
    number: 6,
    icon: Cog,
    title: "ESCALABILIDADE",
    subtitle: "Recorrência Financeira",
    description: "Use tecnologia e automação para criar autonomia e multiplicar resultados.",
    color: "marsala" as const,
  },
];

export const ProgramModulesTimeline = ({ program }: ProgramModulesTimelineProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <PremiumBackground
      variant="dark"
      pattern="circles-gold"
      patternOpacity={0.04}
      showIsotipos
      isotipoVariant="gold"
      showVignette
      sectionClassName="section-padding bg-gradient-to-b from-foreground via-foreground to-primary/20"
      data-section="methodology"
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
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-secondary" />
              <Sparkles className="w-5 h-5 text-secondary" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-secondary" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-background">
              Metodologia{" "}
              <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
                Soberana
              </span>
            </h2>
            <p className="text-background/60 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
              O passo a passo da transformação do seu escritório em 12 semanas
            </p>
          </motion.div>

          {/* Cards Grid - Premium Design */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {methodologyPillars.map((pillar, index) => {
              const IconComponent = pillar.icon;
              const isGold = pillar.color === "gold";
              
              return (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="group relative"
                >
                  {/* Card Container */}
                  <div className="relative h-full rounded-2xl overflow-hidden">
                    {/* Border Gradient */}
                    <div className={`absolute inset-0 rounded-2xl p-[1px] transition-all duration-500 ${
                      isGold 
                        ? "bg-gradient-to-br from-secondary/50 via-secondary/10 to-secondary/40 group-hover:from-secondary/70 group-hover:via-secondary/30 group-hover:to-secondary/60" 
                        : "bg-gradient-to-br from-primary/50 via-primary/10 to-primary/40 group-hover:from-primary/70 group-hover:via-primary/30 group-hover:to-primary/60"
                    }`}>
                      <div className="absolute inset-[1px] rounded-2xl bg-foreground" />
                    </div>
                    
                    {/* Card Content */}
                    <div className="relative h-full rounded-2xl backdrop-blur-sm bg-background/[0.02] p-4 sm:p-6 
                      group-hover:bg-background/[0.05] transition-all duration-500
                      hover:shadow-[0_0_50px_rgba(166,144,97,0.15)]">
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </div>
                      
                      {/* Glow Effect on Hover */}
                      <div className={`absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl rounded-3xl ${
                        isGold ? "bg-secondary/10" : "bg-primary/10"
                      }`} />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Number Badge & Icon Row */}
                        <div className="flex items-center justify-between mb-3 sm:mb-5">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition-transform duration-300 group-hover:scale-110 ${
                            isGold 
                              ? "bg-gradient-to-br from-secondary to-secondary-dark text-foreground shadow-lg shadow-secondary/40" 
                              : "bg-gradient-to-br from-primary to-primary-dark text-background shadow-lg shadow-primary/40"
                          }`}>
                            {pillar.number}
                          </div>
                          
                          {/* Icon */}
                          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${
                            isGold 
                              ? "bg-secondary/10 border-secondary/40 group-hover:bg-secondary/20 group-hover:border-secondary/60" 
                              : "bg-primary/10 border-primary/40 group-hover:bg-primary/20 group-hover:border-primary/60"
                          }`}>
                            <IconComponent className={`w-5 h-5 sm:w-7 sm:h-7 ${isGold ? "text-secondary" : "text-primary-light"}`} />
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-background mb-0.5 sm:mb-1">
                          {pillar.title}
                        </h3>
                        
                        {/* Subtitle */}
                        <p className={`text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${isGold ? "text-secondary" : "text-primary-light"}`}>
                          {pillar.subtitle}
                        </p>
                        
                        {/* Description */}
                        <p className="text-background/60 text-xs sm:text-sm leading-relaxed">
                          {pillar.description}
                        </p>
                        
                        {/* Decorative Line */}
                        <div className={`mt-3 sm:mt-5 h-0.5 rounded-full transition-all duration-500 ${
                          isGold 
                            ? "bg-gradient-to-r from-secondary/60 to-transparent w-12 group-hover:w-24" 
                            : "bg-gradient-to-r from-primary/60 to-transparent w-12 group-hover:w-24"
                        }`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Impact Phrase */}
          {program.impactPhrase && (
            <motion.div variants={staggerItem} className="text-center pt-8">
              <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary/10 via-background/5 to-primary/10 border border-secondary/20 backdrop-blur-sm">
                <p className="text-xl md:text-2xl font-serif text-background/80 italic">
                  "{program.impactPhrase}"
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
