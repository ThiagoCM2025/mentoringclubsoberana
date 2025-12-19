import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Clock, MapPin, CheckCircle2, Sparkles, Brain, Settings, Users, TrendingUp, Target, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Footer } from "@/components/landing/Footer";

// Import brand assets
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import patternGold from "@/assets/brand/pattern-gold.png";
import heroFabiana from "@/assets/hero-fabiana.jpeg";

const ExperienceStartLanding = () => {
  const heroRef = useRef(null);
  const problemRef = useRef(null);
  const experienceRef = useRef(null);
  const inviteRef = useRef(null);
  const pricingRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const problemInView = useInView(problemRef, { once: true, amount: 0.3 });
  const experienceInView = useInView(experienceRef, { once: true, amount: 0.2 });
  const inviteInView = useInView(inviteRef, { once: true, amount: 0.3 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.3 });

  const ctaUrl = "https://wa.me/5511999999999?text=Quero%20garantir%20minha%20vaga%20no%20Experience%20Start";

  const programContent = [
    {
      icon: Target,
      title: "Raio-X completo da sua advocacia",
      description: "Identifique onde perde tempo e por que não gera resultado."
    },
    {
      icon: Brain,
      title: "Uso de IA na otimização da rotina",
      description: "Tecnologia para ganhar tempo e aumentar produtividade."
    },
    {
      icon: Settings,
      title: "Implementação de sistema de gestão",
      description: "A base sólida para o crescimento sustentável."
    },
    {
      icon: Users,
      title: "Posicionamento e redes sociais",
      description: "Seja vista como autoridade na sua área."
    },
    {
      icon: TrendingUp,
      title: "Fluxos de captação de clientes",
      description: "Como atrair leads qualificados de forma consistente."
    },
    {
      icon: Sparkles,
      title: "Estratégia de Precificação",
      description: "Como cobrar seus honorários com lucro real."
    },
    {
      icon: Calendar,
      title: "Plano dos 90 dias",
      description: "Saia com o cronograma pronto para iniciar o ano no controle."
    }
  ];

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Soberana Experience Start",
    "description": "Oficina presencial para advogadas reorganizarem sua advocacia e destravarem o crescimento em 2026.",
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
      "name": "Fabiana Soberana"
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
        description="Reorganize sua advocacia e destrave seu crescimento em 2026. Oficina 100% prática com Fabiana Soberana. 17 de Janeiro em São Paulo. Apenas 12 vagas."
        keywords="oficina para advogadas, evento presencial advocacia, mentoria jurídica SP, networking advogadas, Fabiana Soberana, gestão advocacia"
        url="https://soberana.com.br/experience-start"
        type="website"
        schema={eventSchema}
      />

      {/* Section 1: Header Superior Sticky */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10"
      >
        <div className="container-soberana py-3 flex items-center justify-between">
          <p className="text-primary-foreground/90 text-sm md:text-base font-medium">
            Um convite para uma experiência transformadora.
          </p>
          <Button 
            asChild 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs md:text-sm px-4 md:px-6"
          >
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
              QUERO MEU LUGAR
            </a>
          </Button>
        </div>
      </motion.header>

      {/* Section 2: Hero Principal */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-marsala to-marsala-dark" />
        <div 
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '150px' }}
        />
        
        {/* Decorative Elements */}
        <motion.img
          src={isotipoGold}
          alt=""
          className="absolute right-0 top-1/4 w-64 md:w-96 opacity-10"
          initial={{ x: 100, opacity: 0 }}
          animate={heroInView ? { x: 0, opacity: 0.1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />

        <div className="container-soberana relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-2 mb-6"
              >
                <Star className="w-4 h-4 text-secondary" />
                <span className="text-secondary text-sm font-medium">LOTE 1 • Vagas Limitadas</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-primary-foreground mb-6 leading-tight">
                SOBERANA<br />
                <span className="text-gradient-gold">EXPERIENCE</span><br />
                START
              </h1>

              <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Um encontro presencial criado para <strong className="text-primary-foreground">reorganizar a sua advocacia</strong> e destravar o seu crescimento e estruturar o caminho para aumentar o seu faturamento em 2026.
              </p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
                className="text-secondary text-base md:text-lg italic mb-8"
              >
                "Nada muda se você continuar pensando e fazendo como antes."
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 }}
              >
                <Button 
                  asChild 
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-base md:text-lg px-8 md:px-12 py-6 md:py-8 rounded-lg shadow-lg hover:shadow-xl transition-all group"
                >
                  <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                    QUERO GARANTIR MINHA VAGA POR R$ 299,00
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-secondary/30 to-transparent rounded-2xl blur-2xl" />
                <img
                  src={heroFabiana}
                  alt="Fabiana Soberana - Mentora"
                  className="relative rounded-2xl shadow-2xl w-full max-w-lg mx-auto object-cover aspect-[3/4]"
                />
                <div className="absolute -bottom-4 -right-4 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold shadow-lg">
                  17 de Janeiro, 2025
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center"
          >
            <motion.div className="w-1.5 h-3 bg-secondary rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 3: Informações Logísticas */}
      <section className="py-16 md:py-20 bg-background relative section-pattern-gold">
        <div className="container-soberana relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                className="bg-card border border-border/50 rounded-xl p-6 text-center hover:shadow-lg hover:border-secondary/30 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-bold text-secondary tracking-wider mb-2">{item.label}</p>
                <p className="text-lg font-serif font-semibold text-foreground mb-1">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: O Problema (A Dor) */}
      <section 
        ref={problemRef}
        className="py-20 md:py-28 bg-primary relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '150px' }}
        />
        
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-8">
              O erro invisível que trava <span className="text-secondary">a sua advocacia.</span>
            </h2>

            <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-12">
              Muitas advogadas trabalham demais porque trabalham sem estrutura. E sem estrutura, <strong className="text-primary-foreground">nenhum resultado se sustenta.</strong>
            </p>

            <div className="space-y-6">
              {[
                "A maior barreira da advogada não é o mercado. É o que ela acredita sobre si mesma.",
                "Produtividade não é correr. É fazer o básico muito bem feito."
              ].map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={problemInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.2 }}
                  className="bg-secondary/10 border-l-4 border-secondary px-6 py-5 rounded-r-lg"
                >
                  <p className="text-secondary text-lg md:text-xl font-serif italic">
                    "{quote}"
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative isotipo */}
        <motion.img
          src={isotipoWhite}
          alt=""
          className="absolute left-4 bottom-4 w-24 opacity-5"
          initial={{ opacity: 0 }}
          animate={problemInView ? { opacity: 0.05 } : {}}
          transition={{ delay: 0.6 }}
        />
      </section>

      {/* Section 5: A Experiência (Conteúdo Programático) */}
      <section 
        ref={experienceRef}
        className="py-20 md:py-28 bg-background relative section-pattern-gold"
      >
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={experienceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-secondary text-sm font-bold tracking-widest mb-4">O QUE VOCÊ VAI VIVER</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Uma oficina <span className="text-primary">100% prática.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              7 módulos transformadores para você sair com clareza e um plano de ação concreto.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {programContent.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={experienceInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
                className="group bg-card border border-border/50 rounded-xl p-6 hover:shadow-xl hover:border-secondary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-foreground text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Highlight box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={experienceInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-primary to-marsala rounded-2xl p-8 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-4" />
            <p className="text-primary-foreground text-lg md:text-xl font-medium">
              Saia com seu <strong>Plano de 90 dias</strong> pronto para iniciar 2026 no controle e com clareza total do que fazer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 6: Convite Especial */}
      <section 
        ref={inviteRef}
        className="py-20 md:py-28 bg-brand-black relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '100px' }}
        />
        
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
              className="w-16 h-16 mx-auto mb-8"
              initial={{ scale: 0 }}
              animate={inviteInView ? { scale: 1 } : {}}
              transition={{ type: "spring", delay: 0.3 }}
            />

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-cream mb-8">
              Você foi <span className="text-secondary">escolhida.</span>
            </h2>

            <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-10">
              Seu 2025 começa de forma estratégica. Para viver tudo isso, você precisa decidir estar no evento.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
              {[
                "A prática vence o medo.",
                "A constância vence a comparação."
              ].map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inviteInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.2 }}
                  className="bg-secondary/10 border border-secondary/30 rounded-xl px-8 py-5"
                >
                  <p className="text-secondary text-lg font-serif font-medium italic">
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
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg px-10 py-7 rounded-lg shadow-lg hover:shadow-xl transition-all group"
              >
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  QUERO ESTAR LÁ
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Investimento (Oferta) */}
      <section 
        ref={pricingRef}
        className="py-20 md:py-28 bg-background relative section-pattern-marsala"
      >
        <div className="container-soberana relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <p className="text-secondary text-sm font-bold tracking-widest mb-4">INVESTIMENTO</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                Lote 1 — <span className="text-primary">Oportunidade Exclusiva</span>
              </h2>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={pricingInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="bg-card border-2 border-secondary/50 rounded-2xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer-gold pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Sparkles className="w-4 h-4" />
                  APENAS 12 VAGAS
                </div>

                <div className="mb-8">
                  <p className="text-muted-foreground text-sm line-through mb-2">De R$ 497,00</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground text-2xl">R$</span>
                    <span className="text-6xl md:text-7xl font-serif font-bold text-primary">299</span>
                    <span className="text-muted-foreground text-2xl">,00</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">ou 3x de R$ 99,67 sem juros</p>
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

                <Button 
                  asChild 
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-7 rounded-lg shadow-lg hover:shadow-xl transition-all group"
                >
                  <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                    SIM! QUERO COMEÇAR 2025 COM ESTRATÉGIA
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>

                <p className="text-muted-foreground text-xs mt-4">
                  Pagamento seguro via cartão ou PIX
                </p>
              </div>
            </motion.div>

            {/* Urgency */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={pricingInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="text-center text-muted-foreground mt-6 text-sm"
            >
              ⚡ Vagas limitadas a 12 participantes para garantir atenção individualizada
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 8: Rodapé de Autoridade */}
      <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '100px' }}
        />
        
        <div className="container-soberana relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src={isotipoWhite} 
              alt="Soberana" 
              className="w-12 h-12 mx-auto mb-6 opacity-80"
            />
            <p className="text-primary-foreground/90 text-xl md:text-2xl lg:text-3xl font-serif italic max-w-3xl mx-auto leading-relaxed">
              "Quando uma advogada domina a estratégia, ela não corre atrás de clientes. <span className="text-secondary font-semibold">Ela comanda.</span>"
            </p>
            <p className="text-secondary mt-6 font-medium">— Fabiana Soberana</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExperienceStartLanding;
