import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white.png";

export const DuvidaCTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-primary relative overflow-hidden">
      {/* Circle Pattern Background - White */}
      <div 
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url(${patternCirclesWhite})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      {/* Isotipo White - centered behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.20] animate-pulse-slow">
        <img src={isotipoWhite} alt="" className="w-56 h-56" />
      </div>

      {/* Glow around button area */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-white/8 blur-3xl rounded-full" />

      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Isotipo S decoration */}
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <img src={isotipoSWhite} alt="" className="w-10 h-10 isotipo-glow-white" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">
            Ainda está em dúvida sobre qual o{" "}
            <span className="text-secondary">melhor caminho</span> para você?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Fale agora com o meu suporte e receba uma orientação personalizada 
            para o seu momento atual na advocacia.
          </p>
          <Button
            asChild
            size="lg"
            className="cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg group"
          >
            <a
              href="https://wa.me/5511959103182?text=Olá! Estou em dúvida sobre qual programa escolher e gostaria de uma orientação."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Falar com Suporte Soberana
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
