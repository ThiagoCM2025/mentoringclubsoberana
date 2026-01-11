import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { JornadaVideoPlayer } from "@/components/jornada/JornadaVideoPlayer";
import { JornadaAgendaSection } from "@/components/jornada/JornadaAgendaSection";
import { JornadaLeadForm } from "@/components/jornada/JornadaLeadForm";
import { JornadaExitPopup } from "@/components/jornada/JornadaExitPopup";
import { JornadaBenefitsSection } from "@/components/jornada/JornadaBenefitsSection";
import { JornadaProblemSection } from "@/components/jornada/JornadaProblemSection";
import { ScrollTracker } from "@/components/ScrollTracker";
import { TimeTracker } from "@/components/TimeTracker";
import { ClickTracker } from "@/components/ClickTracker";

import heroImage from "@/assets/jornada/hero-fabiana.jpeg";
import isotipoGold from "@/assets/jornada/isotipo-gold.png";

const JornadaImobiliariaLanding = () => {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const scrollToForm = () => {
    document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" });
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Jornada Imobiliária 2026 - Janeiro Extraordinário",
    "description": "Série de 5 lives gratuitas para advogadas do imobiliário. Aprenda a escalar seu escritório com rotina, captação, IA, precificação e vendas.",
    "startDate": "2026-01-12T20:00:00-03:00",
    "endDate": "2026-01-26T21:00:00-03:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": { "@type": "VirtualLocation", "url": "https://soberana.com.br/jornada-imobiliaria-2026" },
    "organizer": { "@type": "Organization", "name": "Soberana Mentoring Club" },
    "performer": { "@type": "Person", "name": "Fabiana Duarte" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL", "availability": "https://schema.org/InStock" }
  };

  return (
    <div className="min-h-screen bg-background landing-page">
      <SEO
        title="Jornada Imobiliária 2026 | Janeiro Extraordinário para Advogadas | Soberana"
        description="Participe da série gratuita de 5 lives para advogadas do imobiliário. Aprenda a escalar seu escritório com rotina, captação, IA, precificação e vendas."
        keywords="advocacia imobiliária, jornada advogadas, lives jurídicas, regularização imobiliária, escalar escritório advocacia, curso advogadas 2026, marketing jurídico"
        url="https://soberana.com.br/jornada-imobiliaria-2026"
        type="website"
        schema={eventSchema}
      />

      <ScrollTracker />
      <TimeTracker />
      <ClickTracker />
      <JornadaExitPopup />
      <WhatsAppButton message="Olá! Quero saber mais sobre a Jornada Imobiliária 2026" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-brand-black overflow-hidden">
        {/* Background Image - More visible */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover object-top opacity-70" />
          {/* Lighter gradient to show more of Fabiana */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/90" />
        </div>

        {/* Golden vignette effect around edges */}
        <div className="absolute inset-0 z-[1] pointer-events-none" 
          style={{ 
            boxShadow: 'inset 0 0 200px 40px rgba(166, 144, 97, 0.15), inset 0 0 100px 20px rgba(166, 144, 97, 0.1)' 
          }} 
        />

        {/* Central spotlight on Fabiana */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.5) 100%)'
          }}
        />

        {/* Pattern overlay */}
        <div className="absolute inset-0 z-[2] opacity-[0.06]" style={{ backgroundImage: `url('/assets/brand/pattern-circles-gold.png')`, backgroundSize: '150px' }} />

        {/* Animated golden particles */}
        <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-secondary/60 rounded-full"
              style={{
                left: `${15 + i * 10}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Floating isotipo with animation */}
        <motion.img
          src={isotipoGold}
          alt=""
          className="absolute right-8 top-1/4 w-32 md:w-56 z-[4] hidden md:block"
          style={{ filter: 'drop-shadow(0 0 30px rgba(166, 144, 97, 0.3))' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { 
            opacity: 0.25, 
            y: [0, -15, 0],
          } : {}}
          transition={{ 
            opacity: { duration: 1, delay: 0.5 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Golden glow behind content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] z-[4] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(166, 144, 97, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="container-soberana relative z-10 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-6 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                SÉRIE GRATUITA | 5 ENCONTROS PRÁTICOS
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl text-cream mb-6 leading-tight drop-shadow-lg"
            >
              Advogada, construa sua base de{" "}
              <span className="text-shimmer-gold">crescimento para 2026</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-cream/90 mb-8 max-w-2xl mx-auto drop-shadow-md"
            >
              Participe da Série de Lives: <strong className="text-cream">Janeiro Extraordinário no Imobiliário</strong>. Garanta seu acesso aos materiais de apoio e às gravações antes que saiam do ar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-8 text-cream/80 text-sm"
            >
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-secondary/20">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>12 a 26 de Janeiro</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-secondary/20">
                <Clock className="w-4 h-4 text-secondary" />
                <span>Lives às 20h</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <Button onClick={scrollToForm} size="lg" className="cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-6 text-base md:text-lg shadow-[0_0_40px_rgba(166,144,97,0.3)]">
                QUERO GARANTIR MINHA VAGA GRATUITAMENTE
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <JornadaProblemSection />
      <JornadaAgendaSection />
      <JornadaVideoPlayer />
      <JornadaBenefitsSection />
      <JornadaLeadForm />
      <Footer />
    </div>
  );
};

export default JornadaImobiliariaLanding;
