import { motion } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";
import { staggerContainer, staggerItem } from "@/lib/animations";

// Brand assets
import fabianaHero from "@/assets/hero-fabiana-aceleracao.jpeg";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import patternGeometricGold from "@/assets/brand/pattern-geometric-gold.png";

interface AccelerationHeroProps {
  program: Program;
}

export const AccelerationHero = ({ program }: AccelerationHeroProps) => {
  const ref = useRef(null);
  const Icon = program.icon;

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-foreground"
    >
      {/* Background Patterns */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundSize: "400px",
          backgroundRepeat: "repeat"
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url(${patternGeometricGold})`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat"
        }}
      />

      {/* Radial Gradients for depth */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      {/* Floating Isotipos */}
      <motion.img
        src={isotipoSGold}
        alt=""
        className="absolute top-20 right-10 w-16 h-16 opacity-20 hidden lg:block"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.img
        src={isotipoSGold}
        alt=""
        className="absolute bottom-32 left-10 w-12 h-12 opacity-15 hidden lg:block"
        animate={{ 
          y: [0, 10, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Top Golden Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-foreground/80 pointer-events-none" />

      {/* Content */}
      <div className="container-soberana relative z-10 py-12 lg:py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          {/* Left - Photo with Premium Frame - Order 2 on mobile */}
          <motion.div 
            variants={staggerItem}
            className="relative flex justify-center order-2 lg:order-1"
          >
            {/* Premium Golden Frame Container */}
            <div className="relative">
              {/* Glow Effect - BIGGER */}
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-br from-secondary/40 via-secondary/20 to-secondary/40 rounded-3xl blur-2xl opacity-60" />
              
              {/* Outer Golden Frame */}
              <div className="relative p-1.5 sm:p-2 bg-gradient-to-br from-secondary via-secondary/80 to-secondary rounded-2xl shadow-2xl shadow-secondary/30">
                {/* Inner Frame with Pattern */}
                <div className="relative p-0.5 sm:p-1 bg-gradient-to-br from-secondary/90 via-foreground to-secondary/90 rounded-xl">
                  {/* Photo Container - Responsive sizes */}
                  <div className="relative w-[240px] sm:w-[300px] md:w-[380px] lg:w-[420px] xl:w-[480px] aspect-[3/4] rounded-lg overflow-hidden">
                    <img
                      src={fabianaHero}
                      alt="Fabiana Duarte - Mentora"
                      className="w-full h-full object-cover object-top"
                    />
                    
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-7 h-7 sm:w-10 sm:h-10 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-secondary rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-7 h-7 sm:w-10 sm:h-10 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-secondary rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-7 h-7 sm:w-10 sm:h-10 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-secondary rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-7 h-7 sm:w-10 sm:h-10 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-secondary rounded-br-lg" />
              </div>

              {/* Floating particles - hide on mobile */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-secondary hidden sm:block"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: i % 2 === 0 ? "-25px" : "calc(100% + 15px)",
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right - Content - Order 1 on mobile (appears first) */}
          <motion.div 
            variants={staggerContainer}
            className="text-center lg:text-left space-y-4 sm:space-y-6 order-1 lg:order-2"
          >
            {/* Badge */}
            <motion.div variants={staggerItem} className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30 backdrop-blur-sm">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <span className="text-secondary font-medium tracking-widest uppercase text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                MENTORIA
              </span>
            </motion.div>

            {/* Title */}
            <motion.div variants={staggerItem}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-background leading-tight">
                Estruture sua advocacia{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
                    em 90 dias
                  </span>
                  <motion.span
                    className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-accent to-secondary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={staggerItem}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-secondary"
            >
              {program.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              variants={staggerItem}
              className="text-sm sm:text-base lg:text-lg text-background/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {program.fullDescription}
            </motion.p>

            {/* Info Cards - Glassmorphism */}
            <motion.div variants={staggerItem} className="flex flex-wrap justify-center lg:justify-start gap-3 py-2 sm:py-4">
              <div className="backdrop-blur-md bg-background/5 border border-secondary/20 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  <div className="text-left">
                    <p className="text-background/50 text-[10px] sm:text-xs uppercase tracking-wide">Formato</p>
                    <p className="text-background font-semibold text-sm sm:text-base">{program.format}</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-background/5 border border-secondary/20 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  <div className="text-left">
                    <p className="text-background/50 text-[10px] sm:text-xs uppercase tracking-wide">Duração</p>
                    <p className="text-background font-semibold text-sm sm:text-base">{program.duration}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 pt-2 sm:pt-4">
              <Button
                size="lg"
                variant="cta"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-xl shadow-secondary/20 hover:shadow-2xl hover:shadow-secondary/30 transition-all"
                asChild
              >
                <a href={program.ctaLink} target="_blank" rel="noopener noreferrer">
                  {program.ctaText}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </Button>
              {program.secondaryCta && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-secondary/40 text-secondary hover:bg-secondary/10 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 backdrop-blur-sm"
                  asChild
                >
                  <a href={program.secondaryCta.link} target="_blank" rel="noopener noreferrer">
                    {program.secondaryCta.text}
                  </a>
                </Button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade - DARK FADE instead of light */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-foreground to-transparent" />
    </section>
  );
};
