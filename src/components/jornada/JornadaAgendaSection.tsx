import { motion } from "framer-motion";
import { Calendar, Settings, Users, Brain, DollarSign, Target } from "lucide-react";

const agendaItems = [
  {
    day: 12,
    weekday: "Segunda",
    title: "Rotina e Processos",
    description: "Como organizar sua rotina e processos para escalar no Direito Imobiliário sem surtar.",
    icon: Settings,
    color: "from-blue-500 to-blue-600",
  },
  {
    day: 15,
    weekday: "Quinta",
    title: "Captação Estratégica",
    description: "Passo a passo para fechar contratos com clientes qualificados (sem depender de indicações).",
    icon: Users,
    color: "from-green-500 to-green-600",
  },
  {
    day: 19,
    weekday: "Segunda",
    title: "Inteligência Artificial",
    description: "Como usar a IA para ganhar tempo real no seu escritório jurídico.",
    icon: Brain,
    color: "from-purple-500 to-purple-600",
  },
  {
    day: 22,
    weekday: "Quinta",
    title: "Precificação de Elite",
    description: "O passo a passo para criar uma tabela de precificação eficiente e lucrativa.",
    icon: DollarSign,
    color: "from-secondary to-gold-light",
  },
  {
    day: 26,
    weekday: "Segunda",
    title: "Conversão de Vendas",
    description: "Como transformar meras consultas em contratos de alto valor.",
    icon: Target,
    color: "from-red-500 to-red-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 200 },
  },
};

export const JornadaAgendaSection = () => {
  return (
    <section className="relative py-16 md:py-24 bg-cream overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url('/assets/brand/pattern-circles-gold.png')`,
          backgroundSize: '200px',
        }}
      />
      
      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">JANEIRO 2026</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
            A Agenda da <span className="text-primary">Jornada</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-3">
            5 encontros estratégicos para transformar sua advocacia imobiliária
          </p>
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full">
            <span className="text-sm font-semibold">🕗 Todas às 20h00</span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 md:gap-6 max-w-4xl mx-auto"
        >
          {agendaItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative flex items-stretch gap-4 md:gap-6 p-4 md:p-6 rounded-xl bg-white border border-border/50 shadow-sm hover:shadow-lg hover:border-secondary/30 transition-all duration-300">
                  {/* Day badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 md:w-20">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${item.color} flex flex-col items-center justify-center text-white shadow-lg`}>
                      <span className="text-xl md:text-2xl font-bold leading-none">{item.day}</span>
                      <span className="text-[10px] md:text-xs uppercase opacity-90">JAN</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                      {item.weekday}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className={`hidden md:flex w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} items-center justify-center text-white opacity-80`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hover accent */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-secondary to-gold-light rounded-r-full group-hover:h-1/2 transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
