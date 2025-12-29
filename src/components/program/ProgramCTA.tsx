import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/data/programs";

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
    <section ref={ref} className="section-padding bg-gradient-to-br from-primary via-primary to-foreground text-white relative overflow-hidden">
      {/* Golden top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      
      {/* Premium geometric pattern "Flower of Life" overlay */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url(${patternGeometricGold})`,
          backgroundSize: '300px 300px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
        }}
      />

      {/* Radial vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.35) 100%)'
        }}
      />

      {/* Floating Isotipos */}
      <motion.img 
        src={isotipoWhite}
        alt=""
        className="absolute top-20 left-10 md:left-20 w-16 md:w-24 h-auto opacity-[0.15] animate-float-slow pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 0.15, scale: 1 } : {}}
        transition={{ duration: 1.2 }}
      />
      <motion.img 
        src={isotipoWhite}
        alt=""
        className="absolute bottom-20 right-10 md:right-20 w-14 md:w-20 h-auto opacity-[0.12] animate-float-slow pointer-events-none"
        style={{ animationDelay: '1s' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 0.12, scale: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      <motion.img 
        src={isotipoWhite}
        alt=""
        className="absolute top-1/2 right-1/4 w-10 md:w-14 h-auto opacity-[0.06] animate-float-slow pointer-events-none hidden lg:block"
        style={{ animationDelay: '2s' }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.06 } : {}}
        transition={{ duration: 1, delay: 0.6 }}
      />

      {/* Intense central golden glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 0.35, scale: 1 } : {}}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary rounded-full blur-[180px]"
      />

      {/* Secondary glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.15 } : {}}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-secondary rounded-full blur-[100px]"
      />

      <div className="container-soberana relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-secondary/30 shadow-lg shadow-secondary/20"
          >
            <Icon className="w-10 h-10 text-secondary" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6"
          >
            Pronta para Transformar sua{" "}
            <span className="text-secondary">Advocacia</span>?
          </motion.h2>

          {/* Impact Phrase */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/80 mb-8"
          >
            {program.impactPhrase}
          </motion.p>

          {/* Price (if available) */}
          {program.price && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <p className="text-white/60 text-sm mb-1">Investimento</p>
              <p className="text-4xl font-bold text-secondary">{program.price}</p>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-10 py-7 shadow-xl shadow-secondary/30"
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
                href="https://wa.me/5511993563468?text=Olá! Tenho dúvidas sobre o programa"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Tirar Dúvidas
              </a>
            </Button>
          </motion.div>

          {/* Trust Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-white/50 text-sm"
          >
            Ao se inscrever, você terá suporte completo da equipe Soberana
          </motion.p>
        </div>
      </div>
    </section>
  );
};
