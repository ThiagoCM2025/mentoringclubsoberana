import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroVariations from "@/assets/hero-variations.jpeg";
import { SoberanaLogoMark } from "./SoberanaLogoMark";

export const HeroSection = () => {
  const scrollToJornada = () => {
    document.getElementById("jornada")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-brand-black">
      {/* Background Image - Fabiana */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroVariations})`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Gradient Overlay for legibility */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(to bottom, 
              rgba(0,0,0,0.4) 0%, 
              rgba(0,0,0,0.2) 30%, 
              rgba(0,0,0,0.5) 60%, 
              rgba(0,0,0,0.95) 100%
            )
          `
        }}
      />

      {/* Content - positioned at bottom */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-12 md:pb-16 pt-20 overflow-hidden">
        <div className="container-soberana">
          <div className="text-center max-w-4xl mx-auto px-2">
            {/* Logo with Star */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-4 sm:mb-6"
            >
              <SoberanaLogoMark variant="light" size="lg" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif font-medium text-cream leading-tight mb-3 sm:mb-4"
            >
              Transforme sua Advocacia Técnica em um Negócio{" "}
              <span className="text-shimmer-gold">
                Estruturado, Lucrativo e Posicionado
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm sm:text-base md:text-lg text-cream/90 mb-6 sm:mb-8 leading-relaxed"
            >
              Chegou a hora de assumir seu lugar de{" "}
              <strong className="text-secondary">CEO</strong> da sua própria história.
            </motion.p>

            {/* CTA - Only main button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center mb-6 sm:mb-8"
            >
              <Button
                onClick={scrollToJornada}
                size="lg"
                className="cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 sm:px-8 md:px-12 py-5 sm:py-6 md:py-7 text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider group whitespace-normal text-center leading-tight"
              >
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  Quero Transformar Meu Negócio
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </span>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="pt-4 sm:pt-6 border-t border-cream/10 flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-10 text-cream/70"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                <span className="text-xs sm:text-sm tracking-wide">+500 Advogadas Transformadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                <span className="text-xs sm:text-sm tracking-wide">+10 Anos de Experiência</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                <span className="text-xs sm:text-sm tracking-wide">Especialista em IA Jurídica</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-secondary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};
