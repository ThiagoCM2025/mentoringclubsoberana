import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, Car, Coffee, RefreshCw, Briefcase, Award, Users, Shirt, MessageCircle } from "lucide-react";
import patternGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-s-gold.png";

const faqs = [
  {
    icon: MapPin,
    question: "Onde fica o local do evento?",
    answer: "O evento será realizado no Espaço Mind — R. Abílio Soares, 607 - Paraíso, São Paulo/SP. Localização privilegiada, de fácil acesso por metrô (Estação Paraíso) e diversas linhas de ônibus."
  },
  {
    icon: Car,
    question: "Tem estacionamento no local?",
    answer: "Sim! Há estacionamentos conveniados próximos ao local com valores especiais para participantes do evento. Enviaremos a lista completa por e-mail após a confirmação da sua inscrição."
  },
  {
    icon: Coffee,
    question: "O almoço está incluso?",
    answer: "O almoço não está incluso, mas teremos uma pausa de 1h30 para você aproveitar os diversos restaurantes na região. Coffee break premium está incluso durante toda a imersão!"
  },
  {
    icon: RefreshCw,
    question: "Posso cancelar minha inscrição?",
    answer: "Sim! Você pode cancelar até 7 dias antes do evento e receber reembolso integral. Após esse prazo, você pode transferir sua vaga para outra pessoa sem custo adicional."
  },
  {
    icon: Briefcase,
    question: "O que devo levar no dia?",
    answer: "Recomendamos trazer: notebook ou tablet (opcional, mas útil), bloco de notas, caneta, e muita vontade de transformar sua advocacia! Teremos Wi-Fi disponível."
  },
  {
    icon: Award,
    question: "Vou receber certificado?",
    answer: "Sim! Você receberá um certificado digital de participação ao final do evento, que pode ser usado para comprovar horas de capacitação profissional."
  },
  {
    icon: Users,
    question: "Posso indicar uma amiga advogada?",
    answer: "Claro! Temos um programa de indicação especial. Indique amigas advogadas e ganhe brindes exclusivos. Entre em contato conosco para saber mais sobre os benefícios."
  },
  {
    icon: Shirt,
    question: "Qual o dresscode do evento?",
    answer: "Smart casual. Vista-se de forma confortável para um dia inteiro de imersão. Nada muito formal, mas elegante. Você estará entre colegas em um ambiente profissional e acolhedor."
  }
];

export const ExperienceFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const whatsappLink = "https://wa.me/5511999999999?text=Olá! Tenho uma dúvida sobre o Experience Start...";

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 bg-cream overflow-hidden"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${patternGold})`,
          backgroundSize: "300px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Decorative isotipos */}
      <motion.img
        src={isotipoGold}
        alt=""
        className="absolute top-10 right-10 w-24 h-24 opacity-10"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.img
        src={isotipoGold}
        alt=""
        className="absolute bottom-10 left-10 w-20 h-20 opacity-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wider uppercase mb-4">
            Dúvidas Frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
            Tudo o que você precisa saber
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Preparamos as respostas para as perguntas mais comuns sobre o Experience Start
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border border-gold/20 px-6 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <AccordionTrigger className="text-left py-5 hover:no-underline group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                      <faq.icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="font-semibold text-primary group-hover:text-gold transition-colors">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/70 pl-14 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-foreground/70 mb-4">
            Ainda tem dúvidas? Fale diretamente conosco!
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
};
