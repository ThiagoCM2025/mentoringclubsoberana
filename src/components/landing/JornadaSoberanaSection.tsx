import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Crown, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { programsList, Program } from "@/data/programs";
import mentorFabiana from "@/assets/mentor-fabiana.jpeg";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";

interface ProgramCardProps {
  program: Program;
  index: number;
  isReversed?: boolean;
  isInView: boolean;
}

const ProgramCard = ({ program, index, isReversed, isInView }: ProgramCardProps) => {
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={cardInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
        isReversed ? "md:grid-flow-dense" : ""
      }`}
    >
      {/* Image with Golden Frame */}
      <motion.div 
        className={`relative ${isReversed ? "md:col-start-2" : ""}`}
        initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
        animate={cardInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="golden-frame group">
          {/* Decorative corners - hidden on mobile */}
          <div className="golden-corner golden-corner-tl hidden sm:block" />
          <div className="golden-corner golden-corner-tr hidden sm:block" />
          <div className="golden-corner golden-corner-bl hidden sm:block" />
          <div className="golden-corner golden-corner-br hidden sm:block" />
          
          <div className="golden-frame-inner aspect-[4/5] overflow-hidden">
            <img
              src={program.image || mentorFabiana}
              alt={program.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              width={400}
              height={500}
            />
            {/* Elegant vignette overlay */}
            <div className="golden-vignette" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>
        
        {/* Floating golden particles - hidden on mobile */}
        <div className="golden-particle golden-particle-1 hidden md:block" />
        <div className="golden-particle golden-particle-2 hidden md:block" />
        <div className="golden-particle golden-particle-3 hidden md:block" />

        {/* Glow behind frame - reduced on mobile */}
        <div className="absolute inset-4 bg-secondary/15 md:bg-secondary/20 blur-2xl md:blur-3xl -z-10 rounded-2xl" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className={`${isReversed ? "md:col-start-1 md:text-right" : ""}`}
        initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
        animate={cardInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className="inline-flex items-center gap-2 text-secondary text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 font-semibold drop-shadow-[0_0_8px_rgba(166,144,97,0.5)]">
          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
          {program.subtitle}
        </span>
        
        <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground mb-3 sm:mb-4 leading-tight group-hover:scale-[1.01] transition-transform duration-300">
          {program.titleHighlight ? (
            <>
              {program.title.split(program.titleHighlight)[0]}
              <em className="italic text-shimmer-gold not-italic">{program.titleHighlight}</em>
              {program.title.split(program.titleHighlight)[1]}
            </>
          ) : (
            program.title
          )}
        </h3>
        
        <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
          {program.description}
        </p>

        {program.price && (
          <motion.p 
            className="text-secondary font-semibold mb-6 text-xl"
            initial={{ opacity: 0 }}
            animate={cardInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {program.price}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={cardInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={isReversed ? "md:flex md:justify-end" : ""}
        >
          <Link 
            to={program.customPageUrl || `/programa/${program.slug}`}
            className="group/btn relative inline-flex items-center gap-2 sm:gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(166,144,97,0.4)]"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            
            <span className="relative z-10">{program.ctaText}</span>
            <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const JornadaSoberanaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Order programs for display: entry first, then mid, then elite
  const orderedPrograms = [
    ...programsList.filter((p) => p.tier === "entry"),
    ...programsList.filter((p) => p.tier === "mid"),
    ...programsList.filter((p) => p.tier === "elite"),
  ];

  return (
    <section className="py-16 sm:py-24 md:py-40 bg-background relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-background to-cream/50" />
      
      {/* Circle Pattern decoration - corners - hidden on small mobile */}
      <div 
        className="absolute top-0 right-0 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] opacity-[0.08] sm:opacity-[0.12]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'top right',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] opacity-[0.08] sm:opacity-[0.12]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
        }}
      />

      {/* Central glow - reduced on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[1000px] h-[300px] sm:h-[500px] md:h-[1000px] bg-secondary/3 md:bg-secondary/5 blur-xl sm:blur-2xl md:blur-3xl rounded-full" />

      {/* Isotipo Gold - decorative */}
      <div className="absolute top-1/4 left-8 opacity-[0.18] hidden lg:block animate-float-slow">
        <img src={isotipoGold} alt="" className="w-32 h-32" loading="lazy" width={128} height={128} />
      </div>
      <div className="absolute bottom-1/4 right-8 opacity-[0.18] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoGold} alt="" className="w-36 h-36" loading="lazy" width={144} height={144} />
      </div>
      <div className="absolute top-1/2 left-1/4 opacity-[0.10] hidden xl:block animate-float-slow animation-delay-500">
        <img src={isotipoGold} alt="" className="w-20 h-20" loading="lazy" width={80} height={80} />
      </div>

      {/* Subtle decorative lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

      <div className="container-soberana relative z-10">
        {/* Header - Enhanced */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 md:mb-24 px-2"
        >
          {/* Isotipo S decoration */}
          <motion.div 
            className="flex justify-center mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="relative">
              <img src={isotipoSGold} alt="" className="w-10 h-10 sm:w-14 sm:h-14 isotipo-glow" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-secondary/20 blur-xl scale-150" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-secondary/40 bg-secondary/10 text-secondary"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium tracking-wider uppercase">A Jornada Soberana</span>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.div>

          <motion.h2 
            className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-serif font-medium text-foreground mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Escolha Seu <em className="italic text-secondary">Momento</em>
          </motion.h2>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            O Ecossistema Soberana: Do Digital ao Presencial. 
            <br className="hidden md:block" />
            Cada programa foi desenhado para uma <span className="text-secondary font-medium">fase específica</span> da sua jornada.
          </motion.p>

          {/* Decorative line under header */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-10 mx-auto w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"
          />
        </motion.div>

        {/* Programs List */}
        <div className="space-y-16 sm:space-y-24 md:space-y-40">
          {orderedPrograms.map((program, index) => (
            <ProgramCard
              key={program.slug}
              program={program}
              index={index}
              isReversed={index % 2 === 1}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-32 text-center relative"
        >
          {/* Decorative background for CTA */}
          <div className="absolute inset-0 -mx-4 -my-12 bg-gradient-to-b from-transparent via-secondary/5 to-transparent rounded-3xl" />
          
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Crown className="w-5 h-5 text-secondary" />
              <span className="text-secondary font-medium">Atendimento Exclusivo</span>
              <Crown className="w-5 h-5 text-secondary" />
            </motion.div>
            
            <p className="text-lg sm:text-xl md:text-2xl text-foreground font-serif mb-6 sm:mb-8 max-w-xl mx-auto px-2">
              Não sabe qual programa escolher?
              <br />
              <span className="text-muted-foreground text-sm sm:text-base font-sans">Receba uma orientação personalizada</span>
            </p>
            
            <div className="relative inline-block">
              {/* Pulsing rings - hidden on mobile for performance */}
              <span className="absolute inset-0 -m-2 rounded-2xl bg-secondary/40 animate-[pulse_2s_ease-in-out_infinite] hidden sm:block" />
              <span className="absolute inset-0 -m-4 rounded-2xl bg-secondary/20 animate-[pulse_2s_ease-in-out_infinite_0.5s] hidden sm:block" />
              <span className="absolute inset-0 -m-6 rounded-3xl bg-secondary/10 animate-[pulse_2s_ease-in-out_infinite_1s] hidden sm:block" />
              
              <motion.a
                href="https://wa.me/5511993563468?text=Olá! Quero ajuda para escolher o programa ideal para mim"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-12 py-4 sm:py-6 rounded-xl font-semibold text-sm sm:text-lg tracking-wide overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(166,144,97,0.4)",
                    "0 0 40px rgba(166,144,97,0.6)",
                    "0 0 20px rgba(166,144,97,0.4)"
                  ]
                }}
                transition={{ 
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {/* Button background with animated gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-gold-light" />
                
                {/* Shimmer overlay - continuous animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" 
                  style={{ backgroundSize: "200% 100%" }} />
                
                {/* Extra glow on hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-secondary blur-xl -z-10" />
                
                {/* Border glow */}
                <span className="absolute inset-0 rounded-xl border-2 border-white/30 group-hover:border-white/50 transition-colors duration-300" />
                
                <span className="relative z-10 text-secondary-foreground flex items-center gap-2 sm:gap-3">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  <span className="whitespace-nowrap">Falar com Equipe Soberana</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </motion.a>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                Resposta em até 24h
              </span>
              <span className="hidden sm:block">•</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                +500 advogadas atendidas
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};