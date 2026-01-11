import { motion } from "framer-motion";
import { Calendar, Settings, Users, Brain, DollarSign, Target, Sparkles, Radio } from "lucide-react";

const agendaItems = [
  {
    day: 12,
    weekday: "Segunda",
    title: "Rotina e Processos",
    description: "Como organizar sua rotina e processos para escalar no Direito Imobiliário sem surtar.",
    icon: Settings,
  },
  {
    day: 15,
    weekday: "Quinta",
    title: "Captação Estratégica",
    description: "Passo a passo para fechar contratos com clientes qualificados (sem depender de indicações).",
    icon: Users,
  },
  {
    day: 19,
    weekday: "Segunda",
    title: "Inteligência Artificial",
    description: "Como usar a IA para ganhar tempo real no seu escritório jurídico.",
    icon: Brain,
  },
  {
    day: 22,
    weekday: "Quinta",
    title: "Precificação de Elite",
    description: "O passo a passo para criar uma tabela de precificação eficiente e lucrativa.",
    icon: DollarSign,
  },
  {
    day: 26,
    weekday: "Segunda",
    title: "Conversão de Vendas",
    description: "Como transformar meras consultas em contratos de alto valor.",
    icon: Target,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 25, stiffness: 200 },
  },
};

export const JornadaAgendaSection = () => {
  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-zinc-900 to-brand-black" />
      
      {/* Golden geometric pattern - smaller on mobile */}
      <div 
        className="absolute inset-0 opacity-[0.05] md:opacity-[0.08]"
        style={{
          backgroundImage: `url('/assets/brand/pattern-geometric-circles-gold.png')`,
          backgroundSize: '200px',
        }}
      />

      {/* Secondary pattern layer - hidden on mobile */}
      <div 
        className="absolute inset-0 opacity-[0.04] hidden md:block"
        style={{
          backgroundImage: `url('/assets/brand/pattern-circles-gold.png')`,
          backgroundSize: '150px',
        }}
      />

      {/* Central radial glow - smaller on mobile */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(166, 144, 97, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Vignette effect - lighter on mobile */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 80px 30px rgba(0, 0, 0, 0.4)',
        }}
      />
      
      <div className="container-soberana relative z-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <motion.div 
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-secondary/10 text-secondary border border-secondary/30 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full mb-4 sm:mb-5 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">JANEIRO 2026</span>
          </motion.div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-cream mb-3 md:mb-4 px-2">
            A Agenda da <span className="text-shimmer-gold">Jornada</span>
          </h2>
          
          <p className="text-cream/70 max-w-2xl mx-auto mb-4 text-sm sm:text-base px-4">
            5 encontros estratégicos para transformar sua advocacia imobiliária
          </p>
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-secondary/15 text-cream px-3 py-2 sm:px-5 sm:py-2.5 rounded-full border border-secondary/25 backdrop-blur-sm">
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">Todas às 20h • Ao vivo</span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 md:gap-5 max-w-4xl mx-auto"
        >
          {agendaItems.map((item, index) => {
            const IconComponent = item.icon;
            const isFirst = index === 0;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Card with glassmorphism */}
                <div className={`
                  relative flex items-stretch gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl 
                  backdrop-blur-xl bg-white/[0.03] 
                  border border-secondary/20 
                  shadow-[0_4px_30px_rgba(0,0,0,0.3)]
                  hover:bg-white/[0.06] hover:border-secondary/40
                  hover:shadow-[0_8px_40px_rgba(166,144,97,0.15)]
                  transition-all duration-500
                  ${isFirst ? 'ring-1 ring-secondary/30' : ''}
                `}>
                  
                  {/* Shimmer border effect on hover - hidden on mobile */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden hidden md:block">
                    <div className="absolute inset-0 rounded-2xl" style={{
                      background: 'linear-gradient(90deg, transparent, rgba(166, 144, 97, 0.1), transparent)',
                      animation: 'shimmer 2s infinite',
                    }} />
                  </div>

                  {/* Day badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 md:w-20">
                    <motion.div 
                      className={`
                        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl 
                        bg-gradient-to-br from-secondary via-secondary to-gold-light
                        flex flex-col items-center justify-center text-brand-black 
                        shadow-[0_4px_20px_rgba(166,144,97,0.4)]
                        ${isFirst ? 'animate-pulse' : ''}
                      `}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-lg sm:text-xl md:text-2xl font-bold leading-none">{item.day}</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs uppercase opacity-80 font-semibold">JAN</span>
                    </motion.div>
                    <span className="text-[9px] sm:text-[10px] text-cream/60 mt-1.5 sm:mt-2 uppercase tracking-wider font-medium">
                      {item.weekday}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex items-start gap-3 sm:gap-4 w-full">
                      {/* Icon - hidden on mobile */}
                      <div className="hidden md:flex w-11 h-11 rounded-xl bg-secondary/10 items-center justify-center text-secondary border border-secondary/20 group-hover:bg-secondary/20 group-hover:border-secondary/40 transition-all duration-300 flex-shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-cream mb-0.5 sm:mb-1 group-hover:text-secondary transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-cream/60 leading-relaxed group-hover:text-cream/70 transition-colors duration-300 line-clamp-2 sm:line-clamp-none">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* First item special indicator */}
                  {isFirst && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-0.5 sm:gap-1 bg-secondary text-brand-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold shadow-lg">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      PRÓXIMO
                    </div>
                  )}

                  {/* Hover glow accent - hidden on mobile */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-secondary to-gold-light rounded-r-full group-hover:h-2/3 transition-all duration-500 shadow-[0_0_15px_rgba(166,144,97,0.5)] hidden md:block" />
                </div>

                {/* Timeline connector */}
                {index < agendaItems.length - 1 && (
                  <div className="absolute left-[1.75rem] sm:left-[2rem] md:left-[2.75rem] top-full w-px h-3 sm:h-4 md:h-5 bg-gradient-to-b from-secondary/40 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center gap-3 text-cream/40 text-sm">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
            <span className="uppercase tracking-widest text-xs">Sua transformação começa aqui</span>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};
