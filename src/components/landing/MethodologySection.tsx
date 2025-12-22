import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Sparkles, Scale, Palette, Building2, Target, Users, TrendingUp, Zap, ChevronDown } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white.png";

const pillars = [
  {
    letter: "S",
    title: "SER",
    subtitle: "Identidade Autêntica",
    description: "Descubra e posicione sua essência única como diferencial competitivo no mercado jurídico",
    icon: Sparkles,
  },
  {
    letter: "O",
    title: "Ordem Interna e Externa",
    subtitle: "Equilíbrio Integral",
    description: "Alinhe sua vida pessoal e profissional para uma advocacia sustentável e próspera",
    icon: Scale,
  },
  {
    letter: "B",
    title: "Branding",
    subtitle: "Marca Pessoal de Autoridade",
    description: "Construa uma imagem magnética que atrai clientes ideais naturalmente",
    icon: Palette,
  },
  {
    letter: "E",
    title: "Estrutura",
    subtitle: "Base Sólida",
    description: "Implemente sistemas e processos que libertam seu tempo para o que realmente importa",
    icon: Building2,
  },
  {
    letter: "R",
    title: "Resultados",
    subtitle: "Performance Extraordinária",
    description: "Transforme esforço em conquistas mensuráveis e faturamento consistente",
    icon: Target,
  },
  {
    letter: "A",
    title: "Audiência",
    subtitle: "Conexão Estratégica",
    description: "Construa uma comunidade engajada que confia e indica seus serviços",
    icon: Users,
  },
  {
    letter: "N",
    title: "Negócio Escalável",
    subtitle: "Crescimento Sustentável",
    description: "Desenvolva um modelo que cresce sem multiplicar suas horas de trabalho",
    icon: TrendingUp,
  },
  {
    letter: "A",
    title: "Ação",
    subtitle: "Execução Implacável",
    description: "Saia do planejamento para a implementação com disciplina e consistência",
    icon: Zap,
  },
];

// Mobile Carousel Component with Accordion
interface MobileCarouselProps {
  pillars: typeof pillars;
  isInView: boolean;
}

const MobileCarousel = ({ pillars, isInView }: MobileCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    containScroll: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="md:hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="overflow-hidden"
        ref={emblaRef}
      >
        <div className="flex">
          {pillars.map((pillar, index) => (
            <div 
              key={index} 
              className="flex-[0_0_85%] min-w-0 px-2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.4 + index * 0.05,
                }}
                className="relative"
              >
                <div 
                  className={`relative rounded-2xl bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 border transition-all duration-300 overflow-hidden ${
                    selectedIndex === index 
                      ? 'border-secondary/60 shadow-[0_8px_32px_rgba(166,144,97,0.3)]' 
                      : 'border-secondary/30'
                  }`}
                >
                  {/* Card Header - Tappable */}
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full p-5 flex items-center gap-4 text-left"
                  >
                    {/* Letter badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gold-light via-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl shadow-[0_4px_16px_rgba(166,144,97,0.5)]">
                      {pillar.letter}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <pillar.icon className="w-5 h-5 text-secondary flex-shrink-0" />
                        <h3 className="text-lg font-serif font-bold text-primary-foreground">{pillar.title}</h3>
                      </div>
                      <p className="text-xs text-secondary font-semibold uppercase tracking-wide">{pillar.subtitle}</p>
                    </div>

                    {/* Expand indicator */}
                    <motion.div
                      animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-secondary/70" />
                    </motion.div>
                  </button>

                  {/* Expandable Description */}
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary/30 to-transparent mb-4" />
                          <p className="text-sm text-primary-foreground/85 leading-relaxed">
                            {pillar.description}
                          </p>
                          {/* Decorative element */}
                          <div className="mt-4 flex items-center gap-2">
                            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-secondary to-secondary/50" />
                            <span className="text-xs text-secondary/70 uppercase tracking-widest">Pilar {index + 1} de 8</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active glow effect */}
                  {selectedIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-secondary/5 pointer-events-none rounded-2xl" />
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pagination Dots */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex justify-center gap-2 mt-6"
      >
        {pillars.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              selectedIndex === index 
                ? 'w-8 h-2 bg-secondary' 
                : 'w-2 h-2 bg-secondary/40 hover:bg-secondary/60'
            }`}
            aria-label={`Ir para pilar ${index + 1}`}
          />
        ))}
      </motion.div>

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-center text-xs text-primary-foreground/50 mt-3"
      >
        Deslize para navegar • Toque para expandir
      </motion.p>
    </div>
  );
};

export const MethodologySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metodologia" ref={ref} className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Circle Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url(${patternCirclesWhite})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      {/* Isotipo White - decorative corners */}
      <div className="absolute top-16 left-12 opacity-[0.15] hidden lg:block animate-float-slow">
        <img src={isotipoWhite} alt="" className="w-28 h-28" loading="lazy" width={112} height={112} />
      </div>
      <div className="absolute bottom-16 right-12 opacity-[0.15] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoWhite} alt="" className="w-24 h-24" loading="lazy" width={96} height={96} />
      </div>

      {/* Golden glows - reduced on mobile */}
      <div className="absolute top-1/4 left-0 w-64 md:w-96 h-64 md:h-96 rounded-full bg-secondary/10 md:bg-secondary/15 blur-2xl md:blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full bg-secondary/10 md:bg-secondary/15 blur-2xl md:blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-secondary/5 md:bg-secondary/10 blur-2xl md:blur-3xl" />

      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.2)_100%)]" />

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

      <div className="container-soberana relative z-10">
        {/* Header */}
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

          <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
            <span className="text-sm font-medium tracking-wide">A Metodologia</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
            Os 8 Pilares da{" "}
            <span className="text-secondary">Advogada Soberana</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Um framework completo e testado para transformar sua advocacia em um negócio próspero.
          </p>
        </motion.div>

        {/* SOBERANA Letters Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex flex-wrap justify-center items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-12 py-8"
        >
          {/* Floating particles container - reduced on mobile */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-secondary/60 will-change-transform"
                style={{
                  left: `${10 + (i * 7)}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Letters */}
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.08, type: "spring", stiffness: 200 }}
              className="relative group"
            >
              <motion.span 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-secondary to-secondary/80 drop-shadow-[0_0_12px_rgba(166,144,97,0.5)] cursor-default transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(166,144,97,0.8)]"
                whileHover={{ scale: 1.08, y: -3 }}
              >
                {pillar.letter}
              </motion.span>
              {/* Individual letter glow - lighter on mobile */}
              <div className="absolute inset-0 bg-secondary/15 blur-lg sm:blur-xl -z-10 group-hover:bg-secondary/30 transition-colors duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Carousel with Accordion */}
        <MobileCarousel pillars={pillars} isInView={isInView} />

        {/* Desktop Cards - First Row (4 cards) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {pillars.slice(0, 4).map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: 0.4 + index * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="relative group perspective-1000"
            >
              <div className="relative p-7 rounded-2xl bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 border border-secondary/30 hover:border-secondary/60 transition-all duration-500 h-full overflow-hidden group-hover:shadow-[0_20px_50px_rgba(166,144,97,0.3)]">
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                {/* Card glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Letter badge with pulse animation */}
                <motion.div 
                  className="absolute -top-4 -left-2 w-12 h-12 rounded-full bg-gradient-to-br from-gold-light via-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl shadow-[0_4px_20px_rgba(166,144,97,0.5)]"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  animate={isInView ? {
                    boxShadow: [
                      "0 4px 20px rgba(166,144,97,0.5)",
                      "0 4px 30px rgba(166,144,97,0.8)",
                      "0 4px 20px rgba(166,144,97,0.5)"
                    ]
                  } : {}}
                  transition={{ 
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {pillar.letter}
                </motion.div>
                
                <div className="pt-6 relative z-10">
                  {/* Icon with animated entrance */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.6 + index * 0.15,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="mb-4"
                  >
                    <pillar.icon className="w-10 h-10 text-secondary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                  </motion.div>
                  
                  <h3 className="text-xl font-serif font-bold mb-1 text-primary-foreground group-hover:text-secondary transition-colors duration-300">{pillar.title}</h3>
                  <p className="text-sm text-secondary font-semibold mb-3 tracking-wide uppercase">{pillar.subtitle}</p>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed">{pillar.description}</p>
                </div>

                {/* Decorative corner with animation */}
                <motion.div 
                  className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-secondary/20 to-transparent rounded-tl-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.2, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop Cards - Second Row (4 cards) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.slice(4).map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: 0.7 + index * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="relative group perspective-1000"
            >
              <div className="relative p-7 rounded-2xl bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 border border-secondary/30 hover:border-secondary/60 transition-all duration-500 h-full overflow-hidden group-hover:shadow-[0_20px_50px_rgba(166,144,97,0.3)]">
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                {/* Card glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Letter badge with pulse animation */}
                <motion.div 
                  className="absolute -top-4 -left-2 w-12 h-12 rounded-full bg-gradient-to-br from-gold-light via-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl shadow-[0_4px_20px_rgba(166,144,97,0.5)]"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  animate={isInView ? {
                    boxShadow: [
                      "0 4px 20px rgba(166,144,97,0.5)",
                      "0 4px 30px rgba(166,144,97,0.8)",
                      "0 4px 20px rgba(166,144,97,0.5)"
                    ]
                  } : {}}
                  transition={{ 
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {pillar.letter}
                </motion.div>
                
                <div className="pt-6 relative z-10">
                  {/* Icon with animated entrance */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.9 + index * 0.15,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="mb-4"
                  >
                    <pillar.icon className="w-10 h-10 text-secondary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                  </motion.div>
                  
                  <h3 className="text-xl font-serif font-bold mb-1 text-primary-foreground group-hover:text-secondary transition-colors duration-300">{pillar.title}</h3>
                  <p className="text-sm text-secondary font-semibold mb-3 tracking-wide uppercase">{pillar.subtitle}</p>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed">{pillar.description}</p>
                </div>

                {/* Decorative corner with animation */}
                <motion.div 
                  className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-secondary/20 to-transparent rounded-tl-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.2, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            <div className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-serif">
                <span className="text-shimmer-gold font-bold">S.O.B.E.R.A.N.A.</span>
              </p>
              <p className="text-primary-foreground/70 mt-2">O caminho para a sua transformação</p>
            </div>

            <motion.a
              href="#jornada"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="cta-premium inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-10 py-5 rounded-lg text-lg font-semibold uppercase tracking-wider transition-all duration-300"
            >
              Conhecer os Programas
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </section>
  );
};