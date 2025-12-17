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
        initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
        animate={cardInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="golden-frame group">
          {/* Decorative corners */}
          <div className="golden-corner golden-corner-tl" />
          <div className="golden-corner golden-corner-tr" />
          <div className="golden-corner golden-corner-bl" />
          <div className="golden-corner golden-corner-br" />
          
          <div className="golden-frame-inner aspect-[4/5] overflow-hidden">
            <img
              src={program.image || mentorFabiana}
              alt={program.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            {/* Elegant vignette overlay */}
            <div className="golden-vignette" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>
        
        {/* Floating golden particles */}
        <div className="golden-particle golden-particle-1" />
        <div className="golden-particle golden-particle-2" />
        <div className="golden-particle golden-particle-3" />

        {/* Glow behind frame */}
        <div className="absolute inset-4 bg-secondary/20 blur-3xl -z-10 rounded-2xl" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className={`${isReversed ? "md:col-start-1 md:text-right" : ""}`}
        initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
        animate={cardInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <span className="inline-flex items-center gap-2 text-secondary text-xs tracking-[0.25em] uppercase mb-4 font-medium">
          <Star className="w-3 h-3" />
          {program.subtitle}
        </span>
        
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground mb-4 leading-tight">
          {program.titleHighlight ? (
            <>
              {program.title.split(program.titleHighlight)[0]}
              <em className="italic text-secondary">{program.titleHighlight}</em>
              {program.title.split(program.titleHighlight)[1]}
            </>
          ) : (
            program.title
          )}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed text-base">
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
            to={`/programa/${program.slug}`}
            className="group/btn relative inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-lg font-semibold tracking-wide transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(166,144,97,0.4)]"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            
            <span className="relative z-10">{program.ctaText}</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
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
    <section className="py-24 md:py-40 bg-background relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-background to-cream/50" />
      
      {/* Circle Pattern decoration - corners */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.12]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'top right',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[800px] h-[800px] opacity-[0.12]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
        }}
      />

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-secondary/5 blur-3xl rounded-full" />

      {/* Isotipo Gold - decorative */}
      <div className="absolute top-1/4 left-8 opacity-[0.18] hidden lg:block animate-float-slow">
        <img src={isotipoGold} alt="" className="w-32 h-32" />
      </div>
      <div className="absolute bottom-1/4 right-8 opacity-[0.18] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoGold} alt="" className="w-36 h-36" />
      </div>
      <div className="absolute top-1/2 left-1/4 opacity-[0.10] hidden xl:block animate-float-slow animation-delay-500">
        <img src={isotipoGold} alt="" className="w-20 h-20" />
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
          className="text-center mb-24"
        >
          {/* Isotipo S decoration */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="relative">
              <img src={isotipoSGold} alt="" className="w-14 h-14 isotipo-glow" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-secondary/20 blur-xl scale-150" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-secondary/40 bg-secondary/10 text-secondary"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wider uppercase">A Jornada Soberana</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>

          <motion.h2 
            className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Escolha Seu <em className="italic text-secondary">Momento</em>
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
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
            className="mt-10 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"
          />
        </motion.div>

        {/* Programs List */}
        <div className="space-y-24 md:space-y-40">
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
            
            <p className="text-xl md:text-2xl text-foreground font-serif mb-8 max-w-xl mx-auto">
              Não sabe qual programa escolher?
              <br />
              <span className="text-muted-foreground text-base font-sans">Receba uma orientação personalizada</span>
            </p>
            
            <motion.a
              href="https://wa.me/5511993563468?text=Olá! Quero ajuda para escolher o programa ideal para mim"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-12 py-6 rounded-xl font-semibold text-lg tracking-wide overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button background with animated gradient */}
              <span className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-gold-light" />
              
              {/* Shimmer overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Glow effect */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-secondary blur-xl -z-10" />
              
              {/* Border glow */}
              <span className="absolute inset-0 rounded-xl border-2 border-secondary/50 group-hover:border-secondary transition-colors duration-300" />
              
              <span className="relative z-10 text-secondary-foreground flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                Falar com Equipe Soberana
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </motion.a>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Resposta em até 24h
              </span>
              <span className="hidden md:block">•</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                +500 advogadas atendidas
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};