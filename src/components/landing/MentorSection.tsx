import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import mentorSobre from "@/assets/mentor-sobre.jpg";

export const MentorSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="sobre" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container-soberana">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with Golden Frame and Signature */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              {/* Golden Frame */}
              <div className="golden-frame transition-all duration-500">
                {/* Decorative corners */}
                <div className="golden-corner golden-corner-tl" />
                <div className="golden-corner golden-corner-tr" />
                <div className="golden-corner golden-corner-bl" />
                <div className="golden-corner golden-corner-br" />
                
                <div className="golden-frame-inner">
                  <img
                    src={mentorSobre}
                    alt="Fabiana Duarte - Mentora para Advogadas"
                    className="w-full aspect-[3/4] object-cover object-top"
                  />
                  {/* Golden vignette overlay */}
                  <div className="golden-vignette" />
                </div>
              </div>
              
              {/* Handwritten Signature Overlay */}
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 z-10">
                <div className="bg-background/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border border-secondary/30">
                  <p className="font-signature text-3xl md:text-4xl text-secondary">
                    Fabiana Duarte
                  </p>
                  {/* Decorative underline */}
                  <div className="h-0.5 w-3/4 mx-auto mt-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
                </div>
              </div>
              
              {/* Floating golden particles */}
              <div className="golden-particle absolute -top-3 -right-3 w-3 h-3" />
              <div className="golden-particle absolute -bottom-4 -left-4 w-2 h-2 animation-delay-300" />
              <div className="golden-particle absolute top-1/3 -left-2 w-2 h-2 animation-delay-500" />
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
