import { motion } from "framer-motion";
import { Video, FileText, Bell, CheckCircle2 } from "lucide-react";

const benefits = [
  {
    icon: Video,
    title: "Acesso às Gravações",
    description: "As lives sairão do ar e ficarão disponíveis apenas para quem se cadastrar.",
  },
  {
    icon: FileText,
    title: "Materiais Complementares",
    description: "Checklists e modelos práticos de cada aula enviados direto no seu email.",
  },
  {
    icon: Bell,
    title: "Alertas de Agenda",
    description: "Não perca nenhum encontro em meio à correria dos prazos.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
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

export const JornadaBenefitsSection = () => {
  return (
    <section className="relative py-16 md:py-24 bg-primary overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url('/assets/brand/pattern-white.png')`,
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
          <h2 className="font-serif text-3xl md:text-5xl text-cream mb-4">
            Por que <span className="text-secondary">se cadastrar?</span>
          </h2>
          <p className="text-cream/80 max-w-2xl mx-auto">
            As lives serão transmitidas abertamente, mas apenas as inscritas terão benefícios exclusivos:
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <div className="relative p-6 md:p-8 rounded-xl bg-cream/5 backdrop-blur-sm border border-cream/10 hover:border-secondary/30 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                    <IconComponent className="w-7 h-7 text-secondary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-serif text-xl text-cream mb-2 group-hover:text-secondary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Checkmark */}
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-secondary/50" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
