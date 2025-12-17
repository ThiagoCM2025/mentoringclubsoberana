import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star, TrendingUp } from "lucide-react";
import { Program } from "@/data/programs";

interface ProgramTestimonialsProps {
  program: Program;
}

export const ProgramTestimonials = ({ program }: ProgramTestimonialsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (program.testimonials.length === 0) return null;

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="container-soberana">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="badge-gold mb-4">Resultados Reais</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            O Que Dizem as{" "}
            <span className="text-primary">Advogadas Soberanas</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
              className="bg-card rounded-2xl p-8 border border-border relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Quote className="w-5 h-5 text-secondary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Result Badge */}
              {testimonial.result && (
                <div className="flex items-center gap-2 mb-4 bg-primary/10 px-3 py-2 rounded-lg w-fit">
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
