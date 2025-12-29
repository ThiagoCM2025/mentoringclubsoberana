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

// Premium visual assets
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-s-gold.png";

interface ProgramFAQProps {
  program: Program;
}

export const ProgramFAQ = ({ program }: ProgramFAQProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (program.faq.length === 0) return null;

  return (
    <section ref={ref} className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Golden top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      
      {/* Premium pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundSize: '350px 350px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Floating Isotipos */}
      <motion.img 
        src={isotipoGold}
        alt=""
        className="absolute top-20 right-16 w-14 md:w-20 h-auto opacity-[0.10] animate-float-slow pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.10 } : {}}
        transition={{ duration: 1 }}
      />
      <motion.img 
        src={isotipoGold}
        alt=""
        className="absolute bottom-24 left-12 w-12 md:w-16 h-auto opacity-[0.08] animate-float-slow pointer-events-none"
        style={{ animationDelay: '1.5s' }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.08 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
      />

      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 border border-secondary/20">
            Dúvidas Frequentes
          </span>
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
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-secondary/30 transition-colors"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                  <span className="font-medium text-foreground">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed">
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

      {/* Golden bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
    </section>
  );
};
