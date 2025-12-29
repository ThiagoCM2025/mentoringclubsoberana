import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Clock, DollarSign, Flame, ArrowRight } from "lucide-react";
import patternCirclesMarsala from "@/assets/brand/pattern-circles-marsala.png";
import isotipoMarsala from "@/assets/brand/isotipo-marsala.png";
import isotipoSMarsala from "@/assets/brand/isotipo-s-marsala.png";

const problems = [
  {
    icon: Target,
    title: 'A "Montanha-Russa" de Clientes',
    text: "Dificuldade em atrair contratos de alto ticket de forma previsível.",
  },
  {
    icon: Clock,
    title: "Escrava do Operacional",
    text: "Você gasta horas em peças e burocracias, sem tempo para ser a CEO que fecha grandes negócios.",
  },
  {
    icon: DollarSign,
    title: "Medo da Precificação",
    text: 'Insegurança na hora de cobrar honorários condizentes com o mercado, acabando por "pagar para trabalhar".',
  },
  {
    icon: Flame,
    title: "O Caos do Dia a Dia",
    text: "A sensação de estar sempre apagando incêndios, sem um método claro para escalar.",
  },
];

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-cream relative overflow-hidden">
      {/* Circle Pattern Background - Marsala */}
      <div 
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url(${patternCirclesMarsala})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      {/* Isotipo Marsala - decorative */}
      <div className="absolute top-20 right-12 opacity-[0.15] hidden lg:block animate-float-slow">
        <img src={isotipoMarsala} alt="" className="w-28 h-28" />
      </div>
      <div className="absolute bottom-20 left-12 opacity-[0.15] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoMarsala} alt="" className="w-24 h-24" />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-white/30" />

      <div className="container-soberana relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Isotipo S decoration */}
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <img src={isotipoSMarsala} alt="" className="w-10 h-10 isotipo-glow-marsala" />
            </motion.div>
            
            <span className="badge-gold mb-4">A Realidade</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              Você é uma excelente advogada, mas o seu{" "}
              <span className="text-primary">faturamento ainda não reflete a sua dedicação?</span>
            </h2>
          </motion.div>

          {/* Intro */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground text-center mb-10"
          >
            Muitas advogadas talentosas no Direito enfrentam o mesmo "teto de vidro" que as impede de crescer:
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
                <p className="text-lg text-foreground">
                  <strong className="text-primary">{problem.title}:</strong>{" "}
                  <span className="font-medium">{problem.text}</span>
                </p>
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
                href="#jornada"
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
