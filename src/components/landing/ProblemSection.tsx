import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertCircle, Clock, DollarSign, Brain, TrendingDown, Users } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Escrava do Tempo",
    description: "Trabalha mais de 12 horas por dia e ainda não consegue dar conta de tudo"
  },
  {
    icon: DollarSign,
    title: "Honorários Estagnados",
    description: "Cobra pouco pelo seu trabalho e não sabe como aumentar seus ganhos"
  },
  {
    icon: Brain,
    title: "Sobrecarga Mental",
    description: "Acumula todas as funções e não consegue delegar"
  },
  {
    icon: TrendingDown,
    title: "Sem Previsibilidade",
    description: "Não sabe quanto vai faturar no próximo mês"
  },
  {
    icon: Users,
    title: "Clientes Problemáticos",
    description: "Atende qualquer um que aparece, mesmo quem não valoriza seu trabalho"
  },
  {
    icon: AlertCircle,
    title: "Sem Estratégia",
    description: "Não tem clareza de onde quer chegar e como construir seu legado"
  }
];

export const ProblemSection = () => {
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
          <span className="badge-gold mb-4">O Problema</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Você Se Identifica Com{" "}
            <span className="text-primary">Alguma Dessas Situações?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A maioria das advogadas vive presa nesse ciclo. Mas existe uma saída.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card-elegant p-6 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <problem.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-xl md:text-2xl font-serif text-foreground">
            Se você disse <span className="text-primary font-semibold">"sim"</span> para alguma dessas situações,{" "}
            <span className="text-secondary font-semibold">você está no lugar certo.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};