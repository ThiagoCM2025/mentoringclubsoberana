import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check, ArrowRight, Sparkles } from "lucide-react";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";

const beforeItems = [
  "Apagando incêndios diariamente",
  "Medo de cobrar o valor real",
  "Dependente do boca a boca",
  "Trabalha para todo tipo de cliente",
  "Operacional 24h, sem folga",
  "Receita imprevisível",
];

const afterItems = [
  "CEO estratégica do escritório",
  "Precificação confiante e lucrativa",
  "Sistema de captação previsível",
  "Nicho definido e posicionamento claro",
  "Vida equilibrada com liberdade",
  "Faturamento consistente e crescente",
];

const timeline = [
  { period: "Hoje", label: "Diagnóstico e Mindset", icon: "🎯" },
  { period: "3 meses", label: "Estrutura e Processos", icon: "🔧" },
  { period: "6 meses", label: "Escala e Automação", icon: "📈" },
  { period: "1 ano", label: "Liberdade como CEO", icon: "👑" },
];

export const BeforeAfterSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-cream relative overflow-hidden">
      {/* Circle Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-white/50" />

      <div className="container-soberana relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Isotipo decoration */}
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <img src={isotipoSGold} alt="" className="w-10 h-10 isotipo-glow" />
          </motion.div>
          
          <span className="badge-gold mb-4">A Transformação</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            De <span className="text-primary">Operadora</span> a{" "}
            <span className="text-secondary">Soberana</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja a jornada de transformação que mais de 500 advogadas já viveram.
          </p>
        </motion.div>

        {/* Before vs After Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -80, scale: 0.9 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="bg-foreground/5 border border-primary/20 rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Advogada Operadora</h3>
                  <p className="text-sm text-muted-foreground">O ciclo que precisa ser quebrado</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                {beforeItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.12 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="relative"
          >
            <motion.div 
              className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30 rounded-2xl p-8 h-full shadow-lg"
              animate={isInView ? { 
                boxShadow: [
                  "0 10px 15px -3px rgba(166, 144, 97, 0.1)",
                  "0 20px 40px -3px rgba(166, 144, 97, 0.25)",
                  "0 10px 15px -3px rgba(166, 144, 97, 0.1)"
                ]
              } : {}}
              transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Advogada Soberana</h3>
                  <p className="text-sm text-secondary font-medium">Seu novo momento</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.55 + index * 0.12 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            {/* Decorative glow */}
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl blur-xl -z-10"
              animate={isInView ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 3, delay: 1, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Arrow Connector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mb-16"
        >
          <div className="flex items-center gap-4 px-8 py-4 bg-background rounded-full border border-secondary/30 shadow-lg">
            <span className="text-muted-foreground font-medium">Metodologia</span>
            <ArrowRight className="w-5 h-5 text-secondary" />
            <span className="text-secondary font-bold">S.O.B.E.R.A.N.A.</span>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-center text-lg font-serif font-semibold text-foreground mb-8">
            Sua Timeline de Transformação
          </h3>
          
          <div className="relative">
            {/* Timeline line with drawing animation */}
            <motion.div 
              className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-secondary/50 rounded-full transform -translate-y-1/2 hidden md:block origin-left"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.2, ease: "easeOut" }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Node */}
                  <motion.div 
                    className="w-14 h-14 rounded-full bg-background border-4 border-secondary shadow-lg flex items-center justify-center text-2xl z-10 mb-3"
                    animate={isInView ? { 
                      boxShadow: [
                        "0 4px 6px -1px rgba(166, 144, 97, 0.2)",
                        "0 10px 20px -1px rgba(166, 144, 97, 0.35)",
                        "0 4px 6px -1px rgba(166, 144, 97, 0.2)"
                      ]
                    } : {}}
                    transition={{ duration: 2, delay: 1.5 + index * 0.3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    {item.icon}
                  </motion.div>
                  
                  <span className="text-sm font-bold text-secondary">{item.period}</span>
                  <span className="text-xs text-muted-foreground mt-1">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 text-center"
        >
          <a
            href="#jornada"
            className="cta-premium inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-10 py-5 rounded-lg text-lg font-semibold uppercase tracking-wider transition-all duration-300"
          >
            Começar Minha Transformação
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
