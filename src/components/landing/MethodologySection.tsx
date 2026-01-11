import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Brain, TrendingUp, Users, Building2, Zap, Target, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { staggerContainer, staggerItemScale } from "@/lib/animations";
import patternGold from "@/assets/brand/pattern-circles-gold.png";
import patternConnectedGold from "@/assets/brand/pattern-circles-connected-gold.png";
import patternGeometric from "@/assets/brand/pattern-geometric-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-s-gold.png";
import isotipoFramedGold from "@/assets/brand/isotipo-s-framed-gold-v2.png";

const pillars = [
  {
    number: 1,
    title: "BASE TÉCNICA ESSENCIAL",
    subtitle: "Preparação para entrar no jogo",
    description: "Fundamentos práticos e visão do Direito Imobiliário. Você aprenderá o essencial para atuar com segurança e domínio técnico desde o início.",
    highlights: [],
    icon: Brain,
  },
  {
    number: 2,
    title: "POSICIONAMENTO E AUTORIDADE",
    subtitle: "Autoimagem, nicho e diferencial",
    description: "Desenvolva a mentalidade para se destacar e ser reconhecida como referência no mercado imobiliário. Construa sua marca pessoal com propósito.",
    highlights: [],
    icon: Users,
  },
  {
    number: 3,
    title: "PROSPECÇÃO E CAPTAÇÃO",
    subtitle: "Como atrair clientes certos",
    description: "Aprenda a construir rede, usar o digital e aplicar estratégias práticas para atrair clientes qualificados de forma consistente.",
    highlights: [],
    icon: Target,
  },
  {
    number: 4,
    title: "COMUNICAÇÃO E VENDAS",
    subtitle: "Vendas com segurança",
    description: "Negociação, copywriting, oratória, reuniões, contorno de objeções e cobrança de honorários com confiança e profissionalismo.",
    highlights: [],
    icon: TrendingUp,
  },
  {
    number: 5,
    title: "GESTÃO E OPERAÇÃO LUCRATIVA",
    subtitle: "Processos e finanças",
    description: "Delegação, organização, seleção estratégica de causas e estruturação financeira para máxima lucratividade do seu escritório.",
    highlights: [],
    icon: Building2,
  },
  {
    number: 6,
    title: "ESCALABILIDADE E RECORRÊNCIA",
    subtitle: "Recorrência financeira",
    description: "Modelos de negócio, serviços recorrentes, uso de tecnologia e construção de autonomia para escalar seus resultados.",
    highlights: [],
    icon: Zap,
  },
];

// Mobile Carousel Component
const MobileCarousel = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "center",
      skipSnaps: false,
      containScroll: false,
    },
    [autoplayPlugin.current]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = () => {
    if (emblaApi) {
      autoplayPlugin.current.stop();
      emblaApi.scrollPrev();
    }
  };

  const scrollNext = () => {
    if (emblaApi) {
      autoplayPlugin.current.stop();
      emblaApi.scrollNext();
    }
  };

  const toggleExpand = (index: number) => {
    autoplayPlugin.current.stop();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"
        aria-label="Próximo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isExpanded = expandedIndex === index;
            const isSelected = selectedIndex === index;
            
            return (
              <div
                key={index}
                className="flex-[0_0_85%] min-w-0 px-2"
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1 : 0.9,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    relative overflow-hidden rounded-2xl border transition-all duration-300
                    ${isSelected 
                      ? 'border-gold/40 bg-gradient-to-br from-black via-black/95 to-marsala-dark/20 shadow-[0_0_30px_rgba(166,144,97,0.15)]' 
                      : 'border-gold/20 bg-black/80'
                    }
                  `}
                >
                  {/* Card Header */}
                  <div className="p-5">
                    {/* Number Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-black font-bold text-lg">
                        {pillar.number}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="font-playfair text-xl font-bold text-cream mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-gold text-sm font-medium mb-3">
                      {pillar.subtitle}
                    </p>

                    {/* Description Preview */}
                    <p className="text-cream/70 text-sm leading-relaxed line-clamp-3">
                      {pillar.description}
                    </p>

                    {/* Expand Button */}
                    {(pillar.highlights.length > 0 || pillar.description.length > 100) && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="flex items-center gap-2 mt-4 text-gold text-sm font-medium hover:text-gold-light transition-colors"
                      >
                        <span>{isExpanded ? 'Ver menos' : 'Ver detalhes'}</span>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-gold/10 pt-4">
                      {pillar.highlights.length > 0 && (
                        <ul className="space-y-3">
                          {pillar.highlights.map((highlight, hIndex) => (
                            <li key={hIndex} className="flex items-start gap-2">
                              <span className="text-gold mt-1.5 text-xs">✦</span>
                              <span className="text-cream/80 text-sm leading-relaxed">
                                {highlight}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {pillars.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              selectedIndex === index 
                ? 'w-6 bg-gold' 
                : 'bg-gold/30 hover:bg-gold/50'
            }`}
            aria-label={`Ir para pilar ${index + 1}`}
          />
        ))}
      </div>

      {/* Current Pillar Indicator */}
      <p className="text-center text-cream/50 text-sm mt-3">
        Pilar {selectedIndex + 1} de {pillars.length}
      </p>
    </div>
  );
};

// Highlight item variant for staggered animation inside cards
const highlightItemVariant = {
  hidden: { opacity: 0, x: -15 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

// Desktop Card Component
const DesktopPillarCard = ({ pillar }: { pillar: typeof pillars[0] }) => {
  const Icon = pillar.icon;

  return (
    <motion.div
      variants={staggerItemScale}
      className="group relative overflow-hidden rounded-2xl transition-all duration-600"
    >
      {/* Animated Border Gradient */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-gold/20 via-transparent to-marsala/20 group-hover:from-gold/50 group-hover:via-gold/20 group-hover:to-marsala/30 transition-all duration-600">
        <div className="absolute inset-[1px] rounded-2xl bg-black/90 backdrop-blur-sm" />
      </div>
      
      {/* Glassmorphism Background */}
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] backdrop-blur-[2px]" />
      
      {/* Inner Glow on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-gold/[0.04] to-marsala/[0.06]" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/30" />
        {/* Shimmer Effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(166, 144, 97, 0.15) 50%, transparent 60%)',
          }}
        />
      </div>
      
      {/* Card Shadow on Hover */}
      <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-600 blur-xl bg-gold/10 -z-10" />

      <div className="relative p-5 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          {/* Number */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-gold/20 group-hover:shadow-[0_0_25px_rgba(166,144,97,0.5)] group-hover:scale-105 transition-all duration-500">
            {pillar.number}
          </div>
          
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/40 group-hover:shadow-[0_0_20px_rgba(166,144,97,0.35)] transition-all duration-500">
            <Icon className="w-6 h-6 text-gold group-hover:text-gold-light transition-colors duration-500" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-playfair text-lg lg:text-xl xl:text-2xl font-bold text-cream mb-2 group-hover:text-gold-light transition-colors duration-500">
          {pillar.title}
        </h3>
        <p className="text-gold font-medium text-sm mb-4 group-hover:text-gold-light/90 transition-colors duration-500">
          {pillar.subtitle}
        </p>

        {/* Decorative Line */}
        <div className="w-12 h-px bg-gradient-to-r from-gold/40 to-transparent mb-4 group-hover:w-20 transition-all duration-500" />

        {/* Description */}
        <p className="text-cream/70 text-sm leading-relaxed mb-5 group-hover:text-cream/80 transition-colors duration-500">
          {pillar.description}
        </p>

        {/* Highlights with Staggered Animation */}
        {pillar.highlights.length > 0 && (
          <ul className="space-y-3 pt-4 border-t border-gold/10">
            {pillar.highlights.map((highlight, hIndex) => (
              <motion.li
                key={hIndex}
                variants={highlightItemVariant}
                custom={hIndex}
                className="flex items-start gap-3"
              >
                <span className="text-gold mt-1 text-sm">✦</span>
                <span className="text-cream/80 text-sm leading-relaxed">
                  {highlight}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

const MethodologySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="metodologia"
      ref={sectionRef}
      className="relative py-14 md:py-20 lg:py-24 xl:py-32 overflow-hidden scroll-mt-24"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0506 30%, #0d0709 50%, #0a0506 70%, #000000 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Border Gradient - More Elegant */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        
        {/* New Geometric Pattern - Primary */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url(${patternGeometric})`,
            backgroundSize: '500px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Pattern Overlay - Original circles - lighter */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url(${patternGold})`,
            backgroundSize: '400px',
            backgroundRepeat: 'repeat',
          }}
        />
        
        {/* Pattern Overlay - Connected circles - lighter */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url(${patternConnectedGold})`,
            backgroundSize: '600px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Central Golden Spotlight */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(166, 144, 97, 0.08) 0%, transparent 60%)',
          }}
        />
        
        {/* Secondary Warm Glow - Marsala tint */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 30% 80%, rgba(139, 0, 39, 0.06) 0%, transparent 50%)',
          }}
        />
        
        {/* Tertiary Accent Glow */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(166, 144, 97, 0.05) 0%, transparent 50%)',
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-gold/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-marsala/8 via-transparent to-transparent" />
        
        {/* Radial Vignette - Softer */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        
        {/* Decorative Framed Isotipo - Top Right */}
        <motion.img
          src={isotipoFramedGold}
          alt=""
          className="absolute top-16 right-8 lg:right-16 w-20 md:w-28 lg:w-32 hidden md:block animate-float-slow"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.18, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        
        {/* Decorative Framed Isotipo - Bottom Left */}
        <motion.img
          src={isotipoFramedGold}
          alt=""
          className="absolute bottom-20 left-8 lg:left-16 w-16 md:w-24 lg:w-28 hidden md:block animate-float-slow"
          style={{ animationDelay: '2s' }}
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={isInView ? { opacity: 0.14, scale: 1, rotate: -8 } : {}}
          transition={{ duration: 1.2, delay: 0.6 }}
        />
        
        {/* Small Decorative Isotipo - Simple gold */}
        <img
          src={isotipoGold}
          alt=""
          className="absolute top-1/3 left-6 w-12 md:w-16 opacity-[0.10] rotate-12 hidden lg:block"
        />
        <img
          src={isotipoGold}
          alt=""
          className="absolute bottom-1/3 right-6 w-10 md:w-14 opacity-[0.10] -rotate-6 hidden lg:block"
        />
        
        {/* Decorative Horizontal Lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
        
        {/* Bottom Border Gradient - More Elegant */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - Always Visible */}
        <div className="text-center mb-10 md:mb-12 lg:mb-16 xl:mb-20 relative z-20">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-gold text-sm font-medium tracking-wider uppercase mb-4"
          >
            O Método Comprovado
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-playfair text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-cream mb-4 max-w-4xl mx-auto leading-tight"
          >
            Pilares do Método Soberana:{" "}
            <span className="text-shimmer-gold">O Caminho para os +50k/mês</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-cream/60 text-sm md:text-base lg:text-lg max-w-2xl mx-auto"
          >
            Um sistema completo para transformar sua advocacia técnica em um negócio lucrativo e escalável.
          </motion.p>
        </div>

        {/* Mobile View - Carousel */}
        <div className="lg:hidden">
          <MobileCarousel />
        </div>

        {/* Desktop View - Grid with Staggered Animation */}
        <div className="hidden lg:block">
          {/* First Row - 3 Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-3 gap-4 lg:gap-5 xl:gap-6 mb-4 lg:mb-5 xl:mb-6"
          >
            {pillars.slice(0, 3).map((pillar) => (
              <DesktopPillarCard key={pillar.number} pillar={pillar} />
            ))}
          </motion.div>
          
          {/* Second Row - 3 Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ delayChildren: 0.3 }}
            className="grid grid-cols-3 gap-4 lg:gap-5 xl:gap-6"
          >
            {pillars.slice(3, 6).map((pillar) => (
              <DesktopPillarCard key={pillar.number} pillar={pillar} />
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10 md:mt-12 lg:mt-14 xl:mt-16"
        >
          <p className="text-cream/60 text-sm md:text-base mb-6">
            Pronta para implementar esses pilares na sua advocacia?
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-gold to-gold-light text-black font-semibold px-8 py-6 text-base hover:shadow-[0_0_30px_rgba(166,144,97,0.4)] transition-all duration-300"
            onClick={() => document.getElementById('jornada')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Conhecer a Jornada Soberana
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MethodologySection;
