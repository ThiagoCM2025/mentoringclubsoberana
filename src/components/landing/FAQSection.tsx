import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import isotipo from "@/assets/brand/isotipo.png";

const faqs = [
  {
    question: "Qual programa é ideal para quem está começando?",
    answer:
      "Se você está começando, recomendo o Workshop Soberana IA para ganhar produtividade com tecnologia, ou o Soberana Experience Start para uma imersão presencial em São Paulo. Ambos são ótimas portas de entrada para o ecossistema.",
  },
  {
    question: "Preciso ter experiência em marketing digital?",
    answer:
      "Não! A metodologia foi criada pensando em advogadas que são excelentes tecnicamente mas não dominam gestão, marketing e vendas. Você aprenderá do zero, de forma prática e aplicada à advocacia.",
  },
  {
    question: "Como funciona o Setup de Tráfego Pago na Mentoria 360°?",
    answer:
      "Na Mentoria 360° eu não apenas ensino sobre tráfego pago - eu configuro suas campanhas de anúncios junto com você. É um diferencial único onde implementamos juntas a estratégia de captação de clientes.",
  },
  {
    question: "Posso participar da Elite sem ter feito a 360°?",
    answer:
      "O Soberana Elite é exclusivo para graduadas da Mentoria 360° ou escritórios já consolidados. Se você tem um escritório estruturado e busca escala, networking e mentoria de alto nível, pode se candidatar diretamente.",
  },
  {
    question: "As oficinas presenciais são apenas em São Paulo?",
    answer:
      "Atualmente o Soberana Experience Start acontece em São Paulo, mas planejamos expandir para outras capitais. Fique atenta às novidades nas nossas redes sociais!",
  },
  {
    question: "Qual o investimento dos programas?",
    answer:
      "O investimento varia de acordo com o programa. O Experience Start é R$ 299. Para os demais programas (Aceleração, 360° e Elite), entre em contato com nosso suporte para conhecer as condições.",
  },
  {
    question: "Funciona para qualquer área do Direito?",
    answer:
      "Sim! A metodologia é sobre gestão de negócios jurídicos e não sobre técnica específica. Funciona para advogadas de todas as áreas: imobiliário, trabalhista, cível, tributário, família, previdenciário, etc.",
  },
  {
    question: "Existe garantia de resultados?",
    answer:
      "Oferecemos garantia nos programas online. Mas mais importante: nosso ecossistema é desenhado para te acompanhar em cada fase da sua jornada, garantindo suporte contínuo para seus resultados.",
  },
];

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="faq" className="section-padding bg-cream relative overflow-hidden">
      {/* Isotipo decorations */}
      <div className="absolute top-20 left-10 opacity-5">
        <img src={isotipo} alt="" className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-5">
        <img src={isotipo} alt="" className="w-24 h-24" />
      </div>

      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-4">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Perguntas <span className="text-primary">Frequentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre os programas do Ecossistema Soberana.
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
    </section>
  );
};
