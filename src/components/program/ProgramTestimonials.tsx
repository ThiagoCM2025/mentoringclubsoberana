import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star, TrendingUp } from "lucide-react";
import { Program } from "@/data/programs";

// Premium visual assets
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-s-white.png";

interface ProgramTestimonialsProps {
  program: Program;
}

export const ProgramTestimonials = ({ program }: ProgramTestimonialsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (program.testimonials.length === 0) return null;

  return (
    <section ref={ref} className="section-padding bg-primary relative overflow-hidden">
      {/* Premium pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url(${patternCirclesWhite})`,
          backgroundSize: '350px 350px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Radial vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.25) 100%)'
        }}
      />

      {/* Floating Isotipos */}
      <motion.img 
        src={isotipoWhite}
        alt=""
        className="absolute top-16 left-12 w-16 md:w-24 h-auto opacity-[0.12] animate-float-slow pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.12 } : {}}
        transition={{ duration: 1 }}
      />
      <motion.img 
        src={isotipoWhite}
        alt=""
        className="absolute bottom-16 right-12 w-14 md:w-20 h-auto opacity-[0.10] animate-float-slow pointer-events-none"
        style={{ animationDelay: '1.2s' }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.10 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
      />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />

      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4 border border-secondary/30">
            Resultados Reais
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            O Que Dizem as{" "}
            <span className="text-secondary">Advogadas Soberanas</span>
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            Histórias reais de advogadas que transformaram suas carreiras com este programa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {program.testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 * index }}
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
        </div>
      </div>
    </section>
  );
};
