import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Target, 
  Users, 
  Award,
  Presentation,
  Map,
  ClipboardList,
  LayoutGrid,
  MessageCircle,
  HelpCircle,
  Lock,
  Sparkles,
  AlertCircle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Footer } from "@/components/landing/Footer";
import { staggerContainer, staggerItem, scaleIn, fadeIn } from "@/lib/animations";

import mentorSobre from "@/assets/mentor-sobre.jpg";
import fabianaHero from "@/assets/fabiana-operacao-regularizacao.jpg";
import heroRegularizacaoBg from "@/assets/hero-regularizacao-bg.jpg";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";
import isotipoSFramedGold from "@/assets/brand/isotipo-s-framed-gold-v3.png";
import patternFlowerGold from "@/assets/brand/pattern-flower-gold.png";
import patternFlowerMarsala from "@/assets/brand/pattern-flower-marsala.png";
import patternFlowerPreto from "@/assets/brand/pattern-flower-preto.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold-v2.png";
import patternCirclesMarsala from "@/assets/brand/pattern-circles-marsala-v2.png";
import patternCirclesPreto from "@/assets/brand/pattern-circles-preto-v2.png";
import patternCirclesBranco from "@/assets/brand/pattern-circles-branco-v2.png";
import patternCirclesConnectedGold from "@/assets/brand/pattern-circles-connected-gold.png";
import isotipoSFramedGoldV2 from "@/assets/brand/isotipo-s-framed-gold-v2.png";
import isotipoSFramedGoldV4 from "@/assets/brand/isotipo-s-framed-gold-v4.png";
import isotipoSFramedMarsala from "@/assets/brand/isotipo-s-framed-marsala-v2.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white-v2.png";
import isotipoSBlack from "@/assets/brand/isotipo-s-framed-black.png";
import { Progress } from "@/components/ui/progress";

const OperacaoRegularizacaoLanding = () => {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const painRef = useRef(null);
  const scheduleRef = useRef(null);
  const pricingRef = useRef(null);
  const mentorRef = useRef(null);
  const faqRef = useRef(null);
  const finalCtaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.2 });
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.2 });
  const painInView = useInView(painRef, { once: true, amount: 0.2 });
  const scheduleInView = useInView(scheduleRef, { once: true, amount: 0.2 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.2 });
  const mentorInView = useInView(mentorRef, { once: true, amount: 0.2 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.2 });
  const finalCtaInView = useInView(finalCtaRef, { once: true, amount: 0.3 });

  const whatsappNumber = "5511993563468";
  const whatsappMessage = encodeURIComponent("Olá! Tenho dúvidas sobre a Operação Regularização Imobiliária.");
  const paymentLink = "https://pay.kiwify.com.br/PLACEHOLDER"; // TODO: Replace with actual link

  const benefits = [
    { icon: Clock, text: "04h de conteúdo" },
    { icon: Presentation, text: "Experiência ao vivo" },
    { icon: Map, text: "Mapa da Operação de Alta Escala" },
    { icon: ClipboardList, text: "Plano de ação para aplicar" },
    { icon: LayoutGrid, text: "Estrutura de rotina comercial" },
    { icon: Users, text: "Modelo de esteira de atendimento" },
    { icon: MessageCircle, text: "Sessão de perguntas e respostas" },
  ];

  const learnings = [
    "Como virar a referência em regularização na sua cidade/região",
    "Como organizar uma operação enxuta, que roda mesmo quando você está sozinha",
    "Como criar um fluxo de atendimento que evita travar no operacional",
    "Como aumentar a quantidade e a qualidade dos casos, com uma rotina simples e repetível",
    "Como estruturar um caminho para construir um escritório com potencial de alcançar R$150k/mês, com consistência"
  ];

  const painPoints = [
    { emoji: "💭", title: "Vive no \"caso a caso\"", description: "e tudo depende de você" },
    { emoji: "📉", title: "O mês oscila", description: "e não existe previsibilidade" },
    { emoji: "🧩", title: "Você até atende", description: "mas sente que não está construindo uma operação escalável" },
    { emoji: "😓", title: "Falta rotina comercial", description: "e falta um caminho claro para virar especialista reconhecida" },
  ];

  const targetAudience = [
    "Quer crescer seu escritório com uma especialidade que permite escala",
    "Quer parar de depender só de indicação e começar a ter previsibilidade",
    "Quer se posicionar como referência e ser lembrada pela especialidade",
    "Sente que trabalha muito, mas não vê o crescimento acompanhar",
    "Quer um caminho claro para construir um escritório com alto faturamento"
  ];

  const faqs = [
    {
      question: "Quando vai acontecer?",
      answer: "A Imersão acontecerá no dia 18 de Janeiro, às 09h00, e se encerrará no mesmo dia às 13h00 (Horário Oficial de Brasília)."
    },
    {
      question: "Como será a transmissão?",
      answer: "Online e ao vivo, em sala fechada no Zoom."
    },
    {
      question: "Vai ficar gravado?",
      answer: "O ingresso para o evento ao vivo não inclui as gravações. Se quiser acesso à imersão gravada, com o conteúdo organizado para consulta, você poderá adquirir separadamente por R$97 (à vista ou em até 12x). Disponível em até 7 dias após o evento, com acesso por 14 dias."
    },
    {
      question: "Quem pode participar?",
      answer: "Advogadas que desejam crescer com uma especialidade altamente procurada: Regularização Imobiliária."
    },
    {
      question: "Posso pedir reembolso?",
      answer: "Você pode solicitar o cancelamento do seu ingresso em até 2 dias após o término do evento online, sem burocracia."
    },
    {
      question: "Tem certificado?",
      answer: "Sim. Após 7 dias, você recebe um certificado de participação no Workshop em seu e-mail."
    }
  ];

  const faqSchemaData = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }));

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Operação Regularização Imobiliária de Alta Escala | Soberana</title>
        <meta name="title" content="Operação Regularização Imobiliária de Alta Escala | Soberana" />
        <meta name="description" content="Imersão ao vivo para advogadas que querem transformar regularização imobiliária em uma operação previsível com método, posicionamento e rotina que gera volume de casos. 18 de Janeiro, das 09h às 13h. Apenas R$19." />
        <meta name="keywords" content="regularização imobiliária, advocacia imobiliária, escritório de advocacia, escala jurídica, faturamento advocacia, advogadas empreendedoras, imersão jurídica, mentoria para advogadas, Fabiana Duarte, operação regularização, direito imobiliário, negócio jurídico, R$150k mês advocacia, evento online advogadas, curso regularização imobiliária, marketing jurídico, posicionamento advogada" />
        <meta name="author" content="Fabiana Duarte - Soberana" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="pt-BR" />
        <meta name="theme-color" content="#64001C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://soberana.club/operacao-regularizacao" />
        <meta property="og:title" content="Operação Regularização Imobiliária de Alta Escala | Soberana" />
        <meta property="og:description" content="Imersão ao vivo para advogadas que querem transformar regularização imobiliária em uma operação previsível com método, posicionamento e rotina que gera volume de casos. 18 de Janeiro, das 09h às 13h. Apenas R$19." />
        <meta property="og:image" content="https://soberana.club/og-operacao-regularizacao.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Operação Regularização Imobiliária de Alta Escala - Imersão ao Vivo com Fabiana Duarte" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Soberana" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://soberana.club/operacao-regularizacao" />
        <meta name="twitter:title" content="Operação Regularização Imobiliária de Alta Escala | Soberana" />
        <meta name="twitter:description" content="Imersão ao vivo para advogadas transformarem regularização imobiliária em operação escalável. 18/Jan, 09h-13h. R$19." />
        <meta name="twitter:image" content="https://soberana.club/og-operacao-regularizacao.jpg" />
        <meta name="twitter:image:alt" content="Operação Regularização Imobiliária - Fabiana Duarte" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://soberana.club/operacao-regularizacao" />
        
        {/* Preload Critical Hero Image */}
        <link rel="preload" as="image" href={fabianaHero} />
        
        {/* Event Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Operação Regularização Imobiliária de Alta Escala",
            "description": "Imersão ao vivo para advogadas que querem transformar regularização imobiliária em uma operação escalável com método, posicionamento e rotina que gera volume de casos.",
            "image": "https://soberana.club/og-operacao-regularizacao.jpg",
            "startDate": "2025-01-18T09:00:00-03:00",
            "endDate": "2025-01-18T13:00:00-03:00",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
              "@type": "VirtualLocation",
              "url": "https://zoom.us"
            },
            "organizer": {
              "@type": "Organization",
              "name": "Soberana",
              "url": "https://soberana.club",
              "logo": "https://soberana.club/brand-logo.png"
            },
            "performer": {
              "@type": "Person",
              "name": "Fabiana Duarte",
              "jobTitle": "Mentora de Advogadas",
              "description": "Advogada, empresária jurídica e criadora da Metodologia SOBERANA"
            },
            "offers": {
              "@type": "Offer",
              "name": "Ingresso Lote 01",
              "price": "19.00",
              "priceCurrency": "BRL",
              "availability": "https://schema.org/LimitedAvailability",
              "validFrom": "2024-12-01T00:00:00-03:00",
              "url": "https://pay.kiwify.com.br/PLACEHOLDER"
            }
          })}
        </script>
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqSchemaData
          })}
        </script>
        
        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://soberana.club"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Operação Regularização Imobiliária",
                "item": "https://soberana.club/operacao-regularizacao"
              }
            ]
          })}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Soberana",
            "alternateName": "Soberana Mentoring Club",
            "url": "https://soberana.club",
            "logo": "https://soberana.club/brand-logo.png",
            "description": "Ecossistema de mentoria para advogadas que desejam construir negócios jurídicos lucrativos e escaláveis.",
            "founder": {
              "@type": "Person",
              "name": "Fabiana Duarte"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "telephone": "+55-11-99356-3468",
              "availableLanguage": "Portuguese"
            },
            "sameAs": [
              "https://instagram.com/soberana",
              "https://linkedin.com/company/soberana"
            ]
          })}
        </script>
      </Helmet>

      {/* SECTION 1: Hero Premium - Split Layout */}
      <section className="relative min-h-screen overflow-hidden bg-brand-black">
        {/* Background Image - Real Estate Regularization Thematic (More visible) */}
        <div 
          className="absolute inset-0 opacity-[0.20]"
          style={{ 
            backgroundImage: `url(${heroRegularizacaoBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'screen'
          }}
        />
        
        {/* Pattern Layer 1 - Connected Circles Gold (more visible) */}
        <div 
          className="absolute inset-0 opacity-[0.12] md:opacity-[0.15]"
          style={{ backgroundImage: `url(${patternCirclesConnectedGold})`, backgroundSize: '200px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Pattern Layer 2 - Circles Gold (overlay) */}
        <div 
          className="absolute inset-0 opacity-[0.06] hidden lg:block"
          style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '150px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Dark Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/50 via-brand-black/30 to-brand-black/70" />
        
        {/* Radial Glow - Reduced */}
        <div className="absolute inset-0 bg-gradient-radial from-secondary/8 via-transparent to-transparent opacity-50 hidden md:block" />
        
        {/* Golden Sphere Glow - Smaller for mobile */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-secondary/6 blur-3xl" />
        
        {/* Floating Isotipos - Hero */}
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[12%] left-[8%] w-14 h-14 opacity-[0.20] animate-float-slow" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute bottom-[25%] right-[6%] w-16 h-16 opacity-[0.18] animate-float-slow animation-delay-2000" />
        
        {/* Decorative golden particles - hidden on mobile for performance */}
        <div className="hidden lg:block absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-secondary/30" />
        <div className="hidden lg:block absolute top-[30%] right-[20%] w-1 h-1 rounded-full bg-secondary/25" />
        <div className="hidden lg:block absolute bottom-[35%] left-[25%] w-1 h-1 rounded-full bg-secondary/20" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/50 via-transparent to-brand-black/20" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 min-h-screen flex items-center" ref={heroRef}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full py-8 sm:py-12 lg:py-12">
            
            {/* Left Side - Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={staggerItem} className="mb-4 sm:mb-5 flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs sm:text-sm font-medium backdrop-blur-sm">
                  <img src={isotipoSGold} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Imersão ao Vivo • 18 de Janeiro</span>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 
                variants={staggerItem}
                className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl text-cream mb-4 sm:mb-5 leading-tight"
              >
                Operação Regularização Imobiliária de{" "}
                <span className="text-shimmer-gold">Alta Escala</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                variants={staggerItem}
                className="text-sm sm:text-base lg:text-lg text-cream/80 mb-5 sm:mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                O caminho para as advogadas transformarem regularização imobiliária em uma operação previsível: com método, posicionamento e rotina que gera volume de casos e crescimento real.
              </motion.p>

              {/* Event Info */}
              <motion.div 
                variants={staggerItem}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-6 text-cream/70"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  <span className="text-xs sm:text-sm">18 de Janeiro</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  <span className="text-xs sm:text-sm">09h às 13h</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  <span className="text-xs sm:text-sm">AO VIVO Online</span>
                </div>
              </motion.div>

              {/* Pricing */}
              <motion.div variants={staggerItem} className="mb-5 sm:mb-6">
                <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2">
                  <span className="text-cream/40 line-through text-base sm:text-lg">R$197,00</span>
                  <span className="text-secondary text-3xl sm:text-4xl md:text-5xl font-bold price-text-glow">R$19</span>
                  <span className="text-secondary text-base sm:text-lg">,00</span>
                </div>
                <p className="text-cream/50 text-xs sm:text-sm">Lote 01 • Vagas Limitadas</p>
              </motion.div>

              {/* CTA */}
              <motion.div variants={scaleIn} className="space-y-2.5 sm:space-y-3 max-w-xs lg:max-w-sm mx-auto lg:mx-0">
                <Button
                  asChild
                  variant="cta"
                  size="default"
                  className="text-xs sm:text-sm lg:text-base px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 h-auto w-full"
                >
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    COMPRAR INGRESSO AGORA | LOTE 01
                  </a>
                </Button>
                
                {/* Progress Bar - Vendas */}
                <div className="max-w-[200px] sm:max-w-[220px] mx-auto lg:mx-0">
                  <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs text-cream/60">
                    <span>Ingressos vendidos</span>
                    <span className="text-secondary font-semibold">90%</span>
                  </div>
                  <Progress value={90} className="h-1 sm:h-1.5 bg-zinc-800" />
                </div>
                
                {/* Urgency Badge */}
                <div className="flex justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-primary/20 border border-primary/40 text-cream text-[10px] sm:text-xs urgency-pulse">
                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                    Últimas vagas a R$19,00
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Fabiana Photo */}
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:max-w-none lg:ml-auto">
                {/* Photo Container with gradient blend */}
                <div className="relative rounded-2xl overflow-hidden">
                  <OptimizedImage
                    src={fabianaHero}
                    alt="Fabiana Duarte - Mentora de Advogadas"
                    className="w-full h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[70vh] object-cover object-top"
                    wrapperClassName="w-full"
                    priority={true}
                  />
                  {/* Gradient overlay for blending */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-brand-black/40 hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-brand-black/30 hidden lg:block" />
                </div>
                
                {/* Decorative Frame Elements */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 border-t-2 border-l-2 border-secondary/40 rounded-tl-xl" />
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 border-t-2 border-r-2 border-secondary/40 rounded-tr-xl" />
                <div className="absolute bottom-16 sm:bottom-20 left-3 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 border-b-2 border-l-2 border-secondary/30 rounded-bl-xl hidden sm:block" />
                <div className="absolute bottom-16 sm:bottom-20 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 border-b-2 border-r-2 border-secondary/30 rounded-br-xl hidden sm:block" />
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* SECTION 2: O Que é Essa Imersão */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-cream overflow-hidden">
        {/* Pattern Layer 1 - Circles Preto (base) */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `url(${patternCirclesPreto})`, backgroundSize: '160px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Pattern Layer 2 - Circles Marsala (lateral accent) */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/3 opacity-[0.025] hidden lg:block"
          style={{ backgroundImage: `url(${patternCirclesMarsala})`, backgroundSize: '140px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Floating Isotipos */}
        <img src={isotipoSFramedMarsala} alt="" className="hidden lg:block absolute top-[10%] right-[8%] w-11 h-11 opacity-[0.12] animate-float-slow" />
        <img src={isotipoSBlack} alt="" className="hidden lg:block absolute bottom-[15%] left-[6%] w-10 h-10 opacity-[0.08] animate-float-slow animation-delay-1500" />
        
        {/* Decorative particles only */}
        <div className="hidden lg:block absolute top-[15%] right-[10%] w-2 h-2 rounded-full bg-secondary/20" />
        <div className="hidden lg:block absolute bottom-[20%] left-[8%] w-1.5 h-1.5 rounded-full bg-primary/20" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={aboutRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={aboutInView ? "visible" : "hidden"}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-foreground mb-4 sm:mb-6">
                O que é essa <span className="text-primary">Imersão</span>?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Imersão ao vivo, com 4 horas, para você entender exatamente como advogadas estão 
                construindo escala usando regularização imobiliária como especialidade principal.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="mb-6 sm:mb-8">
              <p className="text-center text-base sm:text-lg lg:text-xl text-primary font-medium mb-6 sm:mb-8">
                Você vai sair com clareza sobre:
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4">
              {learnings.map((learning, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 lg:p-5 rounded-xl bg-background border border-secondary/15 card-premium-hover group"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-secondary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{learning}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: Pain Points */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-brand-black overflow-hidden">
        {/* Pattern Layer 1 - Connected Circles Gold (more visible) */}
        <div 
          className="absolute inset-0 opacity-[0.12] md:opacity-[0.15]"
          style={{ backgroundImage: `url(${patternCirclesConnectedGold})`, backgroundSize: '180px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Pattern Layer 2 - Circles Gold (overlay) */}
        <div 
          className="absolute inset-0 opacity-[0.06] hidden lg:block"
          style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '140px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Floating Isotipos */}
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[15%] left-[7%] w-14 h-14 opacity-[0.20] animate-float-slow" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[20%] right-[10%] w-12 h-12 opacity-[0.18] animate-float-slow animation-delay-1000" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute bottom-[18%] left-1/2 -translate-x-1/2 w-16 h-16 opacity-[0.22] animate-float-slow animation-delay-2000" />
        
        {/* Central Golden Glow - smaller on mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] rounded-full bg-secondary/8 blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={painRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={painInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-cream mb-3 sm:mb-4 lg:mb-6 leading-tight">
                Você sabe que regularização dá resultado…
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-secondary">
                Mas ainda sente que seu escritório não está crescendo como poderia?
              </p>
            </motion.div>

            <motion.p variants={staggerItem} className="text-center text-cream/70 mb-6 sm:mb-8 lg:mb-10 text-sm sm:text-base lg:text-lg">
              Talvez você se veja aqui:
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12">
              {painPoints.map((pain, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-start gap-2.5 sm:gap-3 lg:gap-4 p-4 sm:p-5 lg:p-6 rounded-xl glass-card-dark border-l-4 border-secondary"
                >
                  <span className="text-xl sm:text-2xl lg:text-3xl emoji-glow">{pain.emoji}</span>
                  <div>
                    <p className="text-cream font-semibold text-sm sm:text-base lg:text-lg">{pain.title}</p>
                    <p className="text-cream/60 text-xs sm:text-sm lg:text-base">{pain.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              variants={scaleIn}
              className="text-center p-5 sm:p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/10 border-2 border-secondary/40 border-glow-animated"
            >
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3 lg:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-cream">
                  Chegou a hora de mudar isso!
                </p>
              </div>
              <p className="text-cream/80 text-xs sm:text-sm lg:text-base">
                Você vai entender como transformar a regularização imobiliária em uma especialidade 
                que sustenta crescimento, com método, constância e posicionamento, sem precisar 
                virar refém do operacional.
              </p>
            </motion.div>
          </motion.div>
        </div>
        
      </section>

      {/* SECTION 4: Cronograma + Para Quem É */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-cream overflow-hidden">
        {/* Clean background - no patterns */}
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={scheduleRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={scheduleInView ? "visible" : "hidden"}
            className="max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
              {/* Cronograma */}
              <motion.div 
                variants={staggerItem}
                className="bg-background rounded-2xl p-5 sm:p-6 lg:p-8 border border-secondary/20 shadow-lg card-premium-hover"
              >
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary icon-bounce-hover" />
                  Cronograma
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-xl border border-secondary/10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary">18</span>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">Janeiro de 2025</p>
                      <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Sábado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-muted-foreground text-xs sm:text-sm lg:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                    <span><strong>Início:</strong> 09h00 (Horário de Brasília)</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-muted-foreground text-xs sm:text-sm lg:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                    <span><strong>Encerramento:</strong> 13h00</span>
                  </div>
                </div>
              </motion.div>

              {/* Para Quem É */}
              <motion.div 
                variants={staggerItem}
                className="bg-background rounded-2xl p-5 sm:p-6 lg:p-8 border border-secondary/20 shadow-lg card-premium-hover"
              >
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary icon-bounce-hover" />
                  Para quem é essa Imersão?
                </h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">SE VOCÊ:</p>
                <div className="space-y-2.5 sm:space-y-3">
                  {targetAudience.map((item, index) => (
                    <div key={index} className="flex items-start gap-2.5 sm:gap-3 group">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Impact Phrase */}
            <motion.div 
              variants={staggerItem}
              className="mt-8 sm:mt-10 lg:mt-12 text-center"
            >
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary font-serif italic">
                "O mercado premia quem escolhe uma especialidade, se posiciona e executa com consistência."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: Pricing */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-brand-black overflow-hidden">
        {/* Pattern Layer 1 - Connected Circles Gold (more visible) */}
        <div 
          className="absolute inset-0 opacity-[0.12] md:opacity-[0.15]"
          style={{ backgroundImage: `url(${patternCirclesConnectedGold})`, backgroundSize: '180px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Pattern Layer 2 - Circles Gold (overlay) */}
        <div 
          className="absolute inset-0 opacity-[0.06] hidden lg:block"
          style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '150px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Floating Isotipos - Premium Section */}
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[10%] left-[5%] w-14 h-14 opacity-[0.20] animate-float-slow" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[15%] right-[7%] w-12 h-12 opacity-[0.18] animate-float-slow animation-delay-1500" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute bottom-[12%] left-[8%] w-14 h-14 opacity-[0.16] animate-float-slow animation-delay-3000" />
        
        {/* Golden Glow Top - reduced on mobile */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] lg:w-[700px] h-[200px] sm:h-[300px] lg:h-[400px] bg-secondary/10 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={pricingRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-cream mb-4">
                Quanto você vai gastar para adquirir todo esse conhecimento?
              </h2>
            </motion.div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 lg:p-4 rounded-xl glass-card-dark group"
                >
                  <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-secondary group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-cream text-[10px] sm:text-xs lg:text-sm">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Price Card */}
            <motion.div 
              variants={scaleIn}
              className="text-center p-5 sm:p-6 md:p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 price-card-glow"
            >
              <p className="text-cream/40 line-through text-lg sm:text-xl lg:text-2xl mb-2">De R$197,00 por:</p>
              <div className="mb-5 sm:mb-6">
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-secondary price-text-glow">R$19</span>
                <span className="text-lg sm:text-xl lg:text-2xl text-secondary">,00</span>
                <p className="text-secondary/80 mt-2 text-xs sm:text-sm lg:text-base">no Lote 01</p>
              </div>

              <div className="max-w-xs sm:max-w-sm mx-auto">
                <Button
                  asChild
                  variant="cta"
                  size="default"
                  className="text-xs sm:text-sm lg:text-base px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 h-auto mb-3 sm:mb-4 w-full"
                >
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    COMPRAR INGRESSO AGORA | LOTE 01
                  </a>
                </Button>
                
                {/* Progress Bar */}
                <div className="max-w-[200px] sm:max-w-[220px] mx-auto mb-3">
                  <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs text-cream/60">
                    <span>Ingressos vendidos</span>
                    <span className="text-secondary font-semibold">90%</span>
                  </div>
                  <Progress value={90} className="h-1 sm:h-1.5 bg-zinc-800" />
                </div>
              </div>

              <div className="flex items-center justify-center mb-4 sm:mb-5">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-primary/30 border border-primary/50 text-cream text-[10px] sm:text-xs urgency-pulse">
                  <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                  Últimas vagas a R$19,00
                </span>
              </div>

              {/* Why so cheap */}
              <div className="pt-5 sm:pt-6 lg:pt-8 border-t border-secondary/20">
                <h4 className="text-cream font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  Por que tão barato?
                </h4>
                <p className="text-cream/70 max-w-2xl mx-auto text-xs sm:text-sm lg:text-base">
                  Esse evento foi criado para abrir as portas e mostrar, com clareza, como essa 
                  oportunidade funciona na prática. O ingresso é acessível porque a ideia é que você 
                  participe, aplique e enxergue se faz sentido dar o próximo passo com a gente depois.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6: Mentora */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-primary overflow-hidden">
        {/* Pattern Layer 1 - Circles Branco (base on marsala bg) */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url(${patternCirclesBranco})`, backgroundSize: '170px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Pattern Layer 2 - Circles Gold (partial overlay) */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.03] hidden lg:block"
          style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '150px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Floating Isotipos */}
        <img src={isotipoSFramedGoldV2} alt="" className="hidden lg:block absolute top-[18%] right-[6%] w-12 h-12 opacity-[0.12] animate-float-slow" />
        <img src={isotipoSFramedGoldV2} alt="" className="hidden lg:block absolute bottom-[20%] left-[5%] w-11 h-11 opacity-[0.10] animate-float-slow animation-delay-2000" />
        <img src={isotipoSWhite} alt="" className="hidden lg:block absolute top-[35%] left-[3%] w-9 h-9 opacity-[0.08] animate-float-slow animation-delay-1000" />
        
        {/* Golden Glow behind photo area */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] bg-secondary/12 rounded-full blur-3xl hidden md:block" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/30" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={mentorRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={mentorInView ? "visible" : "hidden"}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-cream mb-4">
                Quem será sua <span className="text-secondary">mentora</span>?
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Photo */}
              <motion.div variants={staggerItem} className="relative order-2 lg:order-1">
                <div className="golden-frame rounded-2xl overflow-hidden max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                  <OptimizedImage
                    src={mentorSobre}
                    alt="Fabiana Duarte"
                    className="w-full h-auto object-cover"
                    wrapperClassName="w-full"
                    priority={false}
                  />
                </div>
                <img
                  src={isotipoSFramedGold}
                  alt=""
                  className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 lg:-bottom-6 lg:-right-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 opacity-60"
                  loading="lazy"
                />
              </motion.div>

              {/* Bio */}
              <motion.div variants={staggerItem} className="space-y-3 sm:space-y-4 lg:space-y-6 order-1 lg:order-2">
                <h3 className="signature-premium text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center lg:text-left">
                  Fabiana Duarte
                </h3>
                <div className="space-y-3 sm:space-y-4 text-cream/85 text-xs sm:text-sm lg:text-base">
                  <p>
                    Advogada, empresária jurídica e mentora de advogadas que desejam sair da estagnação, 
                    assumir a liderança dos seus escritórios e estruturar uma advocacia que gera autoridade, 
                    lucro e liberdade.
                  </p>
                  <p>
                    Criadora da Metodologia SOBERANA, desenvolvida para ajudar advogadas a romperem com o 
                    ciclo da informalidade e da sobrecarga, e construírem um negócio jurídico posicionado, 
                    estratégico e lucrativo, com clareza, visão e direção.
                  </p>
                  <p>
                    Conduz um ecossistema que inicia, acelera, escala e sustenta o crescimento das advogadas 
                    por meio de programas, imersões, mentorias e networking.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7: FAQ */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-cream overflow-hidden">
        {/* Clean background - no patterns */}
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={faqRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-foreground mb-4">
                Dúvidas <span className="text-primary">Frequentes</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Accordion type="single" collapsible className="space-y-2.5 sm:space-y-3 lg:space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background rounded-xl border border-secondary/15 px-3 sm:px-4 lg:px-6 overflow-hidden hover:border-secondary/40 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary py-3 sm:py-4 lg:py-5 text-xs sm:text-sm lg:text-base min-h-[44px]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-3 sm:pb-4 lg:pb-5 text-xs sm:text-sm lg:text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            {/* WhatsApp CTA */}
            <motion.div variants={staggerItem} className="mt-8 sm:mt-10 lg:mt-12 text-center">
              <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">Ficou com alguma dúvida?</p>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-cream w-full sm:w-auto text-sm sm:text-base py-4 sm:py-5 min-h-[44px]"
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  TIRAR DÚVIDA PELO WHATSAPP
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: Final CTA */}
      <section className="relative py-12 sm:py-16 lg:py-24 bg-brand-black overflow-hidden">
        {/* Pattern Layer 1 - Connected Circles Gold (more visible) */}
        <div 
          className="absolute inset-0 opacity-[0.15] md:opacity-[0.18]"
          style={{ backgroundImage: `url(${patternCirclesConnectedGold})`, backgroundSize: '180px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Pattern Layer 2 - Circles Gold (overlay) */}
        <div 
          className="absolute inset-0 opacity-[0.08] hidden lg:block"
          style={{ backgroundImage: `url(${patternCirclesGold})`, backgroundSize: '140px', backgroundRepeat: 'repeat' }}
        />
        
        {/* Floating Isotipos - 4 corners */}
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[12%] left-[6%] w-14 h-14 opacity-[0.22] animate-float-slow" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute top-[15%] right-[7%] w-12 h-12 opacity-[0.20] animate-float-slow animation-delay-1000" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute bottom-[18%] left-[8%] w-14 h-14 opacity-[0.18] animate-float-slow animation-delay-2000" />
        <img src={isotipoSFramedGoldV4} alt="" className="hidden lg:block absolute bottom-[15%] right-[5%] w-14 h-14 opacity-[0.20] animate-float-slow animation-delay-3000" />
        
        {/* Golden Glow - Central - smaller on mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={finalCtaRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={finalCtaInView ? "visible" : "hidden"}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 
              variants={staggerItem}
              className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-cream mb-4 sm:mb-6"
            >
              Pronta para dar o <span className="text-shimmer-gold">próximo passo</span>?
            </motion.h2>
            <motion.p 
              variants={staggerItem}
              className="text-cream/70 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8"
            >
              Garanta seu ingresso agora e transforme sua prática em regularização imobiliária.
            </motion.p>

            <motion.div 
              variants={staggerItem}
              className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-5 sm:mb-6"
            >
              <span className="text-cream/40 line-through text-base sm:text-lg lg:text-xl">R$197,00</span>
              <span className="text-secondary text-2xl sm:text-3xl lg:text-4xl font-bold price-text-glow">R$19,00</span>
            </motion.div>

            <motion.div variants={scaleIn} className="max-w-xs sm:max-w-sm mx-auto">
              <Button
                asChild
                variant="cta"
                size="default"
                className="text-xs sm:text-sm lg:text-base px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 h-auto w-full"
              >
                <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  COMPRAR INGRESSO AGORA | LOTE 01
                </a>
              </Button>
              
              {/* Progress Bar */}
              <div className="max-w-[200px] sm:max-w-[220px] mx-auto mt-3">
                <div className="flex items-center justify-between mb-1 text-[10px] sm:text-xs text-cream/60">
                  <span>Ingressos vendidos</span>
                  <span className="text-secondary font-semibold">90%</span>
                </div>
                <Progress value={90} className="h-1 sm:h-1.5 bg-zinc-800" />
              </div>
            </motion.div>

            <motion.div 
              variants={staggerItem}
              className="mt-3 sm:mt-4 flex items-center justify-center"
            >
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-primary/30 border border-primary/50 text-cream text-[10px] sm:text-xs urgency-pulse">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                Últimas vagas a R$19,00
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default OperacaoRegularizacaoLanding;
