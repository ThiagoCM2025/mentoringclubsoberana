import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ProgramHeroProps {
  program: Program;
}

export const ProgramHero = ({ program }: ProgramHeroProps) => {
  const Icon = program.icon;

  return (
    <PremiumBackground
      variant="dark"
      pattern="circles-gold"
      patternOpacity={0.06}
      showIsotipos
      isotipoVariant="gold"
      showVignette
      showTopBorder
      showGlow
      glowColor="gold"
      sectionClassName="min-h-[70vh] flex items-center bg-gradient-to-br from-foreground via-foreground to-primary/20"
    >
      <div className="container-soberana py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
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
            variants={staggerItem}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-background mb-4"
          >
            {program.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-xl md:text-2xl text-secondary font-medium mb-6"
          >
            {program.subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={staggerItem}
            className="text-lg text-background/70 mb-8 max-w-2xl"
          >
            {program.fullDescription}
          </motion.p>

          {/* Meta Info */}
          <motion.div variants={staggerItem} className="flex flex-wrap gap-4 mb-10">
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
          <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="cta"
              className="text-lg px-8 py-6"
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
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
