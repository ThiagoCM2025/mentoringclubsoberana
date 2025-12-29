import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";

// Premium visual assets
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface ProgramHeroProps {
  program: Program;
}

export const ProgramHero = ({ program }: ProgramHeroProps) => {
  const Icon = program.icon;

  return (
    <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-foreground via-foreground to-primary/20 overflow-hidden">
      {/* Golden top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      
      {/* Premium geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Radial vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Floating Isotipo - top right */}
      <motion.img 
        src={isotipoGold}
        alt=""
        className="absolute top-24 right-8 md:right-16 w-16 md:w-24 h-auto opacity-[0.12] animate-float-slow pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />

      {/* Floating Isotipo - bottom left */}
      <motion.img 
        src={isotipoGold}
        alt=""
        className="absolute bottom-20 left-8 md:left-16 w-12 md:w-20 h-auto opacity-[0.08] animate-float-slow pointer-events-none"
        style={{ animationDelay: '1s' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />

      {/* Decorative glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"
      />

      {/* Secondary glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"
      />

      <div className="container-soberana relative z-10 py-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
              <Icon className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">
              {program.tier === "entry" && "Programa de Entrada"}
              {program.tier === "mid" && "Mentoria"}
              {program.tier === "elite" && "Mastermind Exclusivo"}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-background mb-4"
          >
            {program.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-secondary font-medium mb-6"
          >
            {program.subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-background/70 mb-8 max-w-2xl"
          >
            {program.fullDescription}
          </motion.p>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <div className="bg-background/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-secondary/20">
              <span className="text-background/60 text-sm">Formato</span>
              <p className="text-background font-medium">{program.format}</p>
            </div>
            {program.duration && (
              <div className="bg-background/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-secondary/20">
                <span className="text-background/60 text-sm">Duração</span>
                <p className="text-background font-medium">{program.duration}</p>
              </div>
            )}
            {program.location && (
              <div className="bg-background/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-secondary/20">
                <span className="text-background/60 text-sm">Local</span>
                <p className="text-background font-medium">{program.location}</p>
              </div>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6 shadow-lg shadow-secondary/20"
              asChild
            >
              <a href={program.ctaLink} target="_blank" rel="noopener noreferrer">
                {program.ctaText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            {program.secondaryCta && (
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10 text-lg px-8 py-6"
                asChild
              >
                <a href={program.secondaryCta.link} target="_blank" rel="noopener noreferrer">
                  {program.secondaryCta.text}
                </a>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
