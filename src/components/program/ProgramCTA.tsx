import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

interface ProgramCTAProps {
  program: Program;
}

export const ProgramCTA = ({ program }: ProgramCTAProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = program.icon;

  return (
    <PremiumBackground
      variant="gradient"
      pattern="geometric"
      patternOpacity={0.08}
      showIsotipos
      isotipoVariant="white"
      showVignette
      showTopBorder
      showGlow
      glowColor="gold"
      isInView={isInView}
      sectionClassName="section-padding text-white"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            variants={scaleIn}
            className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-secondary/30 shadow-lg shadow-secondary/20"
          >
            <Icon className="w-10 h-10 text-secondary" />
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={staggerItem}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6"
          >
            Pronta para Transformar sua <span className="text-secondary">Advocacia</span>?
          </motion.h2>

          {/* Impact Phrase */}
          <motion.p variants={staggerItem} className="text-xl text-white/80 mb-8">
            {program.impactPhrase}
          </motion.p>

          {/* Price (if available) */}
          {program.price && (
            <motion.div variants={staggerItem} className="mb-8">
              <p className="text-white/60 text-sm mb-1">Investimento</p>
              <p className="text-4xl font-bold text-secondary">{program.price}</p>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button
              size="lg"
              variant="cta"
              className="text-lg px-10 py-7 shadow-xl shadow-secondary/30"
              asChild
            >
              <a href={program.ctaLink} target="_blank" rel="noopener noreferrer">
                {program.ctaText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-10 py-7"
              asChild
            >
              <a
                href="https://wa.me/55959103182?text=Olá! Tenho dúvidas sobre o programa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Tirar Dúvidas
              </a>
            </Button>
          </motion.div>

          {/* Trust Text */}
          <motion.p variants={staggerItem} className="mt-8 text-white/50 text-sm">
            Ao se inscrever, você terá suporte completo da equipe Soberana
          </motion.p>
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
