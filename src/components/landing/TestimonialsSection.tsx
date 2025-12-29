import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumBackground, isotipoSWhite } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";

const testimonials = [
  {
    name: "Dra. Maria Clara",
    role: "Advogada Trabalhista",
    location: "São Paulo, SP",
    content:
      "Antes da mentoria, eu trabalhava 14 horas por dia e mal conseguia pagar as contas. Hoje, faturo 3x mais trabalhando menos da metade do tempo. A metodologia Soberana mudou minha vida.",
    rating: 5,
    result: "Faturamento 3x maior",
  },
  {
    name: "Dra. Juliana Santos",
    role: "Advogada Civilista",
    location: "Rio de Janeiro, RJ",
    content:
      "Eu tinha vergonha de cobrar o que meu trabalho valia. A Fabiana me ajudou a entender meu valor e a construir uma marca forte. Meus honorários triplicaram em 6 meses.",
    rating: 5,
    result: "Honorários 3x maiores",
  },
  {
    name: "Dra. Fernanda Lima",
    role: "Advogada Previdenciarista",
    location: "Belo Horizonte, MG",
    content:
      "O curso Soberana me deu clareza sobre o que eu precisava fazer. Saí da operação e hoje tenho uma equipe que trabalha para mim. Finalmente sou CEO do meu escritório.",
    rating: 5,
    result: "Equipe estruturada",
  },
  {
    name: "Dra. Patricia Oliveira",
    role: "Advogada Tributarista",
    location: "Curitiba, PR",
    content:
      "Participei do Small Group e foi transformador. Além do conteúdo incrível, fiz conexões valiosas com outras advogadas. Indicações que vieram daí já pagaram o investimento.",
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
    <PremiumBackground
      variant="marsala"
      pattern="circles-white"
      patternOpacity={0.12}
      showIsotipos
      isotipoVariant="white"
      showVignette
      isInView={isInView}
      sectionClassName="section-padding"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          {/* Isotipo S decoration */}
          <motion.div variants={staggerItem} className="flex justify-center mb-4">
            <img src={isotipoSWhite} alt="" className="w-10 h-10 isotipo-glow-white" />
          </motion.div>

          <motion.span
            variants={staggerItem}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30 mb-4"
          >
            Depoimentos
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-primary-foreground mb-6"
          >
            Histórias de <span className="text-secondary">Transformação</span>
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Advogadas reais que transformaram suas carreiras com a metodologia Soberana.
          </motion.p>
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="relative bg-cream rounded-2xl p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-secondary/30" />

            <div className="relative">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                ))}
              </div>

              <p className="text-lg md:text-xl lg:text-2xl font-serif text-foreground mb-6 lg:mb-8 leading-relaxed">
                "{testimonials[activeIndex].content}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonials[activeIndex].name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[activeIndex].role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonials[activeIndex].location}
                  </p>
                </div>
                <div className="px-4 py-2 bg-secondary/10 rounded-full">
                  <p className="text-sm font-medium text-secondary">
                    {testimonials[activeIndex].result}
                  </p>
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
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "98%", label: "Satisfação" },
            { value: "—", label: "Mentoradas" },
            { value: "3x", label: "Aumento Médio" },
            { value: "4.9", label: "Avaliação" },
          ].map((stat, index) => (
            <motion.div key={index} variants={staggerItem} className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-secondary">
                {stat.value}
              </p>
              <p className="text-sm text-primary-foreground/70">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
