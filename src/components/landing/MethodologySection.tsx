import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Sparkles, Scale, Palette, Building2, Target, Users, TrendingUp, Zap, ChevronDown } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white.png";

const pillars = [
  {
    letter: "S",
    title: "SER",
    subtitle: "Clareza e Decisão",
    description: "Você sai da confusão interna para clareza, decisão e movimento real.",
    checkpoints: ["Para de se esconder", "Sabe para quem fala", "Começa a ser vista", "Leads começam a chegar"],
    icon: Sparkles,
  },
  {
    letter: "O",
    title: "ORDEM",
    subtitle: "Controle do Tempo",
    description: "Você sai do caos para controle do tempo e da rotina.",
    checkpoints: ["Para de trabalhar o dia inteiro sem resultado", "Sabe o que fazer toda semana", "Tem espaço mental para crescer"],
    icon: Scale,
  },
  {
    letter: "B",
    title: "BRANDING",
    subtitle: "Referência no Mercado",
    description: "Você deixa de parecer 'mais uma' e passa a ser reconhecida como referência.",
    checkpoints: ["Comunicação firme", "Autoridade percebida", "Mercado entende seu valor"],
    icon: Palette,
  },
  {
    letter: "E",
    title: "ESTRUTURA",
    subtitle: "Vendas com Clareza",
    description: "Você para de vender confuso e passa a vender com clareza e segurança.",
    checkpoints: ["Serviço bem definido", "Preço sustentado", "Menos desgaste em conversas"],
    icon: Building2,
  },
  {
    letter: "R",
    title: "RESULTADO",
    subtitle: "Faturamento Previsível",
    description: "Você sai da conversa solta para faturamento previsível.",
    checkpoints: ["Atendimento seguro", "Menos objeção", "Mais fechamentos"],
    icon: Target,
  },
  {
    letter: "A",
    title: "AÇÃO",
    subtitle: "Execução Consistente",
    description: "Você para de travar e entra em execução consistente.",
    checkpoints: ["Constância", "Confiança", "Ritmo de crescimento"],
    icon: Zap,
  },
  {
    letter: "N",
    title: "NEGÓCIO ESCALÁVEL",
    subtitle: "Base Sólida",
    description: "Você deixa o improviso e passa a ter base para continuar faturando.",
    checkpoints: ["Organização mínima", "Clareza do que funciona", "Próximos 90 dias planejado"],
    icon: TrendingUp,
  },
  {
    letter: "A",
    title: "AUDIÊNCIA",
    subtitle: "Conexão Estratégica",
    description: "Pare de postar sem retorno para audiência que confia e responde.",
    checkpoints: ["Conteúdo com intenção", "Tráfego pago estratégico", "Pessoas certas chegando"],
    impactNote: "Impacto direto no faturamento: Sem audiência, não há escala. Aqui se cria previsibilidade de oportunidades.",
    icon: Users,
  },
];

// Mobile Carousel Component with Accordion
interface MobileCarouselProps {
  pillars: typeof pillars;
  isInView: boolean;
}

const MobileCarousel = ({ pillars, isInView }: MobileCarouselProps) => {
  const autoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    containScroll: false,
  }, [autoplayRef.current]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Calculate relative position for scale/opacity effects
  const getSlideStyles = useCallback((index: number) => {
    if (!emblaApi) return { scale: 1, opacity: 1 };
    
    const slidesInView = emblaApi.slidesInView();
    const isActive = selectedIndex === index;
    const isAdjacent = Math.abs(selectedIndex - index) === 1 || 
      (selectedIndex === 0 && index === pillars.length - 1) ||
      (selectedIndex === pillars.length - 1 && index === 0);
    
    if (isActive) {
      return { scale: 1, opacity: 1 };
    } else if (isAdjacent) {
      return { scale: 0.9, opacity: 0.6 };
    }
    return { scale: 0.85, opacity: 0.4 };
  }, [emblaApi, selectedIndex, pillars.length]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Pause autoplay when card is expanded - only if emblaApi is ready
  useEffect(() => {
    if (!emblaApi) return;
    
    const autoplay = emblaApi.plugins()?.autoplay;
    if (!autoplay) return;
    
    if (expandedIndex !== null) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
  }, [expandedIndex, emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    
    const autoplay = emblaApi.plugins()?.autoplay;
    if (autoplay) autoplay.stop();
    
    emblaApi.scrollTo(index);
    
    // Resume after manual navigation
    setTimeout(() => {
      if (expandedIndex === null && autoplay) {
        autoplay.play();
      }
    }, 2000);
  }, [emblaApi, expandedIndex]);

  const toggleExpand = useCallback((index: number) => {
    setExpandedIndex(prev => prev === index ? null : index);
  }, []);

  return (
    <div className="md:hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="overflow-hidden"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y">
          {pillars.map((pillar, index) => {
            const styles = getSlideStyles(index);
            return (
              <motion.div 
                key={index} 
                className="flex-[0_0_85%] min-w-0 px-2"
                animate={{
                  scale: styles.scale,
                  opacity: styles.opacity,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.4 + index * 0.05,
                  }}
                  className="relative"
                >
                  <div 
                    className={`relative rounded-2xl bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 border transition-all duration-500 overflow-hidden ${
                      selectedIndex === index 
                        ? 'border-secondary/60 shadow-[0_8px_32px_rgba(166,144,97,0.35)]' 
                        : 'border-secondary/20'
                    }`}
                  >
                    {/* Card Header - Tappable */}
                    <button
                      onClick={() => toggleExpand(index)}
                      onTouchStart={() => {
                        const autoplay = emblaApi?.plugins()?.autoplay;
                        if (autoplay) autoplay.stop();
                      }}
                      className="w-full p-5 flex items-center gap-4 text-left active:bg-secondary/5 transition-colors"
                    >
                      {/* Letter badge */}
                      <motion.div 
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gold-light via-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl shadow-[0_4px_16px_rgba(166,144,97,0.5)]"
                        animate={selectedIndex === index ? {
                          boxShadow: [
                            "0 4px 16px rgba(166,144,97,0.5)",
                            "0 4px 24px rgba(166,144,97,0.7)",
                            "0 4px 16px rgba(166,144,97,0.5)"
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {pillar.letter}
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <pillar.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${
                            selectedIndex === index ? 'text-secondary' : 'text-secondary/60'
                          }`} />
                          <h3 className={`text-lg font-serif font-bold transition-colors duration-300 ${
                            selectedIndex === index ? 'text-primary-foreground' : 'text-primary-foreground/70'
                          }`}>{pillar.title}</h3>
                        </div>
                        <p className="text-xs text-secondary font-semibold uppercase tracking-wide">{pillar.subtitle}</p>
                      </div>

                      {/* Expand indicator */}
                      <motion.div
                        animate={{ 
                          rotate: expandedIndex === index ? 180 : 0,
                          scale: expandedIndex === index ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${
                          expandedIndex === index ? 'text-secondary' : 'text-secondary/50'
                        }`} />
                      </motion.div>
                    </button>

                    {/* Expandable Description */}
                    <AnimatePresence mode="wait">
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.div 
                            className="px-5 pb-5 pt-0"
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary/40 to-transparent mb-4" />
                            <p className="text-sm text-primary-foreground/90 leading-relaxed mb-4">
                              {pillar.description}
                            </p>
                            
                            {/* Checkpoints */}
                            <div className="space-y-2.5 mb-4">
                              {pillar.checkpoints.map((checkpoint, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  transition={{ 
                                    duration: 0.35, 
                                    delay: 0.2 + i * 0.12,
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 12
                                  }}
                                  className="flex items-center gap-3 group/check relative"
                                >
                                  {/* Glow effect behind checkbox */}
                                  <motion.div
                                    className="absolute -left-1 w-7 h-7 rounded-full bg-secondary/40 blur-md"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                      opacity: [0, 0.8, 0],
                                      scale: [0.5, 1.5, 1]
                                    }}
                                    transition={{ 
                                      duration: 0.6, 
                                      delay: 0.25 + i * 0.12,
                                      ease: "easeOut",
                                      type: "tween"
                                    }}
                                  />
                                  
                                  <motion.span 
                                    className="text-secondary text-sm flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center relative z-10"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ 
                                      scale: [0, 1.2, 1],
                                      rotate: [180, 0, 0],
                                      boxShadow: [
                                        "0 0 0 rgba(166,144,97,0)",
                                        "0 0 12px rgba(166,144,97,0.6)",
                                        "0 0 4px rgba(166,144,97,0.3)"
                                      ]
                                    }}
                                    transition={{ 
                                      duration: 0.5, 
                                      delay: 0.25 + i * 0.12,
                                      type: "tween"
                                    }}
                                  >
                                    ✔
                                  </motion.span>
                                  <motion.span 
                                    className="text-sm text-primary-foreground/80"
                                    initial={{ opacity: 0, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                                  >
                                    {checkpoint}
                                  </motion.span>
                                </motion.div>
                              ))}
                            </div>

                            {/* Impact Note for AUDIÊNCIA */}
                            {'impactNote' in pillar && pillar.impactNote && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="mt-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20"
                              >
                                <p className="text-xs text-secondary leading-relaxed">{pillar.impactNote}</p>
                              </motion.div>
                            )}
                            
                            {/* Decorative element */}
                            <motion.div 
                              className="mt-4 flex items-center gap-2"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-secondary to-secondary/50" />
                              <span className="text-xs text-secondary/70 uppercase tracking-widest">Pilar {index + 1} de 8</span>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Active glow effect */}
                    <AnimatePresence>
                      {selectedIndex === index && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-transparent to-secondary/5 pointer-events-none rounded-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
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
                  type: "tween"
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
                  <p className="text-xs text-secondary font-semibold mb-2 tracking-wide uppercase">{pillar.subtitle}</p>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed mb-3">{pillar.description}</p>
                  
                  {/* Checkpoints */}
                  <div className="space-y-1.5">
                    {pillar.checkpoints.map((checkpoint, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.8 + index * 0.15 + i * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        className="flex items-center gap-2 relative"
                      >
                        {/* Glow effect */}
                        <motion.div
                          className="absolute -left-0.5 w-5 h-5 rounded-full bg-secondary/30 blur-sm"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={isInView ? { 
                            opacity: [0, 0.7, 0],
                            scale: [0.5, 1.3, 1]
                          } : {}}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.85 + index * 0.15 + i * 0.1,
                            ease: "easeOut",
                            type: "tween"
                          }}
                        />
                        <motion.span 
                          className="text-secondary text-xs w-4 h-4 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 relative z-10"
                          initial={{ scale: 0 }}
                          animate={isInView ? { 
                            scale: [0, 1.15, 1],
                            boxShadow: [
                              "0 0 0 rgba(166,144,97,0)",
                              "0 0 8px rgba(166,144,97,0.5)",
                              "0 0 2px rgba(166,144,97,0.2)"
                            ]
                          } : {}}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.85 + index * 0.15 + i * 0.1,
                            type: "tween"
                          }}
                        >
                          ✔
                        </motion.span>
                        <span className="text-xs text-primary-foreground/70">{checkpoint}</span>
                      </motion.div>
                    ))}
                  </div>
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
                  <p className="text-xs text-secondary font-semibold mb-2 tracking-wide uppercase">{pillar.subtitle}</p>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed mb-3">{pillar.description}</p>
                  
                  {/* Checkpoints */}
                  <div className="space-y-1.5">
                    {pillar.checkpoints.map((checkpoint, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ 
                          duration: 0.4, 
                          delay: 1.1 + index * 0.15 + i * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        className="flex items-center gap-2 relative"
                      >
                        {/* Glow effect */}
                        <motion.div
                          className="absolute -left-0.5 w-5 h-5 rounded-full bg-secondary/30 blur-sm"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={isInView ? { 
                            opacity: [0, 0.7, 0],
                            scale: [0.5, 1.3, 1]
                          } : {}}
                          transition={{ 
                            duration: 0.5, 
                            delay: 1.15 + index * 0.15 + i * 0.1,
                            ease: "easeOut",
                            type: "tween"
                          }}
                        />
                        <motion.span 
                          className="text-secondary text-xs w-4 h-4 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 relative z-10"
                          initial={{ scale: 0 }}
                          animate={isInView ? { 
                            scale: [0, 1.15, 1],
                            boxShadow: [
                              "0 0 0 rgba(166,144,97,0)",
                              "0 0 8px rgba(166,144,97,0.5)",
                              "0 0 2px rgba(166,144,97,0.2)"
                            ]
                          } : {}}
                          transition={{ 
                            duration: 0.4, 
                            delay: 1.15 + index * 0.15 + i * 0.1,
                            type: "tween"
                          }}
                        >
                          ✔
                        </motion.span>
                        <span className="text-xs text-primary-foreground/70">{checkpoint}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Impact Note for AUDIÊNCIA */}
                  {'impactNote' in pillar && pillar.impactNote && (
                    <div className="mt-3 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                      <p className="text-xs text-secondary leading-relaxed">{pillar.impactNote}</p>
                    </div>
                  )}
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