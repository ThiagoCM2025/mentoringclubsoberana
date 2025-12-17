import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import mentorFabiana from "@/assets/mentor-fabiana.jpeg";

export const MentorSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="sobre" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container-soberana">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with Signature */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              <img
                src={mentorFabiana}
                alt="Fabiana Duarte - Mentora para Advogadas"
                className="w-full rounded-lg shadow-elegant"
              />
              
              {/* Handwritten Signature Overlay */}
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-background p-4 rounded-lg shadow-lg">
                <p className="font-serif italic text-2xl md:text-3xl text-secondary">
                  Fabiana Duarte
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-block text-muted-foreground text-xs tracking-[0.25em] uppercase mb-6">
              Sobre
            </span>
            
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-8">
              Quem <em className="italic">Sou</em>
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                <span className="text-foreground font-medium">Fabiana Duarte</span>, advogada, 
                empresária jurídica e mentora de advogadas que desejam sair da estagnação, 
                assumir a liderança dos seus escritórios e estruturar uma advocacia que gera 
                autoridade, lucro e liberdade.
              </p>
              
              <p>
                Criei a <span className="text-foreground font-medium">Metodologia SOBERANA</span> para 
                ajudar advogadas a romperem com o ciclo da informalidade e da sobrecarga, e 
                construírem um negócio jurídico posicionado, estratégico e lucrativo — com 
                clareza, visão e direção.
              </p>
              
              <p>
                Conduzo um ecossistema completo que inicia, acelera, escala e sustenta o 
                crescimento das advogadas por meio de programas, imersões, mentorias e networking.
              </p>
            </div>

            {/* Mission */}
            <div className="mt-10 pt-8 border-t border-border">
              <span className="inline-block text-muted-foreground text-xs tracking-[0.2em] uppercase mb-4">
                Missão de <em className="italic normal-case text-sm">Fabiana Duarte</em>
              </span>
              
              <p className="text-foreground font-serif text-lg md:text-xl leading-relaxed italic">
                "Guiar advogadas a assumirem sua verdadeira identidade como líderes de negócios 
                jurídicos, rompendo a estagnação e estruturando uma advocacia posicionada, 
                lucrativa e estratégica, por meio de uma mentoria que une técnica, visão 
                empresarial e poder de decisão."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
