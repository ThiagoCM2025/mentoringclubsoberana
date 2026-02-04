import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PremiumBackground, isotipoSGold } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";

const faqs = [
  {
    question: "Preciso ter experiência em Direito Imobiliário para começar?",
    answer:
      "Não! A metodologia foi criada justamente para advogadas que desejam estruturar um negócio jurídico lucrativo. Você aprenderá do zero: desde a estruturação da oferta até a escala com contratos maiores.",
  },
  {
    question: "Como funciona a metodologia dos 4 Pilares?",
    answer:
      "Os 4 Pilares — Estrutura, Posicionamento, Gestão e Escala — formam um sistema integrado. Estrutura define sua oferta fechável. Posicionamento constrói autoridade. Gestão cria rotina comercial previsível. Escala permite crescimento com contratos maiores.",
  },
  {
    question: "Em quanto tempo posso alcançar os +50k/mês?",
    answer:
      "O tempo varia conforme sua dedicação e ponto de partida. Advogadas que aplicam a metodologia de forma consistente alcançam resultados expressivos em 6 a 12 meses. A chave está na implementação dos 4 pilares de forma estratégica.",
  },
  {
    question: "Vocês ensinam técnica jurídica ou gestão de negócio?",
    answer:
      "O Método Soberano foca em gestão de negócio: estruturar oferta, posicionar com autoridade, criar rotina comercial e escalar com ticket maior. Não é aula de tese, peça ou estratégia processual.",
  },
  {
    question: "A metodologia funciona para quem já tem escritório?",
    answer:
      "Sim! Se você já atua mas não consegue escalar ou cobrar honorários de alto ticket, os pilares de Posicionamento, Gestão e Escala vão destravar seu crescimento. Muitas alunas já experientes dobraram ou triplicaram o faturamento.",
  },
  {
    question: "Como funciona o pilar de Gestão?",
    answer:
      "No pilar de Gestão você aprende a criar rotina comercial previsível: captação, follow-up e proposta. Além de organizar processos e implementar ferramentas de automação para trabalhar menos e faturar mais.",
  },
  {
    question: "Qual programa é ideal para quem está começando?",
    answer:
      "Se está começando do zero, recomendo o Soberana Experience Start para uma imersão prática, ou a Mentoria 360° para acompanhamento completo. Ambos te dão a base estratégica para estruturar seu negócio desde o início.",
  },
];

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <PremiumBackground
      variant="light"
      pattern="circles-black"
      patternOpacity={0.06}
      showIsotipos
      isotipoVariant="gold"
      showTopBorder
      isInView={isInView}
      sectionClassName="py-14 md:py-20 lg:py-24 xl:py-32 px-4 md:px-8"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-10 lg:mb-14 xl:mb-16"
        >
          {/* Isotipo S decoration */}
          <motion.div variants={staggerItem} className="flex justify-center mb-4">
            <img src={isotipoSGold} alt="" className="w-10 h-10 isotipo-glow" />
          </motion.div>

          <motion.span variants={staggerItem} className="badge-gold mb-4">
            FAQ
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-foreground mb-5 lg:mb-6"
          >
            Perguntas <span className="text-primary">Frequentes</span>
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Tire suas dúvidas sobre o Método Soberana e o Direito Imobiliário.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={staggerItem}>
                <AccordionItem
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
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            Ainda tem dúvidas?{" "}
            <a
              href="https://wa.me/5511993563468?text=Olá! Tenho uma dúvida sobre os programas Soberana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-medium"
            >
              Fale conosco no WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
