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
import { PremiumBackground, isotipoSGold } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ProgramFAQProps {
  program: Program;
}

export const ProgramFAQ = ({ program }: ProgramFAQProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (program.faq.length === 0) return null;

  return (
    <PremiumBackground
      variant="light"
      pattern="circles-gold"
      patternOpacity={0.05}
      showIsotipos
      isotipoVariant="gold"
      showTopBorder
      showBottomBorder
      showGlow
      glowColor="gold"
      isInView={isInView}
      sectionClassName="section-padding"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <motion.span
            variants={staggerItem}
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 border border-secondary/20"
          >
            Dúvidas Frequentes
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4"
          >
            Perguntas sobre o <span className="text-primary">{program.title}</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {program.faq.map((item, index) => (
              <motion.div key={index} variants={staggerItem}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-secondary/30 transition-colors"
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                    <span className="font-medium text-foreground">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-2">Ainda tem dúvidas?</p>
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
    </PremiumBackground>
  );
};
