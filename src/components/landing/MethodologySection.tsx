import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Users, ListChecks, Flame, Rocket, Package, TrendingUp, Cog } from "lucide-react";
import patternCirclesWhite from "@/assets/brand/pattern-circles-white.png";
import isotipoWhite from "@/assets/brand/isotipo-white.png";
import isotipoSWhite from "@/assets/brand/isotipo-s-white.png";

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
  {
    letter: "A",
    title: "Ação e Estrutura",
    subtitle: "Execução",
    description: "Implemente processos e rotinas que garantem consistência",
    icon: Cog,
  },
];

export const MethodologySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metodologia" ref={ref} className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Circle Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url(${patternCirclesWhite})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      {/* Isotipo White - decorative corners */}
      <div className="absolute top-16 left-12 opacity-[0.15] hidden lg:block animate-float-slow">
        <img src={isotipoWhite} alt="" className="w-28 h-28" />
      </div>
      <div className="absolute bottom-16 right-12 opacity-[0.15] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoWhite} alt="" className="w-24 h-24" />
      </div>

      {/* Golden glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-secondary/15 blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-secondary/15 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl" />

      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.2)_100%)]" />

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

      <div className="container-soberana relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Isotipo S decoration */}
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <img src={isotipoSWhite} alt="" className="w-10 h-10 isotipo-glow-white" />
          </motion.div>

          <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
            <span className="text-sm font-medium tracking-wide">A Metodologia</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
            Os 8 Pilares da{" "}
            <span className="text-secondary">Advogada Soberana</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Um framework completo e testado para transformar sua advocacia em um negócio próspero.
          </p>
        </motion.div>

        {/* SOBERANA Letters Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center gap-1 md:gap-2 mb-12"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
              className="relative group"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-secondary via-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-xl md:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_25px_rgba(166,144,97,0.5)]">
                {pillar.letter}
              </div>
              {index < pillars.length - 1 && (
                <div className="absolute top-1/2 -right-1 md:-right-1.5 w-1 md:w-2 h-px bg-secondary/50" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Pillar Cards - First Row (4 cards) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {pillars.slice(0, 4).map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-xl bg-primary-foreground/5 border border-secondary/20 hover:border-secondary/50 hover:bg-primary-foreground/10 transition-all duration-500 h-full overflow-hidden group-hover:shadow-[0_0_30px_rgba(166,144,97,0.2)]">
                {/* Card glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                {/* Letter badge */}
                <motion.div 
                  className="absolute -top-3 -left-1 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  {pillar.letter}
                </motion.div>
                
                <div className="pt-5 relative z-10">
                  <pillar.icon className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-serif font-semibold mb-1 text-primary-foreground">{pillar.title}</h3>
                  <p className="text-sm text-secondary font-medium mb-2">{pillar.subtitle}</p>
                  <p className="text-sm text-primary-foreground/70">{pillar.description}</p>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-secondary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pillar Cards - Second Row (4 cards) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.slice(4).map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-xl bg-primary-foreground/5 border border-secondary/20 hover:border-secondary/50 hover:bg-primary-foreground/10 transition-all duration-500 h-full overflow-hidden group-hover:shadow-[0_0_30px_rgba(166,144,97,0.2)]">
                {/* Card glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                {/* Letter badge */}
                <motion.div 
                  className="absolute -top-3 -left-1 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-serif font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  {pillar.letter}
                </motion.div>
                
                <div className="pt-5 relative z-10">
                  <pillar.icon className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-serif font-semibold mb-1 text-primary-foreground">{pillar.title}</h3>
                  <p className="text-sm text-secondary font-medium mb-2">{pillar.subtitle}</p>
                  <p className="text-sm text-primary-foreground/70">{pillar.description}</p>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-secondary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-block relative">
            <p className="text-2xl md:text-3xl font-serif">
              <span className="text-shimmer-gold font-bold">S.O.B.E.R.A.N.A.</span>
            </p>
            <p className="text-primary-foreground/70 mt-2">O caminho para a sua transformação</p>
            
            {/* Decorative lines */}
            <div className="absolute -left-8 top-1/2 w-6 h-px bg-gradient-to-r from-transparent to-secondary/50" />
            <div className="absolute -right-8 top-1/2 w-6 h-px bg-gradient-to-l from-transparent to-secondary/50" />
          </div>

          <motion.a
            href="#jornada"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="cta-premium inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-10 py-5 rounded-lg text-lg font-semibold uppercase tracking-wider transition-all duration-300 mt-8"
          >
            Conhecer os Programas
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </section>
  );
};