import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import patternCirclesBlack from "@/assets/brand/pattern-circles-black.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import isotipoBlack from "@/assets/brand/isotipo-black.png";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";

const faqs = [
  {
    question: "Onde fica o local do evento?",
    answer: "O evento será realizado no Espaço Mind — R. Abílio Soares, 607 - Paraíso, São Paulo/SP. Localização privilegiada, de fácil acesso por metrô (Estação Paraíso) e diversas linhas de ônibus."
  },
  {
    question: "Tem estacionamento no local?",
    answer: "Sim! Há estacionamentos conveniados próximos ao local com valores especiais para participantes do evento. Enviaremos a lista completa por e-mail após a confirmação da sua inscrição."
  },
  {
    question: "O almoço está incluso?",
    answer: "O almoço não está incluso, mas teremos uma pausa de 1h30 para você aproveitar os diversos restaurantes na região. Coffee break premium está incluso durante toda a imersão!"
  },
  {
    question: "Posso cancelar minha inscrição?",
    answer: "Sim! Você pode cancelar até 7 dias antes do evento e receber reembolso integral. Após esse prazo, você pode transferir sua vaga para outra pessoa sem custo adicional."
  },
  {
    question: "O que devo levar no dia?",
    answer: "Recomendamos trazer: notebook ou tablet (opcional, mas útil), bloco de notas, caneta, e muita vontade de transformar sua advocacia! Teremos Wi-Fi disponível."
  },
  {
    question: "Vou receber certificado?",
    answer: "Sim! Você receberá um certificado digital de participação ao final do evento, que pode ser usado para comprovar horas de capacitação profissional."
  },
  {
    question: "Posso indicar uma amiga advogada?",
    answer: "Claro! Temos um programa de indicação especial. Indique amigas advogadas e ganhe brindes exclusivos. Entre em contato conosco para saber mais sobre os benefícios."
  },
  {
    question: "Qual o dresscode do evento?",
    answer: "Smart casual. Vista-se de forma confortável para um dia inteiro de imersão. Nada muito formal, mas elegante. Você estará entre colegas em um ambiente profissional e acolhedor."
  }
];

export const ExperienceFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-cream relative overflow-hidden">
      {/* Circle Pattern Background - Black (subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url(${patternCirclesBlack})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      {/* Isotipo Gold - top left */}
      <div className="absolute top-20 left-12 opacity-[0.14] hidden lg:block animate-float-slow">
        <img src={isotipoGold} alt="" className="w-32 h-32" />
      </div>
      
      {/* Isotipo Black - bottom right */}
      <div className="absolute bottom-20 right-12 opacity-[0.10] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoBlack} alt="" className="w-28 h-28" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-white/60" />

      <div className="container-soberana relative z-10">
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
            <img src={isotipoSGold} alt="" className="w-10 h-10 isotipo-glow" />
          </motion.div>
          
          <span className="badge-gold mb-4">Dúvidas Frequentes</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Tudo o que você <span className="text-primary">precisa saber</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Preparamos as respostas para as perguntas mais comuns sobre o Experience Start.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-secondary/20 rounded-lg px-6 data-[state=open]:border-secondary/50 data-[state=open]:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-serif text-lg hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            Ainda tem dúvidas?{" "}
            <a
              href="https://wa.me/5511993563468?text=Olá! Tenho uma dúvida sobre o Experience Start"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-medium"
            >
              Fale conosco no WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
