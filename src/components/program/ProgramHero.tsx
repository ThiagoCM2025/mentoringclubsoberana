import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Star, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";
import { staggerContainer, staggerItem, heroTitle, ctaButton } from "@/lib/animations";

// Premium visual assets
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface ProgramHeroProps {
  program: Program;
}

export const ProgramHero = ({ program }: ProgramHeroProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = program.icon;

  return (
    <section
      ref={ref}
      className="relative min-h-[90vh] flex items-center bg-foreground overflow-hidden"
    >
      {/* Golden top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

      {/* Premium pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Floating Isotipos */}
      <motion.img
        src={isotipoGold}
        alt=""
        className="absolute top-32 right-20 w-16 md:w-24 h-auto animate-float-slow pointer-events-none hidden md:block"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.12 } : {}}
        transition={{ duration: 1.2 }}
      />
      <motion.img
        src={isotipoGold}
        alt=""
        className="absolute bottom-32 left-16 w-12 md:w-18 h-auto animate-float-slow pointer-events-none hidden md:block"
        style={{ animationDelay: "2s" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.08 } : {}}
        transition={{ duration: 1.2, delay: 0.4 }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Central golden glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container-soberana relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Badge */}
          <motion.div variants={staggerItem}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6 border border-secondary/20">
              <Icon className="w-4 h-4" />
              {program.tier === "entry" && "Programa de Entrada"}
              {program.tier === "mid" && "Mentoria"}
              {program.tier === "elite" && "Mastermind Exclusivo"}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={heroTitle}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-background mb-6"
          >
            {program.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-xl md:text-2xl text-secondary font-medium mb-4"
          >
            {program.subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={staggerItem}
            className="text-lg text-background/70 mb-8 max-w-2xl mx-auto"
          >
            {program.fullDescription}
          </motion.p>

          {/* Meta info */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-6 mb-10"
          >
            {program.duration && (
              <div className="flex items-center gap-2 text-background/60">
                <Clock className="w-5 h-5 text-secondary" />
                <span>{program.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-background/60">
              <Users className="w-5 h-5 text-secondary" />
              <span>{program.format}</span>
            </div>
            {program.price && (
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>{program.price}</span>
              </div>
            )}
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={ctaButton}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-6 text-lg group"
              asChild
            >
              <a href={program.ctaLink} target="_blank" rel="noopener noreferrer">
                {program.ctaText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            {program.secondaryCta && (
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10 px-8 py-6 text-lg"
                asChild
              >
                <a href={program.secondaryCta.link} target="_blank" rel="noopener noreferrer">
                  {program.secondaryCta.text}
                </a>
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Golden bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </section>
  );
};
