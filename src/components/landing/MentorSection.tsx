import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import mentorSobre from "@/assets/mentor-quem-sou.jpeg";
import { PremiumBackground, isotipoSGold } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem, slideFromLeft, slideFromRight } from "@/lib/animations";

export const MentorSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <PremiumBackground
      variant="dark"
      pattern="circles-marsala"
      patternOpacity={0.08}
      showIsotipos
      isotipoVariant="gold"
      showVignette
      showTopBorder
      isInView={isInView}
      sectionClassName="py-16 md:py-20 lg:py-24 xl:py-32"
    >
      <section id="sobre" ref={ref} className="container-soberana">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with Golden Frame and Signature */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
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
              <motion.div
                variants={staggerItem}
                className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 z-10"
              >
                <div className="bg-background/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border border-secondary/30">
                  <p className="font-signature text-3xl md:text-4xl text-secondary">
                    Fabiana Duarte
                  </p>
                  {/* Decorative underline */}
                  <div className="h-0.5 w-3/4 mx-auto mt-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
                </div>
              </motion.div>

              {/* Floating golden particles */}
              <div className="golden-particle absolute -top-3 -right-3 w-3 h-3" />
              <div className="golden-particle absolute -bottom-4 -left-4 w-2 h-2 animation-delay-300" />
              <div className="golden-particle absolute top-1/3 -left-2 w-2 h-2 animation-delay-500" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="order-1 lg:order-2"
          >
            {/* Isotipo S decoration */}
            <motion.div variants={staggerItem} className="flex mb-4">
              <img src={isotipoSGold} alt="" className="w-10 h-10 isotipo-glow" />
            </motion.div>

            <motion.span
              variants={staggerItem}
              className="inline-block text-secondary text-xs tracking-[0.25em] uppercase mb-6"
            >
              Sobre
            </motion.span>

            <motion.h2
              variants={staggerItem}
              className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-serif font-medium text-cream mb-6 lg:mb-8"
            >
              Quem <em className="italic text-secondary">Sou</em>
            </motion.h2>

            <motion.div variants={staggerItem} className="space-y-6 text-cream/80 leading-relaxed">
              <p>
                <span className="text-cream font-medium">Fabiana Duarte</span>, advogada,
                empresária jurídica e mentora de advogadas que desejam sair da estagnação,
                assumir a liderança dos seus escritórios e estruturar uma advocacia que gera
                autoridade, lucro e liberdade.
              </p>

              <p>
                Criei a{" "}
                <span className="text-secondary font-medium">Metodologia SOBERANA</span> para
                ajudar advogadas a romperem com o ciclo da informalidade e da sobrecarga, e
                construírem um negócio jurídico posicionado, estratégico e lucrativo — com
                clareza, visão e direção.
              </p>

              <p>
                Conduzo um ecossistema que inicia, acelera, escala e sustenta o crescimento das
                advogadas por meio de programas, imersões, mentorias e networking.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div variants={staggerItem} className="mt-10 pt-8 border-t border-secondary/30">
              <span className="inline-block text-cream/60 text-xs tracking-[0.2em] uppercase mb-4">
                Missão de{" "}
                <em className="italic normal-case text-sm text-secondary">Fabiana Duarte</em>
              </span>

              <p className="text-cream font-serif text-lg md:text-xl leading-relaxed italic">
                "🎯Ensino Advogadas a faturarem + 50k/mês sendo especialista em direito
                imobiliário, mesmo iniciando do zero."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PremiumBackground>
  );
};
