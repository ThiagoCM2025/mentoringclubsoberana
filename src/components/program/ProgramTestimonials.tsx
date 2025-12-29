import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star, TrendingUp } from "lucide-react";
import { Program } from "@/data/programs";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem, staggerItemScale } from "@/lib/animations";

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
      isotipoColor="white"
      showVignette
      vignetteIntensity={0.25}
      showGlow
      glowColor="marsala"
      showTopBorder
      showBottomBorder
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          className="text-center mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.span
            variants={staggerItem}
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4 border border-secondary/30"
          >
            Resultados Reais
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4"
          >
            O Que Dizem as{" "}
            <span className="text-secondary">Advogadas Soberanas</span>
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-primary-foreground/70 max-w-2xl mx-auto"
          >
            Histórias reais de advogadas que transformaram suas carreiras com este programa.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {program.testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={staggerItemScale}
              className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 border border-secondary/20 relative shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg">
                <Quote className="w-5 h-5 text-secondary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Result Badge */}
              {testimonial.result && (
                <div className="flex items-center gap-2 mb-4 bg-primary/10 px-3 py-2 rounded-lg w-fit border border-primary/20">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{testimonial.result}</span>
                </div>
              )}

              {/* Author */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.area}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
