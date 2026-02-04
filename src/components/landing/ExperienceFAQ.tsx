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
    question: "Preciso atuar em uma área específica do Direito?",
    answer: "Não. O Experience Start é ideal para advogadas de qualquer área que querem estruturar um negócio jurídico lucrativo. Você aprenderá técnicas aplicáveis para qualquer nicho."
  },
  {
    question: "O que são os 4 Pilares do Método Soberano?",
    answer: "Os 4 pilares são: Estrutura (oferta clara e proposta fechável), Posicionamento (conteúdo estratégico e autoridade), Gestão (rotina comercial e previsibilidade) e Escala (precificação alta e contratos maiores). Juntos, formam o caminho para faturar +R$ 50k/mês."
  },
  {
    question: "Como a Inteligência Artificial será abordada no evento?",
    answer: "Você aprenderá a usar IA como ferramenta estratégica para automatizar tarefas, criar conteúdo, otimizar processos e liberar +10 horas semanais do seu tempo. Apresentaremos as 'IAs Soberanas' — ferramentas personalizadas para advogadas."
  },
  {
    question: "O evento é para iniciantes ou advogadas experientes?",
    answer: "Para ambas! Se você está começando, terá o mapa completo para construir uma advocacia lucrativa do zero. Se já tem experiência, aprenderá estratégias avançadas de escala, precificação premium e automação que aceleram seus resultados."
  },
  {
    question: "Vou aprender sobre captação de clientes?",
    answer: "Sim! O pilar de Gestão aborda captação, follow-up e proposta. Você aprenderá a criar uma rotina comercial previsível para atrair clientes qualificados de forma consistente."
  },
  {
    question: "Como o evento me ajuda a faturar +R$ 50k/mês?",
    answer: "Você receberá um plano de ação completo baseado nos 4 pilares, com estratégias testadas por advogadas que já alcançaram essa meta. Inclui estrutura de oferta, posicionamento, gestão comercial e escala."
  },
  {
    question: "Onde fica o local e como chegar?",
    answer: "O evento será no Espaço Mind — R. Abílio Soares, 607 - Paraíso, São Paulo/SP. Fácil acesso por metrô (Estação Paraíso) e diversas linhas de ônibus. Há estacionamentos conveniados próximos com valores especiais para participantes."
  },
  {
    question: "O que está incluso na inscrição?",
    answer: "Coffee break premium durante toda a imersão, materiais exclusivos, acesso ao grupo VIP de networking, certificado digital de participação e bônus especiais revelados no dia do evento. Almoço não incluso (pausa de 1h30 para aproveitar os restaurantes da região)."
  },
  {
    question: "Posso cancelar ou transferir minha inscrição?",
    answer: "Sim! Cancelamento com reembolso integral até 7 dias antes do evento. Após esse prazo, você pode transferir sua vaga para outra advogada sem custo adicional."
  },
  {
    question: "Vou receber certificado?",
    answer: "Sim! Você receberá um certificado digital de participação ao final do evento, válido para comprovação de horas de capacitação profissional continuada."
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
          className="text-center mb-10 sm:mb-16"
        >
          {/* Isotipo S decoration */}
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <img src={isotipoSGold} alt="" className="w-8 h-8 sm:w-10 sm:h-10 isotipo-glow" />
          </motion.div>
          
          <span className="badge-gold mb-4">Dúvidas Frequentes</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4 sm:mb-6">
            Tudo o que você <span className="text-primary">precisa saber</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Preparamos as respostas para as perguntas mais comuns sobre o Experience Start.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-secondary/20 rounded-lg px-4 sm:px-6 data-[state=open]:border-secondary/50 data-[state=open]:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-serif text-base sm:text-lg hover:text-primary hover:no-underline py-4 sm:py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4 sm:pb-5">
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
