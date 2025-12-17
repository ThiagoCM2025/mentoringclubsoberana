import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white.png";

const testimonials = [
  {
    name: "Dra. Maria Clara",
    role: "Advogada Trabalhista",
    location: "São Paulo, SP",
    content: "Antes da mentoria, eu trabalhava 14 horas por dia e mal conseguia pagar as contas. Hoje, faturo 3x mais trabalhando menos da metade do tempo. A metodologia Soberana mudou minha vida.",
    rating: 5,
    result: "Faturamento 3x maior",
  },
  {
    name: "Dra. Juliana Santos",
    role: "Advogada Civilista",
    location: "Rio de Janeiro, RJ",
    content: "Eu tinha vergonha de cobrar o que meu trabalho valia. A Fabiana me ajudou a entender meu valor e a construir uma marca forte. Meus honorários triplicaram em 6 meses.",
    rating: 5,
    result: "Honorários 3x maiores",
  },
  {
    name: "Dra. Fernanda Lima",
    role: "Advogada Previdenciarista",
    location: "Belo Horizonte, MG",
    content: "O curso Soberana me deu clareza sobre o que eu precisava fazer. Saí da operação e hoje tenho uma equipe que trabalha para mim. Finalmente sou CEO do meu escritório.",
    rating: 5,
    result: "Equipe estruturada",
  },
  {
    name: "Dra. Patricia Oliveira",
    role: "Advogada Tributarista",
    location: "Curitiba, PR",
    content: "Participei do Small Group e foi transformador. Além do conteúdo incrível, fiz conexões valiosas com outras advogadas. Indicações que vieram daí já pagaram o investimento.",
    rating: 5,
    result: "Networking valioso",
  },
];

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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

      {/* Isotipo White - corners */}
      <div className="absolute top-16 left-12 opacity-[0.18] hidden lg:block animate-float-slow">
        <img src={isotipoWhite} alt="" className="w-28 h-28" />
      </div>
      <div className="absolute bottom-16 right-12 opacity-[0.18] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoWhite} alt="" className="w-24 h-24" />
      </div>

      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.15)_100%)]" />

      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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
          
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30 mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-6">
            Histórias de{" "}
            <span className="text-secondary">Transformação</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Advogadas reais que transformaram suas carreiras com a metodologia Soberana.
          </p>
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="relative bg-cream rounded-2xl p-8 md:p-12 shadow-2xl">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-secondary/30" />
            
            <div className="relative">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                ))}
              </div>

              <p className="text-xl md:text-2xl font-serif text-foreground mb-8 leading-relaxed">
                "{testimonials[activeIndex].content}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{testimonials[activeIndex].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</p>
                  <p className="text-xs text-muted-foreground">{testimonials[activeIndex].location}</p>
                </div>
                <div className="px-4 py-2 bg-secondary/10 rounded-full">
                  <p className="text-sm font-medium text-secondary">{testimonials[activeIndex].result}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-secondary hover:text-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex ? "w-8 bg-secondary" : "bg-primary-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-secondary hover:text-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "98%", label: "Satisfação" },
            { value: "+500", label: "Mentoradas" },
            { value: "3x", label: "Aumento Médio" },
            { value: "4.9", label: "Avaliação" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-serif font-bold text-secondary">{stat.value}</p>
              <p className="text-sm text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
