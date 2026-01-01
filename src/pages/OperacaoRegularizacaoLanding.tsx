import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Helmet } from "react-helmet-async";
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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { PremiumBackground } from "@/components/ui/premium-background";
import { Footer } from "@/components/landing/Footer";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

import mentorSobre from "@/assets/mentor-sobre.jpg";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";

const OperacaoRegularizacaoLanding = () => {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const painRef = useRef(null);
  const scheduleRef = useRef(null);
  const pricingRef = useRef(null);
  const mentorRef = useRef(null);
  const faqRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.2 });
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.2 });
  const painInView = useInView(painRef, { once: true, amount: 0.2 });
  const scheduleInView = useInView(scheduleRef, { once: true, amount: 0.2 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.2 });
  const mentorInView = useInView(mentorRef, { once: true, amount: 0.2 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.2 });

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

  return (
    <>
      <Helmet>
        <title>Operação Regularização Imobiliária de Alta Escala | Soberana</title>
        <meta name="description" content="Aprenda o método para transformar regularização imobiliária em uma esteira de escritório: atendimento padronizado, processos e execução técnica, com o caminho para escalar até 150k/mês." />
        <meta name="keywords" content="regularização imobiliária, advocacia imobiliária, escritório de advocacia, escala, faturamento, advogadas" />
        <meta property="og:title" content="Operação Regularização Imobiliária de Alta Escala | Soberana" />
        <meta property="og:description" content="O caminho para advogadas transformarem regularização imobiliária em uma operação previsível com método, posicionamento e rotina." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://soberana.club/operacao-regularizacao" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Operação Regularização Imobiliária de Alta Escala",
            "description": "Imersão ao vivo para advogadas que querem transformar regularização imobiliária em uma operação escalável.",
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
              "url": "https://soberana.club"
            },
            "offers": {
              "@type": "Offer",
              "price": "19.00",
              "priceCurrency": "BRL",
              "availability": "https://schema.org/LimitedAvailability"
            }
          })}
        </script>
      </Helmet>

      {/* SECTION 1: Hero */}
      <PremiumBackground
        variant="dark"
        pattern="geometric"
        patternOpacity={0.06}
        showIsotipos
        isotipoVariant="gold"
        showVignette
        className="min-h-screen flex items-center relative overflow-hidden"
      >
        <div className="container mx-auto px-4 py-20 lg:py-28" ref={heroRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={staggerItem} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Imersão ao Vivo • 18 de Janeiro
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              variants={staggerItem}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream mb-6 leading-tight"
            >
              Operação Regularização Imobiliária de{" "}
              <span className="text-secondary">Alta Escala</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={staggerItem}
              className="text-lg md:text-xl text-cream/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              O caminho para as advogadas transformarem regularização imobiliária em uma operação previsível: 
              com método, posicionamento e rotina que gera volume de casos e crescimento real de escritório.
            </motion.p>

            {/* Event Info */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10 text-cream/70"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                <span>18 de Janeiro</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span>09h00 às 13h00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                <span>AO VIVO e Online</span>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div variants={staggerItem} className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-cream/50 line-through text-xl">R$197,00</span>
                <span className="text-secondary text-4xl md:text-5xl font-bold">R$19,00</span>
              </div>
              <p className="text-cream/60 text-sm">Lote 01 - Vagas Limitadas</p>
            </motion.div>

            {/* CTA */}
            <motion.div variants={scaleIn} className="space-y-4">
              <Button
                asChild
                variant="cta"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                  <Lock className="w-5 h-5 mr-2" />
                  COMPRAR INGRESSO AGORA | LOTE 01
                </a>
              </Button>
              
              {/* Urgency Badge */}
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/30 border border-primary/50 text-cream text-sm">
                  <AlertCircle className="w-4 h-4 text-secondary animate-pulse" />
                  90% dos ingressos vendidos a R$19,00
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </PremiumBackground>

      {/* SECTION 2: O Que é Essa Imersão */}
      <PremiumBackground
        variant="light"
        pattern="circles-gold"
        patternOpacity={0.04}
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4" ref={aboutRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={aboutInView ? "visible" : "hidden"}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                O que é essa <span className="text-primary">Imersão</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Imersão ao vivo, com 4 horas, para você entender exatamente como advogadas estão 
                construindo escala usando regularização imobiliária como especialidade principal.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="mb-8">
              <p className="text-center text-xl text-primary font-medium mb-8">
                Você vai sair com clareza sobre:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learnings.map((learning, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-start gap-3 p-5 rounded-xl bg-background border border-secondary/20 hover:border-secondary/40 hover:shadow-lg transition-all duration-300"
                >
                  <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{learning}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </PremiumBackground>

      {/* SECTION 3: Pain Points */}
      <PremiumBackground
        variant="dark"
        pattern="geometric"
        patternOpacity={0.05}
        showIsotipos
        isotipoVariant="gold"
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4" ref={painRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={painInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-6 leading-tight">
                Você sabe que regularização dá resultado…
              </h2>
              <p className="text-xl text-secondary">
                Mas ainda sente que seu escritório não está crescendo como poderia?
              </p>
            </motion.div>

            <motion.p variants={staggerItem} className="text-center text-cream/70 mb-10 text-lg">
              Talvez você se veja aqui:
            </motion.p>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {painPoints.map((pain, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-start gap-4 p-6 rounded-xl bg-zinc-900/50 border-l-4 border-secondary"
                >
                  <span className="text-3xl">{pain.emoji}</span>
                  <div>
                    <p className="text-cream font-semibold text-lg">{pain.title}</p>
                    <p className="text-cream/60">{pain.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              variants={scaleIn}
              className="text-center p-8 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/10 border border-secondary/30"
            >
              <p className="text-2xl md:text-3xl font-serif text-cream mb-4">
                Chegou a hora de mudar isso!
              </p>
              <p className="text-cream/80">
                Você vai entender como transformar a regularização imobiliária em uma especialidade 
                que sustenta crescimento — com método, constância e posicionamento — sem precisar 
                virar refém do operacional.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </PremiumBackground>

      {/* SECTION 4: Cronograma + Para Quem É */}
      <PremiumBackground
        variant="light"
        pattern="circles-gold"
        patternOpacity={0.03}
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4" ref={scheduleRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={scheduleInView ? "visible" : "hidden"}
            className="max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Cronograma */}
              <motion.div 
                variants={staggerItem}
                className="bg-background rounded-2xl p-8 border border-secondary/20 shadow-lg"
              >
                <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-secondary" />
                  Cronograma
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-secondary">18</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">Janeiro de 2025</p>
                      <p className="text-muted-foreground">Sábado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-secondary" />
                    <span><strong>Início:</strong> 09h00 (Horário de Brasília)</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-secondary" />
                    <span><strong>Encerramento:</strong> 13h00</span>
                  </div>
                </div>
              </motion.div>

              {/* Para Quem É */}
              <motion.div 
                variants={staggerItem}
                className="bg-background rounded-2xl p-8 border border-secondary/20 shadow-lg"
              >
                <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-secondary" />
                  Para quem é essa Imersão?
                </h3>
                <p className="text-muted-foreground mb-4">SE VOCÊ:</p>
                <div className="space-y-3">
                  {targetAudience.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Impact Phrase */}
            <motion.div 
              variants={staggerItem}
              className="mt-12 text-center"
            >
              <p className="text-xl md:text-2xl text-primary font-serif italic">
                "O mercado premia quem escolhe uma especialidade, se posiciona e executa com consistência."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </PremiumBackground>

      {/* SECTION 5: Pricing */}
      <PremiumBackground
        variant="dark"
        pattern="geometric"
        patternOpacity={0.05}
        showGlow
        glowColor="gold"
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4" ref={pricingRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-4">
                Quanto você vai gastar para adquirir todo esse conhecimento?
              </h2>
            </motion.div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-secondary/20"
                >
                  <benefit.icon className="w-6 h-6 text-secondary" />
                  <span className="text-cream">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Price Card */}
            <motion.div 
              variants={scaleIn}
              className="text-center p-10 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-secondary/30 shadow-2xl shadow-secondary/10"
            >
              <p className="text-cream/50 line-through text-2xl mb-2">De R$197,00 por:</p>
              <div className="mb-6">
                <span className="text-6xl md:text-7xl font-bold text-secondary">R$19</span>
                <span className="text-2xl text-secondary">,00</span>
                <p className="text-secondary/80 mt-2">no Lote 01</p>
              </div>

              <Button
                asChild
                variant="cta"
                size="lg"
                className="text-lg px-10 py-7 h-auto mb-6"
              >
                <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                  <Lock className="w-5 h-5 mr-2" />
                  COMPRAR INGRESSO AGORA | LOTE 01
                </a>
              </Button>

              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/30 border border-primary/50 text-cream text-sm">
                  <AlertCircle className="w-4 h-4 text-secondary animate-pulse" />
                  90% dos ingressos vendidos a R$19,00
                </span>
              </div>

              {/* Why so cheap */}
              <div className="pt-8 border-t border-secondary/20">
                <h4 className="text-cream font-semibold text-lg mb-3 flex items-center justify-center gap-2">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                  Por que tão barato?
                </h4>
                <p className="text-cream/70 max-w-2xl mx-auto">
                  Esse evento foi criado para abrir as portas e mostrar, com clareza, como essa 
                  oportunidade funciona na prática. O ingresso é acessível porque a ideia é que você 
                  participe, aplique e enxergue se faz sentido dar o próximo passo com a gente depois.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </PremiumBackground>

      {/* SECTION 6: Mentora */}
      <PremiumBackground
        variant="marsala"
        pattern="circles-white"
        patternOpacity={0.08}
        showVignette
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4" ref={mentorRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={mentorInView ? "visible" : "hidden"}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-4">
                Quem será sua <span className="text-secondary">mentora</span>?
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Photo */}
              <motion.div variants={staggerItem} className="relative">
                <div className="golden-frame rounded-2xl overflow-hidden">
                  <img
                    src={mentorSobre}
                    alt="Fabiana Duarte"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <img
                  src={isotipoSGold}
                  alt=""
                  className="absolute -bottom-6 -right-6 w-20 h-20 opacity-60"
                />
              </motion.div>

              {/* Bio */}
              <motion.div variants={staggerItem} className="space-y-6">
                <h3 className="font-serif text-3xl md:text-4xl text-cream">
                  Fabiana Duarte
                </h3>
                <div className="space-y-4 text-cream/80">
                  <p>
                    Advogada, empresária jurídica e mentora de advogadas que desejam sair da estagnação, 
                    assumir a liderança dos seus escritórios e estruturar uma advocacia que gera autoridade, 
                    lucro e liberdade.
                  </p>
                  <p>
                    Criadora da Metodologia SOBERANA, desenvolvida para ajudar advogadas a romperem com o 
                    ciclo da informalidade e da sobrecarga, e construírem um negócio jurídico posicionado, 
                    estratégico e lucrativo — com clareza, visão e direção.
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
      </PremiumBackground>

      {/* SECTION 7 & 8: FAQ */}
      <PremiumBackground
        variant="light"
        pattern="circles-gold"
        patternOpacity={0.03}
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4" ref={faqRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={staggerItem} className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                Dúvidas <span className="text-primary">Frequentes</span>
              </h2>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background rounded-xl border border-secondary/20 px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            {/* WhatsApp CTA */}
            <motion.div variants={staggerItem} className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Ficou com alguma dúvida?</p>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-cream"
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  TIRAR DÚVIDA PELO WHATSAPP
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </PremiumBackground>

      {/* SECTION 9: Final CTA */}
      <PremiumBackground
        variant="dark"
        pattern="geometric"
        patternOpacity={0.06}
        showGlow
        glowColor="gold"
        className="py-20 lg:py-28"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-6">
              Pronta para dar o <span className="text-secondary">próximo passo</span>?
            </h2>
            <p className="text-cream/70 text-lg mb-8">
              Garanta seu ingresso agora e transforme sua prática em regularização imobiliária.
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-cream/50 line-through text-xl">R$197,00</span>
              <span className="text-secondary text-4xl font-bold">R$19,00</span>
            </div>

            <Button
              asChild
              variant="cta"
              size="lg"
              className="text-lg px-10 py-7 h-auto"
            >
              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                <Lock className="w-5 h-5 mr-2" />
                COMPRAR INGRESSO AGORA | LOTE 01
              </a>
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/30 border border-primary/50 text-cream text-sm">
                <AlertCircle className="w-4 h-4 text-secondary animate-pulse" />
                90% dos ingressos vendidos a R$19,00
              </span>
            </div>
          </motion.div>
        </div>
      </PremiumBackground>

      <Footer />
    </>
  );
};

export default OperacaoRegularizacaoLanding;
