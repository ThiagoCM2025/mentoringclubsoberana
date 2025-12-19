import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, Users, ThumbsUp, Award } from "lucide-react";
import patternWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-s-white.png";

const testimonials = [
  {
    name: "Dra. Amanda Costa",
    role: "Advogada Cível",
    location: "São Paulo, SP",
    content: "O Experience Start foi um divisor de águas na minha carreira. Saí de lá com um plano de ação claro e já implementei 80% das estratégias em apenas 30 dias. A Fabiana entrega muito mais do que promete!",
    result: "Faturamento +40% em 3 meses",
    rating: 5
  },
  {
    name: "Dra. Beatriz Mendes",
    role: "Advogada Trabalhista",
    location: "Campinas, SP",
    content: "A energia do evento presencial é completamente diferente. O networking foi incrível e o conteúdo extremamente prático. Fechei 3 parcerias estratégicas com advogadas que conheci lá!",
    result: "3 parcerias fechadas no evento",
    rating: 5
  },
  {
    name: "Dra. Carolina Souza",
    role: "Advogada Previdenciarista",
    location: "Ribeirão Preto, SP",
    content: "Investi no Experience Start quando estava completamente perdida na advocacia. Voltei com clareza, motivação e um passo a passo que me fez contratar minha primeira funcionária em 60 dias!",
    result: "Equipe contratada em 60 dias",
    rating: 5
  }
];

const stats = [
  { icon: ThumbsUp, value: "98%", label: "Recomendam" },
  { icon: Users, value: "+200", label: "Participantes" },
  { icon: Award, value: "4.9", label: "Avaliação" }
];

export const ExperienceTestimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 bg-primary overflow-hidden"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${patternWhite})`,
          backgroundSize: "300px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Decorative isotipos */}
      <motion.img
        src={isotipoWhite}
        alt=""
        className="absolute top-10 left-10 w-24 h-24 opacity-10"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.img
        src={isotipoWhite}
        alt=""
        className="absolute bottom-10 right-10 w-20 h-20 opacity-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-medium tracking-wider uppercase mb-4">
            Depoimentos Reais
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">
            O que dizem as advogadas que já participaram
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Resultados reais de profissionais que transformaram suas carreiras
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/20">
            {/* Quote icon */}
            <Quote className="absolute top-6 left-6 w-12 h-12 text-gold/30" />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>

            {/* Content */}
            <motion.p
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-lg md:text-xl text-white text-center leading-relaxed mb-8 italic"
            >
              "{currentTestimonial.content}"
            </motion.p>

            {/* Result badge */}
            <motion.div
              key={`result-${activeIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full text-gold font-semibold text-sm">
                <Award className="w-4 h-4" />
                {currentTestimonial.result}
              </span>
            </motion.div>

            {/* Author */}
            <motion.div
              key={`author-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-white text-xl font-bold">
                {currentTestimonial.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <h4 className="text-lg font-semibold text-white">
                {currentTestimonial.name}
              </h4>
              <p className="text-white/70 text-sm">
                {currentTestimonial.role} • {currentTestimonial.location}
              </p>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === activeIndex 
                        ? "bg-gold w-8" 
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <stat.icon className="w-5 h-5 text-gold" />
                <span className="text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </span>
              </div>
              <span className="text-white/70 text-sm">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
