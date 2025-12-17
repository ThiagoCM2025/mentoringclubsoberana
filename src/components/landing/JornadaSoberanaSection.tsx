import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { programsList, Program } from "@/data/programs";

interface ProgramCardProps {
  program: Program;
  index: number;
  isElite?: boolean;
}

const ProgramCard = ({ program, index, isElite }: ProgramCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = program.icon;

  if (isElite) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative group"
      >
        {/* Elite Card - Special Design */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-secondary/50 bg-gradient-to-br from-primary/95 via-primary to-primary/90 p-8 md:p-10 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />
          
          {/* Crown icon */}
          <div className="absolute top-6 right-6">
            <Crown className="w-8 h-8 text-secondary/30" />
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
              <Icon className="w-8 h-8 text-secondary" />
            </div>

            <span className="inline-block text-secondary text-xs tracking-[0.2em] uppercase mb-3">
              {program.subtitle}
            </span>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
              {program.title}
            </h3>
            
            <p className="text-secondary font-medium text-lg mb-4 italic">
              "{program.impactPhrase}"
            </p>
            
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              {program.description}
            </p>

            <ul className="text-left space-y-2 mb-8 max-w-md mx-auto">
              {program.deliverables.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-primary-foreground/80 text-sm">
                  <span className="text-secondary mt-1">✦</span>
                  {item}
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-base font-semibold group/btn shadow-lg"
            >
              <Link to={`/programa/${program.slug}`}>
                {program.ctaText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:border-secondary/40 hover:shadow-xl hover:-translate-y-1">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-secondary/0 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
              <Icon className="w-6 h-6 text-secondary" />
            </div>
            {program.price && (
              <span className="text-secondary font-semibold text-sm">{program.price}</span>
            )}
          </div>

          <span className="text-muted-foreground text-xs tracking-[0.15em] uppercase mb-2 block">
            {program.subtitle}
          </span>
          
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">
            {program.title}
          </h3>
          
          <p className="text-secondary/90 text-sm mb-3 italic">
            "{program.impactPhrase}"
          </p>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {program.description}
          </p>

          <Button
            asChild
            variant="outline"
            className="w-full border-secondary/30 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 group/btn"
          >
            <Link to={`/programa/${program.slug}`}>
              <span>Saiba Mais</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const JornadaSoberanaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const entryPrograms = programsList.filter((p) => p.tier === "entry");
  const midPrograms = programsList.filter((p) => p.tier === "mid");
  const eliteProgram = programsList.find((p) => p.tier === "elite");

  return (
    <section id="programas" className="section-padding bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      <div className="container-soberana relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-secondary text-sm tracking-[0.2em] uppercase mb-4">
            A Jornada Soberana
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Escolha Seu Momento
          </h2>
          <div className="w-16 h-px bg-secondary mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            O Ecossistema Soberana: Do Digital ao Presencial. 
            Cada programa foi desenhado para uma fase específica da sua jornada.
          </p>
        </motion.div>

        {/* Pyramid Layout */}
        <div className="space-y-12">
          {/* TOP: Elite Program (Pyramid Top) */}
          {eliteProgram && (
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <span className="inline-flex items-center gap-2 text-secondary text-xs tracking-[0.2em] uppercase">
                  <span className="w-8 h-px bg-secondary/50" />
                  Topo da Pirâmide
                  <span className="w-8 h-px bg-secondary/50" />
                </span>
              </motion.div>
              <ProgramCard program={eliteProgram} index={0} isElite />
            </div>
          )}

          {/* MIDDLE: Mentorias */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-xs tracking-[0.2em] uppercase">
                <span className="w-8 h-px bg-border" />
                Mentorias
                <span className="w-8 h-px bg-border" />
              </span>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {midPrograms.map((program, index) => (
                <ProgramCard key={program.slug} program={program} index={index} />
              ))}
            </div>
          </div>

          {/* BOTTOM: Entrada */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="text-center mb-6"
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-xs tracking-[0.2em] uppercase">
                <span className="w-8 h-px bg-border" />
                Entrada
                <span className="w-8 h-px bg-border" />
              </span>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {entryPrograms.map((program, index) => (
                <ProgramCard key={program.slug} program={program} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <p className="text-muted-foreground mb-4">
              Não sabe qual programa escolher?
            </p>
            <Button
              asChild
              variant="outline"
              className="border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <a
                href="https://wa.me/5511993563468?text=Olá! Quero ajuda para escolher o programa ideal para mim"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fale com nossa equipe
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
