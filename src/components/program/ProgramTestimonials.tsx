import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star, TrendingUp } from "lucide-react";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ProgramTestimonialsProps {
  program: Program;
}

export const ProgramTestimonials = ({ program }: ProgramTestimonialsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (program.testimonials.length === 0) return null;

  return (
    <PremiumBackground
      variant="marsala"
      pattern="circles-white"
      patternOpacity={0.08}
      showIsotipos
      isotipoVariant="white"
      showVignette
      showGlow
      glowColor="gold"
      isInView={isInView}
      sectionClassName="section-padding"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.span
            variants={staggerItem}
            className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary/20 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4 border border-secondary/30"
          >
            Resultados Reais
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-3 sm:mb-4"
          >
            O Que Dizem as <span className="text-secondary">Advogadas Soberanas</span>
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-primary-foreground/70 max-w-2xl mx-auto text-sm sm:text-base"
          >
            Histórias reais de advogadas que transformaram suas carreiras com este programa.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto"
        >
          {program.testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              className="bg-background/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-secondary/20 relative shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-4 sm:mb-6 italic leading-relaxed text-sm sm:text-base">
                "{testimonial.content}"
              </p>

              {/* Result Badge */}
              {testimonial.result && (
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 bg-primary/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg w-fit border border-primary/20">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">{testimonial.result}</span>
                </div>
              )}

              {/* Author */}
              <div className="border-t border-border pt-3 sm:pt-4">
                <p className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.area}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
