import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroVariations from "@/assets/hero-variations.jpeg";
import isotipo from "@/assets/brand/isotipo.png";
import patternGold from "@/assets/brand/pattern-gold.png";

export const HeroSection = () => {
  const scrollToPrograms = () => {
    document.getElementById("programas")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-brand-black">
      {/* Pattern Background - Gold geometric */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url(${patternGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px',
        }}
      />
      
      {/* Photo - Centered and 100% Visible */}
      <div className="relative z-10 flex justify-center items-center pt-20 md:pt-24 px-4">
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          src={heroVariations}
          alt="Fabiana Duarte - Mentoring Club Soberana"
          className="max-h-[45vh] md:max-h-[55vh] w-auto object-contain"
        />
      </div>

      {/* Content Below Photo */}
      <div className="container-soberana relative z-10 px-4 md:px-8 py-8 md:py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo with Isotipo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <img 
              src={isotipo} 
              alt="Soberana" 
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <div className="text-cream">
              <p className="text-xs md:text-sm tracking-[0.3em] uppercase font-medium">Mentoring Club</p>
              <p className="text-lg md:text-xl font-serif font-semibold tracking-wider">SOBERANA</p>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-4xl lg:text-5xl font-serif font-medium text-cream leading-tight mb-4"
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
            className="text-base md:text-lg text-cream/90 mb-8 leading-relaxed"
          >
            Chegou a hora de assumir seu lugar de{" "}
            <strong className="text-secondary">CEO</strong> da sua própria história.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button
              onClick={scrollToPrograms}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold uppercase tracking-wider group shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Quero Transformar Meu Negócio
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <a 
              href="/auth" 
              className="text-cream/70 hover:text-cream text-sm tracking-wide transition-colors inline-flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-secondary" />
              Área do Aluno
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="pt-6 border-t border-cream/10 flex flex-wrap justify-center gap-6 md:gap-10 text-cream/70"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-sm tracking-wide">+500 Advogadas Transformadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-sm tracking-wide">+10 Anos de Experiência</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-sm tracking-wide">Especialista em IA Jurídica</span>
            </div>
          </motion.div>
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
