import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Program } from "@/data/programs";

interface ProgramFAQProps {
  program: Program;
}

export const ProgramFAQ = ({ program }: ProgramFAQProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (program.faq.length === 0) return null;

  return (
    <section ref={ref} className="section-padding bg-muted/30">
      <div className="container-soberana">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="badge-gold mb-4">Dúvidas Frequentes</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Perguntas sobre o{" "}
            <span className="text-primary">{program.title}</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {program.faq.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                  <span className="font-medium text-foreground">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-2">
            Ainda tem dúvidas?
          </p>
          <a
            href="https://wa.me/5511993563468?text=Olá! Tenho dúvidas sobre o programa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-secondary/80 font-semibold underline underline-offset-4 transition-colors"
          >
            Fale com nossa equipe no WhatsApp →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
