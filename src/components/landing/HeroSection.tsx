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
    <section className="relative min-h-screen flex items-end overflow-hidden bg-brand-black">
      {/* Pattern Background - Gold geometric on right */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url(${patternGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px',
        }}
      />
      
      {/* Photo - Top right with fade */}
      <div className="absolute top-0 right-0 w-full md:w-3/4 lg:w-2/3 h-[70vh] md:h-[80vh]">
        <img
          src={heroVariations}
          alt="Fabiana Duarte - Mentoring Club Soberana"
          className="w-full h-full object-cover object-top hero-photo-fade"
        />
        {/* Gradient fade to black */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-soberana relative z-10 px-4 md:px-8 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end">
          {/* Left Column - Logo + Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo with Isotipo */}
            <div className="flex items-center gap-3 mb-8">
              <img 
                src={isotipo} 
                alt="Soberana" 
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <div className="text-cream">
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase font-medium">Mentoring Club</p>
                <p className="text-lg md:text-xl font-serif font-semibold tracking-wider">SOBERANA</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-medium text-cream leading-tight mb-6">
              Transforme sua Advocacia Técnica em um Negócio{" "}
              <span className="text-shimmer-gold">
                Estruturado, Lucrativo e Posicionado
              </span>
            </h1>
          </motion.div>

          {/* Right Column - CTA Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:text-right"
          >
            <p className="text-lg md:text-xl text-cream/90 mb-8 leading-relaxed">
              Chegou a hora de assumir seu lugar de{" "}
              <strong className="text-secondary">CEO</strong> da sua própria história.
            </p>

            <Button
              onClick={scrollToPrograms}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold uppercase tracking-wider group shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Quero Transformar Meu Negócio
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Área do Aluno Link */}
            <div className="mt-6">
              <a 
                href="/auth" 
                className="text-cream/70 hover:text-cream text-sm tracking-wide transition-colors inline-flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-secondary" />
                Área do Aluno
              </a>
            </div>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 pt-8 border-t border-cream/10 flex flex-wrap gap-6 md:gap-10 text-cream/70"
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
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
