import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Users, ListChecks, Flame, Rocket, Package, TrendingUp } from "lucide-react";

const pillars = [
  {
    letter: "S",
    title: "Soberania Mental",
    subtitle: "Mindset",
    description: "Desenvolva a mentalidade de CEO e pare de se sabotar",
    icon: Brain,
  },
  {
    letter: "O",
    title: "O Público Certo",
    subtitle: "Audiência",
    description: "Defina seu cliente ideal e pare de atender qualquer um",
    icon: Users,
  },
  {
    letter: "B",
    title: "Base de Contatos",
    subtitle: "Lista",
    description: "Construa uma lista qualificada de potenciais clientes",
    icon: ListChecks,
  },
  {
    letter: "E",
    title: "Engajamento",
    subtitle: "Aquecimento",
    description: "Crie relacionamento e confiança antes de vender",
    icon: Flame,
  },
  {
    letter: "R",
    title: "Resultados",
    subtitle: "Lançamento",
    description: "Execute campanhas que convertem e geram resultados",
    icon: Rocket,
  },
  {
    letter: "A",
    title: "Alta Entrega",
    subtitle: "Produto",
    description: "Crie ofertas irresistíveis que resolvem problemas reais",
    icon: Package,
  },
  {
    letter: "N",
    title: "Negócio Escalável",
    subtitle: "Escala",
    description: "Construa sistemas que funcionam sem você",
    icon: TrendingUp,
  },
];

export const MethodologySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-primary text-primary-foreground overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="container-soberana relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
            <span className="text-sm font-medium">A Metodologia</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
            Os 7 Pilares da{" "}
            <span className="text-secondary">Advogada Soberana</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Um framework completo e testado para transformar sua advocacia em um negócio próspero.
          </p>
        </motion.div>

        {/* Pillar Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pillars.slice(0, 4).map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-6 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all group"
            >
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl">
                {pillar.letter}
              </div>
              <div className="pt-4">
                <pillar.icon className="w-8 h-8 text-secondary mb-3" />
                <h3 className="text-xl font-serif font-semibold mb-1">{pillar.title}</h3>
                <p className="text-sm text-secondary mb-2">{pillar.subtitle}</p>
                <p className="text-sm text-primary-foreground/70">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {pillars.slice(4).map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="relative p-6 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all group"
            >
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl">
                {pillar.letter}
              </div>
              <div className="pt-4">
                <pillar.icon className="w-8 h-8 text-secondary mb-3" />
                <h3 className="text-xl font-serif font-semibold mb-1">{pillar.title}</h3>
                <p className="text-sm text-secondary mb-2">{pillar.subtitle}</p>
                <p className="text-sm text-primary-foreground/70">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-2xl font-serif">
            <span className="text-secondary font-bold">S.O.B.E.R.A.N.A.</span> — O caminho para a sua transformação
          </p>
        </motion.div>
      </div>
    </section>
  );
};