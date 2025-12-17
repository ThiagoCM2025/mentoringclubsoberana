import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Clock, DollarSign, Flame, ArrowRight } from "lucide-react";
import patternMarsala from "@/assets/brand/pattern-marsala.png";

const problems = [
  {
    icon: Target,
    text: "Dificuldade em atrair clientes de forma consistente",
  },
  {
    icon: Clock,
    text: "Sobrecarga operacional que impede a visão estratégica",
  },
  {
    icon: DollarSign,
    text: "Insegurança na hora de cobrar e precificar o seu valor",
  },
  {
    icon: Flame,
    text: 'Sensação de estar "apagando incêndios" em vez de liderar um escritório',
  },
];

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-cream relative overflow-hidden">
      {/* Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${patternMarsala})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
        }}
      />

      <div className="container-soberana relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="badge-gold mb-4">A Realidade</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              Você é uma excelente advogada, mas o seu{" "}
              <span className="text-primary">faturamento ainda não reflete isso?</span>
            </h2>
          </motion.div>

          {/* Intro */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground text-center mb-10"
          >
            Muitas advogadas talentosas enfrentam os mesmos desafios:
          </motion.p>

          {/* Pain Points List */}
          <div className="space-y-4 mb-12">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4 p-5 rounded-xl bg-background/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-lg text-foreground font-medium">{problem.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Solution Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-background rounded-2xl p-8 border border-secondary/20 shadow-lg relative overflow-hidden"
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full" />
            
            <p className="text-lg md:text-xl text-foreground leading-relaxed relative z-10">
              A verdade é que a <strong>técnica jurídica ganha processos</strong>, 
              mas apenas a <span className="text-primary font-semibold">Visão Empresarial</span> constrói{" "}
              <span className="text-secondary font-semibold">liberdade e lucro</span>.
            </p>
            <p className="text-lg md:text-xl text-foreground mt-4 leading-relaxed relative z-10">
              Eu criei a <strong className="text-primary">Metodologia Soberana</strong> para 
              ser a ponte entre a advogada que você é e a empresária que você precisa ser.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 flex justify-center relative z-10"
            >
              <a
                href="#programas"
                className="inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all"
              >
                Conhecer os Programas
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
