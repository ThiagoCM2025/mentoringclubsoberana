import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Brain, TrendingUp, Users, Building2, Zap, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import patternGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-s-gold.png";

const pillars = [
  {
    number: 1,
    title: "MENTALIDADE",
    subtitle: "De Advogada Operacional a CEO",
    description: "O primeiro passo para faturar como uma empresa é parar de pensar como funcionária do seu próprio escritório. Vamos desbloquear a mentalidade de escala e a postura de liderança necessária para cobrar honorários de alto ticket com segurança.",
    highlights: [],
    icon: Brain,
  },
  {
    number: 2,
    title: "VENDAS E LUCRATIVIDADE",
    subtitle: "A Máquina de Fechamento",
    description: "Direito não é só petição, é negócio.",
    highlights: [
      "Funil de Prospecção: Como atrair o cliente certo para o Imobiliário.",
      "Precificação Estratégica: Pare de cobrar por \"tabela\" e aprenda a precificar pelo valor gerado.",
      "Scripts de Conversão: O que falar para quebrar objeções e converter consultas em contratos assinados."
    ],
    icon: TrendingUp,
  },
  {
    number: 3,
    title: "AUDIÊNCIA",
    subtitle: "Posicionamento de Autoridade",
    description: "Chega de ser a \"advogada técnica\" que ninguém entende.",
    highlights: [
      "Quebra do Perfil Técnico: Transforme seu Instagram em um ímã de clientes, falando a língua de quem busca o imobiliário.",
      "Produção de Conteúdo Estratégico: Como usar sua autoridade para educar o mercado e ser desejada antes mesmo da primeira reunião."
    ],
    icon: Users,
  },
  {
    number: 4,
    title: "TÉCNICA IMOBILIÁRIA",
    subtitle: "O Domínio do Mercado de Elite",
    description: "A base sólida para você nunca ter medo de nenhum caso.",
    highlights: [
      "Prática Consultiva e Extrajudicial: Onde o dinheiro \"grande\" está (Regularização, Contratos e Due Diligence).",
      "Direito Imobiliário na Veia: O conhecimento técnico necessário para você ser a especialista que resolve o que os outros não conseguem."
    ],
    icon: Building2,
  },
  {
    number: 5,
    title: "GESTÃO E IA",
    subtitle: "Acelerando a Entrega",
    description: "O segredo para faturar mais trabalhando menos horas.",
    highlights: [
      "IA Jurídica: Implementação de inteligência artificial para automação de peças e análises.",
      "Sistemas e Liderança: Como organizar seus fluxos e, quando chegar a hora, gerir uma equipe que sustenta o seu crescimento."
    ],
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

// Desktop Card Component
const DesktopPillarCard = ({ pillar, index }: { pillar: typeof pillars[0]; index: number }) => {
  const Icon = pillar.icon;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-black via-black/95 to-marsala-dark/10 hover:border-gold/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(166,144,97,0.15)]"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-marsala/5" />
      </div>

      <div className="relative p-5 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          {/* Number */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-gold/20">
            {pillar.number}
          </div>
          
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
            <Icon className="w-6 h-6 text-gold" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-playfair text-lg lg:text-xl xl:text-2xl font-bold text-cream mb-2 group-hover:text-gold-light transition-colors">
          {pillar.title}
        </h3>
        <p className="text-gold font-medium text-sm mb-4">
          {pillar.subtitle}
        </p>

        {/* Description */}
        <p className="text-cream/70 text-sm leading-relaxed mb-5">
          {pillar.description}
        </p>

        {/* Highlights */}
        {pillar.highlights.length > 0 && (
          <ul className="space-y-3 pt-4 border-t border-gold/10">
            {pillar.highlights.map((highlight, hIndex) => (
              <motion.li
                key={hIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + hIndex * 0.1 }}
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
      className="relative py-14 md:py-20 lg:py-24 xl:py-32 bg-black overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url(${patternGold})`,
            backgroundSize: '400px',
            backgroundRepeat: 'repeat',
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-gold/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-marsala/5 via-transparent to-transparent" />
        
        {/* Decorative Isotipo */}
        <img
          src={isotipoGold}
          alt=""
          className="absolute top-20 right-10 w-24 md:w-32 opacity-5"
        />
        <img
          src={isotipoGold}
          alt=""
          className="absolute bottom-20 left-10 w-20 md:w-28 opacity-5 rotate-12"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12 lg:mb-16 xl:mb-20"
        >
          <span className="inline-block text-gold text-sm font-medium tracking-wider uppercase mb-4">
            O Método Comprovado
          </span>
          
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-cream mb-4 max-w-4xl mx-auto leading-tight">
            Os 5 Pilares do Método Soberana:{" "}
            <span className="text-shimmer-gold">O Caminho para os +50k/mês</span>
          </h2>
          
          <p className="text-cream/60 text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
            Um sistema completo para transformar sua advocacia técnica em um negócio lucrativo e escalável.
          </p>
        </motion.div>

        {/* Mobile View - Carousel */}
        <div className="lg:hidden">
          <MobileCarousel />
        </div>

        {/* Desktop View - Grid */}
        <div className="hidden lg:block">
          {/* First Row - 3 Cards */}
          <div className="grid grid-cols-3 gap-4 lg:gap-5 xl:gap-6 mb-4 lg:mb-5 xl:mb-6">
            {pillars.slice(0, 3).map((pillar, index) => (
              <DesktopPillarCard key={pillar.number} pillar={pillar} index={index} />
            ))}
          </div>
          
          {/* Second Row - 2 Cards Centered */}
          <div className="grid grid-cols-2 gap-4 lg:gap-5 xl:gap-6 max-w-4xl mx-auto">
            {pillars.slice(3, 5).map((pillar, index) => (
              <DesktopPillarCard key={pillar.number} pillar={pillar} index={index + 3} />
            ))}
          </div>
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
