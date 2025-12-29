import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";
import { staggerContainer, staggerItem, ctaButton } from "@/lib/animations";

// Premium visual assets
import patternGeometricGold from "@/assets/brand/pattern-geometric-gold.png";
import isotipoWhite from "@/assets/brand/isotipo-s-white.png";

interface ProgramCTAProps {
  program: Program;
}

export const ProgramCTA = ({ program }: ProgramCTAProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = program.icon;

  return (
    <section
      ref={ref}
      className="relative section-padding bg-gradient-to-b from-foreground via-foreground to-foreground/95 overflow-hidden"
    >
      {/* Golden top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

      {/* Geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url(${patternGeometricGold})`,
          backgroundSize: "500px 500px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />

      {/* Floating Isotipos */}
      <motion.img
        src={isotipoWhite}
        alt=""
        className="absolute top-16 right-24 w-16 md:w-20 h-auto animate-float-slow pointer-events-none hidden md:block"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.15 } : {}}
        transition={{ duration: 1 }}
      />
      <motion.img
        src={isotipoWhite}
        alt=""
        className="absolute bottom-20 left-20 w-14 md:w-18 h-auto animate-float-slow pointer-events-none hidden md:block"
        style={{ animationDelay: "1.8s" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.1 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Central golden glow - more intense */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container-soberana relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Icon */}
          <motion.div
            variants={staggerItem}
            className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-secondary/30 shadow-lg shadow-secondary/20"
          >
            <Icon className="w-10 h-10 text-secondary" />
          </motion.div>

          <motion.div variants={staggerItem}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-sm font-medium mb-6 border border-secondary/30">
              <Sparkles className="w-4 h-4" />
              Transforme sua advocacia agora
            </span>
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-background mb-6"
          >
            Pronta para Transformar sua{" "}
            <span className="text-secondary">Advocacia</span>?
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="text-lg md:text-xl text-background/70 mb-8 max-w-2xl mx-auto"
          >
            {program.impactPhrase}
          </motion.p>

          {/* Investment highlight */}
          {program.price && (
            <motion.div
              variants={staggerItem}
              className="mb-8 p-6 rounded-2xl bg-background/5 border border-secondary/30 backdrop-blur-sm max-w-md mx-auto"
            >
              <p className="text-background/60 text-sm mb-1">Investimento</p>
              <p className="text-2xl md:text-3xl font-bold text-secondary">
                {program.price}
              </p>
            </motion.div>
          )}

          <motion.div
            variants={ctaButton}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-10 py-7 text-lg group shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all duration-300"
              asChild
            >
              <a href={program.ctaLink} target="_blank" rel="noopener noreferrer">
                {program.ctaText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 text-background hover:bg-background/10 px-8 py-7 text-lg"
              asChild
            >
              <a
                href="https://wa.me/5511993563468?text=Olá! Quero saber mais sobre o programa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Tirar Dúvidas
              </a>
            </Button>
          </motion.div>

          {/* Trust badge */}
          <motion.p
            variants={staggerItem}
            className="mt-8 text-sm text-background/50"
          >
            ✓ Garantia de satisfação · ✓ Suporte exclusivo · ✓ Acesso imediato
          </motion.p>
        </motion.div>
      </div>

      {/* Golden bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </section>
  );
};
