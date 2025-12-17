import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Para quem é a mentoria Soberana?",
    answer: "A mentoria é para advogadas que desejam transformar sua advocacia técnica em um negócio estruturado e lucrativo. Se você quer sair da operação, aumentar seus honorários, ter mais tempo livre e construir um legado, este é o lugar certo.",
  },
  {
    question: "Quanto tempo dura o programa?",
    answer: "A mentoria individual tem duração de 12 meses com encontros quinzenais. O curso completo pode ser feito no seu ritmo, com acesso vitalício ao conteúdo. O Small Group acontece em ciclos de 6 meses.",
  },
  {
    question: "Preciso ter muita experiência para participar?",
    answer: "Não. A metodologia funciona tanto para advogadas em início de carreira quanto para profissionais experientes que querem estruturar melhor seus negócios. O importante é ter vontade de crescer.",
  },
  {
    question: "Qual o investimento?",
    answer: "O investimento varia de acordo com o programa escolhido. Temos opções que cabem em diferentes orçamentos, desde materiais gratuitos até a mentoria individual premium. Entre em contato para conhecer os valores.",
  },
  {
    question: "Existe garantia de resultados?",
    answer: "Oferecemos garantia de 7 dias em todos os nossos programas. Se você aplicar a metodologia e não ficar satisfeita, devolvemos seu investimento integralmente.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Dependendo do programa, você terá acesso a suporte via comunidade exclusiva, WhatsApp direto com a mentora, ou ambos. Nenhuma dúvida fica sem resposta.",
  },
  {
    question: "Posso parcelar o investimento?",
    answer: "Sim! Oferecemos parcelamento em até 12x no cartão de crédito. Também temos condições especiais para pagamento à vista.",
  },
  {
    question: "Funciona para qualquer área do Direito?",
    answer: "Sim. A metodologia é sobre gestão de negócios jurídicos e não sobre técnica jurídica específica. Funciona para advogadas de todas as áreas: trabalhista, cível, tributário, família, previdenciário, etc.",
  },
];

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="container-soberana">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-4">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Perguntas{" "}
            <span className="text-primary">Frequentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre a metodologia e os programas Soberana.
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
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-secondary/50"
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
              href="https://wa.me/5511999999999"
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