import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Calendar, Clock, MapPin, CheckCircle2, Sparkles, Brain, Settings, Users, TrendingUp, Target, ArrowRight, Star, Crown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Footer } from "@/components/landing/Footer";
import { SoberanaLogoMark } from "@/components/landing/SoberanaLogoMark";
import { ExperienceExitPopup } from "@/components/landing/ExperienceExitPopup";
import { SectionSkeleton } from "@/components/landing/SectionSkeleton";
import { useUTMParams } from "@/hooks/useUTMParams";
import { trackCTAClick } from "@/components/Analytics";
import { useIsMobile, usePrefersReducedMotion } from "@/components/ui/optimized-image";

// Lazy load heavy components below the fold
const ExperienceFAQ = lazy(() => import("@/components/landing/ExperienceFAQ").then(m => ({ default: m.ExperienceFAQ })));
const ExperienceTestimonials = lazy(() => import("@/components/landing/ExperienceTestimonials").then(m => ({ default: m.ExperienceTestimonials })));

// Import brand assets - hero image is critical for LCP
import heroImage from "@/assets/experience-start-hero-premium.jpeg";

// Lazy load decorative assets (not critical for LCP)
const isotipoGold = "/assets/brand/isotipo-gold.png";
const isotipoSGold = "/assets/brand/isotipo-s-gold.png";
const patternGold = "/assets/brand/pattern-gold.png";
const patternCirclesGold = "/assets/brand/pattern-circles-gold.png";

// Countdown Hook
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const ExperienceStartLanding = () => {
  const heroRef = useRef(null);
  const problemRef = useRef(null);
  const experienceRef = useRef(null);
  const inviteRef = useRef(null);
  const pricingRef = useRef(null);
  
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Simplified inView detection - less resource intensive
  const heroInView = useInView(heroRef, { once: true, amount: 0.1 });
  const problemInView = useInView(problemRef, { once: true, amount: 0.1 });
  const experienceInView = useInView(experienceRef, { once: true, amount: 0.1 });
  const inviteInView = useInView(inviteRef, { once: true, amount: 0.1 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.1 });

  // Performance-optimized animation settings
  const shouldAnimate = !prefersReducedMotion && !isMobile;
  const animationDuration = shouldAnimate ? 0.6 : 0.3;
  const animationY = shouldAnimate ? 20 : 0;

  // Countdown para 17 de Janeiro de 2026 às 09:00 (horário de São Paulo)
  const eventDate = new Date('2026-01-17T09:00:00-03:00');
  const timeLeft = useCountdown(eventDate);

  // UTM Tracking
  const { buildUrlWithUTM } = useUTMParams();

  // Link de pagamento Kiwify com UTM
  const baseCtaUrl = "https://pay.kiwify.com.br/p3kpN7k";
  const ctaUrl = buildUrlWithUTM(baseCtaUrl);

  const programContent = [
    {
      icon: Target,
      title: "Raio-X completo da sua advocacia",
      description: "Identifique onde perde tempo e por que não gera resultado."
    },
    {
      icon: Brain,
      title: "Uso de IA na otimização da rotina",
      description: "Tecnologia para ganhar tempo."
    },
    {
      icon: Settings,
      title: "Implementação de sistema de gestão",
      description: "A base para o crescimento."
    },
    {
      icon: Users,
      title: "Posicionamento e redes sociais",
      description: "Seja vista como autoridade."
    },
    {
      icon: TrendingUp,
      title: "Fluxos de captação de clientes",
      description: "Como atrair leads qualificados."
    },
    {
      icon: Sparkles,
      title: "Estratégia de Precificação",
      description: "Como cobrar seus honorários com lucro."
    },
    {
      icon: Calendar,
      title: "Plano dos 90 dias",
      description: "Saia com o cronograma pronto para iniciar o ano no controle e com clareza."
    }
  ];

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Soberana Experience Start",
    "description": "Oficina presencial para advogadas reorganizarem sua advocacia e destravarem o crescimento em 2025.",
    "startDate": "2025-01-17T09:00:00-03:00",
    "endDate": "2025-01-17T17:00:00-03:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Espaço Mind",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "R. Abílio Soares, 607",
        "addressLocality": "Paraíso",
        "addressRegion": "SP",
        "addressCountry": "BR"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Soberana Mentoring Club"
    },
    "performer": {
      "@type": "Person",
      "name": "Fabiana Duarte"
    },
    "offers": {
      "@type": "Offer",
      "price": "299.00",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/LimitedAvailability",
      "validFrom": "2024-12-01"
    }
  };

  return (
    <div className="min-h-screen bg-background landing-page">
      <SEO
        title="Soberana Experience Start | Oficina Presencial para Advogadas em SP"
        description="Reorganize sua advocacia e destrave seu crescimento em 2025. Oficina 100% prática com Fabiana Soberana. 17 de Janeiro em São Paulo."
        keywords="oficina para advogadas, evento presencial advocacia, mentoria jurídica SP, networking advogadas, Fabiana Soberana, gestão advocacia"
        url="https://soberana.com.br/experience-start"
        image="https://soberana.com.br/og-experience-start.jpg"
        imageWidth={1200}
        imageHeight={630}
        twitterCard="summary_large_image"
        type="website"
        schema={eventSchema}
      />

      {/* Header Sticky Premium */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-secondary/20"
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
        <div className="container-soberana py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={isotipoSGold} alt="" className="w-6 h-6 opacity-80 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <p className="text-primary-foreground/90 text-xs sm:text-sm md:text-base font-medium">
                Apenas <strong className="text-secondary">12 vagas</strong> restantes
              </p>
            </div>
          </div>
          <Button 
            asChild 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs md:text-sm px-3 sm:px-4 md:px-6 cta-premium"
            onClick={() => trackCTAClick("header_cta")}
          >
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              GARANTA SUA VAGA
            </a>
          </Button>
        </div>
      </motion.header>

      {/* HERO SECTION - Premium Full Screen */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col bg-brand-black"
      >
        
        {/* ===== MOBILE: Layout Stacked (imagem acima + texto abaixo) ===== */}
        <div className="md:hidden flex flex-col min-h-screen">
          {/* Imagem da Fabiana - Altura controlada no mobile */}
          <div className="relative h-[45vh] w-full overflow-hidden flex-shrink-0">
            <img 
              src={heroImage}
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-[center_20%]"
            />
            {/* Gradiente inferior para transição suave */}
            <div 
              className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, hsl(var(--brand-black)) 0%, hsl(var(--brand-black) / 0.6) 40%, transparent 100%)'
              }}
              aria-hidden="true"
            />
          </div>
          
          {/* Conteúdo do texto abaixo da imagem - Mobile com fade-in */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-start px-4 py-4 bg-brand-black text-center"
          >
            {/* Badge de urgência */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-full mb-3 mx-auto"
            >
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs font-medium">EVENTO PRESENCIAL • DATA ÚNICA</span>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-3"
            >
              <SoberanaLogoMark variant="light" size="md" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-xl font-serif font-bold text-cream leading-tight mb-3"
            >
              SOBERANA{" "}
              <span className="text-shimmer-gold">EXPERIENCE</span>{" "}
              START
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-xs text-cream/90 mb-4 leading-relaxed"
            >
              Um encontro presencial para <strong className="text-cream">reorganizar a sua advocacia</strong> e destravar seu crescimento em 2025.
            </motion.p>

            {/* Countdown Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex justify-center gap-2 mb-4"
            >
              {[
                { value: timeLeft.days, label: 'DIAS' },
                { value: timeLeft.hours, label: 'HRS' },
                { value: timeLeft.minutes, label: 'MIN' },
                { value: timeLeft.seconds, label: 'SEG' }
              ].map((item, index) => (
                <div key={index} className="text-center bg-primary/60 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-secondary/20">
                  <div className="text-lg font-bold text-secondary">{String(item.value).padStart(2, '0')}</div>
                  <div className="text-[8px] text-cream/60 tracking-wide">{item.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Button Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mb-4"
            >
              <Button 
                asChild 
                size="lg"
                className="w-full cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-5 text-sm font-semibold uppercase tracking-wider"
                onClick={() => trackCTAClick("hero_cta_mobile")}
              >
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  GARANTA SUA VAGA AGORA
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </motion.div>

            {/* Event Info Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center items-center gap-3 text-cream/70 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-secondary" />
                <span>17 Jan 2025</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-secondary" />
                <span>São Paulo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-secondary" />
                <span>9h às 17h</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ===== DESKTOP: Layout Original com Overlay ===== */}
        <div className="hidden md:flex flex-col min-h-screen">
          {/* LQIP Placeholder */}
          <div 
            className="absolute inset-0 z-0 bg-gradient-to-b from-brand-black via-marsala/30 to-brand-black"
            aria-hidden="true"
          />
          
          {/* Background Image - Fabiana Premium */}
          <div 
            className="absolute inset-0 z-0"
            aria-hidden="true"
          >
            <img 
              src={heroImage}
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="async"
              sizes="100vw"
              className="w-full h-full object-cover object-top"
              style={{
                contentVisibility: 'auto',
                containIntrinsicSize: '100vw 100vh'
              }}
            />
          </div>
          
          {/* Premium gradient overlay for legibility */}
          <div 
            className="absolute inset-0 z-[1]"
            style={{
              background: `
                linear-gradient(to bottom, 
                  rgba(0,0,0,0.4) 0%, 
                  rgba(0,0,0,0.2) 30%, 
                  rgba(0,0,0,0.5) 60%, 
                  rgba(0,0,0,0.95) 100%
                )
              `
            }}
          />

          {/* Decorative golden circle pattern overlay */}
          <div 
            className="absolute inset-0 z-[2] opacity-10"
            style={{ 
              backgroundImage: `url(${patternCirclesGold})`, 
              backgroundSize: '200px' 
            }}
          />

          {/* Floating decorative isotipos */}
          {shouldAnimate && (
            <>
              <motion.img
                src={isotipoGold}
                alt=""
                loading="lazy"
                className="absolute right-12 top-1/4 w-48 opacity-10 animate-float-slow z-[3]"
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 0.1 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <motion.img
                src={isotipoSGold}
                alt=""
                loading="lazy"
                className="absolute left-12 bottom-1/3 w-24 opacity-8 animate-float-slow animation-delay-2000 z-[3]"
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 0.08 } : {}}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </>
          )}

          {/* Content - positioned at bottom like main page */}
          <div className="relative z-10 flex-1 flex flex-col justify-end pb-12 md:pb-16 pt-24">
          <div className="container-soberana">
            <div className="text-center max-w-4xl mx-auto w-full">
              {/* Badge de urgência */}
              <motion.div
                initial={{ opacity: 0, y: isMobile ? -5 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration }}
                className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-full mb-4"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">EVENTO PRESENCIAL • DATA ÚNICA</span>
              </motion.div>

              {/* Logo with Star */}
              <motion.div
                initial={{ opacity: 0, y: animationY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration, delay: isMobile ? 0.1 : 0.3 }}
                className="flex items-center justify-center gap-3 mb-4 sm:mb-6"
              >
                <SoberanaLogoMark variant="light" size="lg" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: animationY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration, delay: isMobile ? 0.15 : 0.4 }}
                className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-cream leading-tight mb-4 sm:mb-6"
              >
                SOBERANA{" "}
                <span className="text-shimmer-gold">
                  EXPERIENCE
                </span>{" "}
                START
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: animationY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration, delay: isMobile ? 0.2 : 0.5 }}
                className="text-sm sm:text-base md:text-xl text-cream/90 mb-6 leading-relaxed max-w-3xl mx-auto"
              >
                Um encontro presencial criado para <strong className="text-cream">reorganizar a sua advocacia</strong> e destravar o seu crescimento e estruturar o caminho para aumentar o seu faturamento em 2025.
              </motion.p>

              {/* Quote highlight */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: isMobile ? 0.25 : 0.6 }}
                className="bg-secondary/15 border border-secondary/30 rounded-lg w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 mb-8"
              >
                <p className="text-secondary text-base md:text-lg italic font-serif">
                  "Nada muda se você continuar pensando e fazendo como antes."
                </p>
              </motion.div>

              {/* Premium Countdown Timer */}
              <motion.div
                initial={{ opacity: 0, y: animationY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration, delay: isMobile ? 0.3 : 0.65 }}
                className="mb-8"
              >
                <p className="text-cream/70 text-sm uppercase tracking-wider mb-4">O evento começa em:</p>
                <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
                  {[
                    { value: timeLeft.days, label: 'DIAS' },
                    { value: timeLeft.hours, label: 'HORAS' },
                    { value: timeLeft.minutes, label: 'MIN' },
                    { value: timeLeft.seconds, label: 'SEG' }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="relative group"
                    >
                      {!isMobile && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/50 to-gold-dark/50 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-500" />
                      )}
                      <div className="relative bg-brand-black/80 border border-secondary/40 rounded-lg px-2 sm:px-3 md:px-5 py-2 sm:py-3 md:py-4 min-w-[50px] sm:min-w-[60px] md:min-w-[80px]">
                        <span className="block text-xl sm:text-2xl md:text-4xl font-bold text-shimmer-gold tabular-nums">
                          {String(item.value).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] sm:text-[10px] md:text-xs text-cream/60 mt-1 tracking-wider">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Premium CTA */}
              <motion.div
                initial={{ opacity: 0, y: animationY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration, delay: isMobile ? 0.35 : 0.7 }}
                className="flex justify-center mb-8"
              >
                <div className="relative">
                  {/* Pulsing rings - simplified on mobile */}
                  {!isMobile && (
                    <>
                      <div className="absolute inset-0 -m-3 pointer-events-none">
                        <span className="absolute inset-0 rounded-lg bg-secondary/20 animate-ping" style={{ animationDuration: '2s' }} />
                      </div>
                      <div className="absolute inset-0 -m-2 pointer-events-none">
                        <span className="absolute inset-0 rounded-lg bg-secondary/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                      </div>
                    </>
                  )}
                  
                  <Button
                    asChild
                    size="lg"
                    className="relative cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 sm:px-8 md:px-12 py-5 sm:py-6 md:py-7 text-xs sm:text-sm md:text-lg font-bold uppercase tracking-wide group"
                    onClick={() => trackCTAClick("hero_cta")}
                  >
                    <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                      <Sparkles className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                      <span>GARANTA SUA VAGA AGORA • R$ 299</span>
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </motion.div>

              {/* Trust Indicators with Urgency */}
              <motion.div
                initial={{ opacity: 0, y: animationY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationDuration, delay: isMobile ? 0.4 : 0.8 }}
                className="pt-6 border-t border-cream/10 flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-10 text-cream/70"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-xs sm:text-sm tracking-wide">17 de Janeiro de 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-xs sm:text-sm tracking-wide">São Paulo - SP</span>
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm tracking-wide text-red-400 font-medium">Apenas 12 vagas</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        </div>

        {/* Premium Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-secondary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* SEÇÃO LOGÍSTICA - Premium Cards */}
      <section className="py-12 sm:py-16 md:py-20 bg-background relative overflow-hidden">
        {/* Pattern only on desktop for performance */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-5 hidden md:block"
            style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '150px' }}
          />
        )}
        
        {/* Decorative isotipo - desktop only, lazy loaded */}
        {!isMobile && (
          <img 
            src={isotipoGold} 
            alt="" 
            loading="lazy"
            className="absolute right-4 top-8 w-24 opacity-5 animate-float-slow hidden sm:block"
          />
        )}
        
        <div className="container-soberana relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Calendar, label: "DATA", value: "17 de Janeiro de 2025", sublabel: "Sexta-feira" },
              { icon: Clock, label: "HORÁRIO", value: "09H00 às 17H00", sublabel: "Pausa de 1H30 para almoço" },
              { icon: MapPin, label: "LOCAL", value: "Espaço Mind", sublabel: "R. Abílio Soares, 607 - Paraíso, SP" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group relative bg-card border border-border/50 rounded-xl p-5 sm:p-6 text-center hover:shadow-xl hover:border-secondary/40 transition-all duration-500 card-luxury"
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 border-secondary/20" />
                
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:text-secondary transition-colors" />
                </div>
                <p className="text-xs font-bold text-secondary tracking-wider mb-2">{item.label}</p>
                <p className="text-base sm:text-lg font-serif font-semibold text-foreground mb-1">{item.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.sublabel}</p>
              </motion.div>
            ))}
          </div>

          {/* Scarcity Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-10 max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/5 via-red-500/10 to-primary/5 border border-red-500/20 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm sm:text-base text-foreground">
                  <strong className="text-red-400">Turma limitada</strong> para garantir experiência personalizada
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO PROBLEMA (A DOR) - Premium Black */}
      <section 
        ref={problemRef}
        className="py-16 md:py-24 lg:py-28 bg-brand-black relative overflow-hidden"
      >
        {/* Golden pattern background - desktop only */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-[0.08] hidden md:block"
            style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '180px' }}
          />
        )}
        
        {/* Vignette overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />
        
        {/* Decorative isotipos - desktop only, conditional rendering */}
        {shouldAnimate && (
          <>
            <motion.img
              src={isotipoGold}
              alt=""
              loading="lazy"
              className="absolute right-4 md:right-8 top-16 w-32 md:w-40 opacity-[0.12] animate-float-slow hidden sm:block"
              initial={{ opacity: 0 }}
              animate={problemInView ? { opacity: 0.12 } : {}}
              transition={{ delay: 0.6 }}
            />
            <motion.img
              src={isotipoSGold}
              alt=""
              loading="lazy"
              className="absolute left-4 bottom-8 w-20 md:w-24 opacity-[0.10] animate-float-slow animation-delay-1000 hidden sm:block"
              initial={{ opacity: 0 }}
              animate={problemInView ? { opacity: 0.10 } : {}}
              transition={{ delay: 0.8 }}
            />
          </>
        )}
        
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-cream mb-6 md:mb-8">
              O erro invisível que trava <span className="text-shimmer-gold">a sua advocacia.</span>
            </h2>

            <p className="text-cream/85 text-base sm:text-lg md:text-xl leading-relaxed mb-8 md:mb-12">
              Muitas advogadas trabalham demais porque trabalham sem estrutura. E sem estrutura, <strong className="text-cream">nenhum resultado se sustenta.</strong>
            </p>

            <div className="space-y-4 md:space-y-6">
              {[
                "A maior barreira da advogada não é o mercado. É o que ela acredita sobre si mesma.",
                "Produtividade não é correr. É fazer o básico muito bem feito."
              ].map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={problemInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.2 }}
                  className="relative bg-secondary/15 border-l-4 border-secondary px-4 sm:px-6 py-4 md:py-5 rounded-r-lg group hover:bg-secondary/20 transition-colors"
                >
                  <div className="absolute inset-0 rounded-r-lg border border-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-secondary text-base sm:text-lg md:text-xl font-serif italic relative z-10">
                    "{quote}"
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO A EXPERIÊNCIA (Conteúdo Programático) - Premium Grid */}
      <section 
        ref={experienceRef}
        className="py-14 sm:py-20 md:py-28 bg-background relative overflow-hidden"
      >
        {/* Pattern only on desktop */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-5 hidden md:block"
            style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '180px' }}
          />
        )}
        
        {/* Decorative isotipos - desktop only */}
        {!isMobile && (
          <>
            <img 
              src={isotipoGold} 
              alt="" 
              loading="lazy"
              className="absolute left-4 top-20 w-28 opacity-5 animate-float-slow hidden sm:block"
            />
            <img 
              src={isotipoSGold} 
              alt="" 
              loading="lazy"
              className="absolute right-8 bottom-20 w-20 opacity-5 animate-float-slow animation-delay-2000 hidden sm:block"
            />
          </>
        )}
        
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={experienceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
              <Crown className="w-4 h-4 text-secondary" />
              <span className="text-secondary text-xs sm:text-sm font-medium tracking-wider">O QUE VOCÊ VAI VIVER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Uma oficina <span className="text-primary">100% prática.</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              7 módulos transformadores para você sair com clareza e um plano de ação concreto.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {programContent.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={experienceInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
                className="group relative bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:shadow-2xl hover:border-secondary/40 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="absolute -top-3 -left-3 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-gold-dark rounded-full flex items-center justify-center text-secondary-foreground font-bold text-xs sm:text-sm shadow-lg glow-gold-subtle">
                  {index + 1}
                </div>
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-secondary transition-colors" />
                </div>
                <h3 className="font-serif font-bold text-foreground text-base sm:text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Premium highlight box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={experienceInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-8 sm:mt-12 max-w-3xl mx-auto"
          >
            <div className="golden-frame">
              <div className="golden-corner golden-corner-tl" />
              <div className="golden-corner golden-corner-tr" />
              <div className="golden-corner golden-corner-bl" />
              <div className="golden-corner golden-corner-br" />
              
              <div className="golden-frame-inner bg-gradient-to-r from-primary to-marsala p-6 sm:p-8 text-center">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mx-auto mb-3 sm:mb-4" />
                <p className="text-primary-foreground text-base sm:text-lg md:text-xl font-medium">
                  Saia com seu <strong className="text-secondary">Plano de 90 dias</strong> pronto para iniciar 2025 no controle e com clareza total do que fazer.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO DEPOIMENTOS - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton variant="testimonials" />}>
        <ExperienceTestimonials />
      </Suspense>

      {/* SEÇÃO CONVITE ESPECIAL - Premium Dark with Golden Glow */}
      <section
        ref={inviteRef}
        className="py-14 sm:py-20 md:py-28 bg-brand-black relative overflow-hidden"
      >
        {/* Pattern - desktop only */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-[0.08] hidden md:block"
            style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '150px' }}
          />
        )}
        
        {/* Golden glow effect - simpler on mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        {/* Decorative isotipos - desktop only */}
        {shouldAnimate && (
          <>
            <motion.img
              src={isotipoGold}
              alt=""
              loading="lazy"
              className="absolute right-8 top-16 w-32 sm:w-40 opacity-[0.10] animate-float-slow hidden sm:block"
              initial={{ opacity: 0 }}
              animate={inviteInView ? { opacity: 0.1 } : {}}
            />
            <motion.img
              src={isotipoSGold}
              alt=""
              loading="lazy"
              className="absolute left-8 bottom-16 w-20 sm:w-24 opacity-[0.12] animate-float-slow animation-delay-1000 hidden sm:block"
              initial={{ opacity: 0 }}
              animate={inviteInView ? { opacity: 0.12 } : {}}
            />
          </>
        )}
        
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inviteInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.img
              src={isotipoGold}
              alt=""
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 isotipo-glow"
              initial={{ scale: 0 }}
              animate={inviteInView ? { scale: 1 } : {}}
              transition={{ type: "spring", delay: 0.3 }}
            />

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-cream mb-6 sm:mb-8">
              Você foi <span className="text-shimmer-gold">escolhida.</span>
            </h2>

            <p className="text-cream/85 text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10">
              Seu 2025 começa de forma estratégica. Para viver tudo isso, você precisa decidir estar no evento.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12">
              {[
                "A prática vence o medo.",
                "A constância vence a comparação."
              ].map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inviteInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.2 }}
                  className="bg-secondary/10 border border-secondary/40 rounded-xl px-5 sm:px-8 py-4 sm:py-5 hover:bg-secondary/15 transition-colors glow-gold-subtle"
                >
                  <p className="text-secondary text-base sm:text-lg font-serif font-medium italic">
                    "{quote}"
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inviteInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
            >
              <Button 
                asChild 
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-sm sm:text-lg w-full sm:w-auto px-6 sm:px-10 py-5 sm:py-7 rounded-lg shadow-2xl hover:shadow-secondary/30 transition-all group cta-premium whitespace-normal text-center leading-tight flex-wrap justify-center"
                onClick={() => trackCTAClick("invite_cta")}
              >
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  <Star className="mr-2 w-4 h-4 sm:w-5 sm:h-5 fill-secondary-foreground" />
                  QUERO GARANTIR MEU LUGAR
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO FAQ - Lazy loaded */}
      <Suspense fallback={<SectionSkeleton variant="faq" />}>
        <ExperienceFAQ />
      </Suspense>

      {/* SEÇÃO INVESTIMENTO (Oferta) - Premium Card */}
      <section
        ref={pricingRef}
        className="py-14 sm:py-20 md:py-28 bg-background relative overflow-hidden"
      >
        {/* Pattern - desktop only */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-5 hidden md:block"
            style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '150px' }}
          />
        )}
        
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-3 sm:px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-secondary text-xs sm:text-sm font-medium tracking-wider">INVESTIMENTO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
                Lote 1 — <span className="text-primary">Oportunidade Exclusiva</span>
              </h2>
            </div>

            {/* Premium pricing card with golden frame */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={pricingInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <div className="golden-frame">
                <div className="golden-corner golden-corner-tl" />
                <div className="golden-corner golden-corner-tr" />
                <div className="golden-corner golden-corner-bl" />
                <div className="golden-corner golden-corner-br" />
                
                <div className="golden-particle golden-particle-1" />
                <div className="golden-particle golden-particle-2" />
                
                <div className="golden-frame-inner bg-card p-8 md:p-12 text-center">
                  {/* Urgency Badge */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-red-400 text-sm font-medium">Apenas 12 vagas restantes</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 glow-gold-subtle">
                    <Crown className="w-4 h-4" />
                    LOTE 1 • OPORTUNIDADE EXCLUSIVA
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-muted-foreground text-2xl">R$</span>
                      <span className="text-6xl md:text-7xl font-serif font-bold text-gradient-gold">299</span>
                      <span className="text-muted-foreground text-2xl">,00</span>
                    </div>
                  </div>

                  <ul className="text-left max-w-sm mx-auto mb-8 space-y-3">
                    {[
                      "8 horas de oficina presencial",
                      "Material de apoio exclusivo",
                      "Plano de 90 dias personalizado",
                      "Networking com advogadas",
                      "Coffee break incluso"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Premium CTA with pulsing rings */}
                  <div className="relative">
                    <div className="absolute inset-0 -m-4 pointer-events-none">
                      <span className="absolute inset-0 rounded-lg bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    <div className="absolute inset-0 -m-3 pointer-events-none">
                      <span className="absolute inset-0 rounded-lg bg-primary/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                    </div>
                    
                    <Button 
                      asChild 
                      size="lg"
                      className="relative w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base md:text-lg py-6 sm:py-7 h-auto rounded-lg shadow-2xl hover:shadow-primary/30 transition-all group whitespace-normal text-center leading-tight flex-wrap justify-center"
                      onClick={() => trackCTAClick("pricing_cta")}
                    >
                      <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                        <Sparkles className="mr-2 w-5 h-5" />
                        SIM! QUERO GARANTIR MEU LUGAR
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>

                  <p className="text-muted-foreground text-xs mt-6 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Pagamento seguro via cartão ou PIX
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={pricingInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Satisfação garantida
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary" />
                Advogadas atendidas
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* RODAPÉ DE AUTORIDADE - Premium Footer */}
      <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
        {/* Subtle pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '200px' }}
        />
        
        {/* Vignette overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.12)_100%)]" />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
        
        <div className="container-soberana relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.img 
              src={isotipoGold} 
              alt="Soberana" 
              className="w-14 h-14 mx-auto mb-6 isotipo-glow"
              whileHover={{ scale: 1.1 }}
            />
            <p className="text-primary-foreground/95 text-xl md:text-2xl lg:text-3xl font-serif italic max-w-3xl mx-auto leading-relaxed">
              "Quando uma advogada domina a estratégia, ela não corre atrás de clientes. <span className="text-shimmer-gold font-semibold">Ela comanda.</span>"
            </p>
            <p className="text-secondary mt-8 font-serif text-lg tracking-widest uppercase">— Fabiana Duarte</p>
            
            <div className="mt-8 w-32 h-px mx-auto bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      <Footer />
      
      {/* Exit Intent Popup */}
      <ExperienceExitPopup />
    </div>
  );
};

export default ExperienceStartLanding;
