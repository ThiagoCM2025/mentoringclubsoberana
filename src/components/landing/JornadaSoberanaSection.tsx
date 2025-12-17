import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { programsList, Program } from "@/data/programs";
import mentorFabiana from "@/assets/mentor-fabiana.jpeg";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import isotipoSGold from "@/assets/brand/isotipo-s-gold.png";

interface ProgramCardProps {
  program: Program;
  index: number;
  isReversed?: boolean;
}

const ProgramCard = ({ program, index, isReversed }: ProgramCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
        isReversed ? "md:grid-flow-dense" : ""
      }`}
    >
      {/* Image with Golden Frame */}
      <div className={`relative ${isReversed ? "md:col-start-2" : ""}`}>
        <div className="golden-frame">
          {/* Decorative corners */}
          <div className="golden-corner golden-corner-tl" />
          <div className="golden-corner golden-corner-tr" />
          <div className="golden-corner golden-corner-bl" />
          <div className="golden-corner golden-corner-br" />
          
          <div className="golden-frame-inner aspect-[4/5]">
            <img
              src={program.image || mentorFabiana}
              alt={program.title}
              className="w-full h-full object-cover object-top"
            />
            {/* Elegant vignette overlay */}
            <div className="golden-vignette" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
          </div>
        </div>
        
        {/* Floating golden particles */}
        <div className="golden-particle golden-particle-1" />
        <div className="golden-particle golden-particle-2" />
        <div className="golden-particle golden-particle-3" />
      </div>

      {/* Content */}
      <div className={`${isReversed ? "md:col-start-1 md:text-right" : ""}`}>
        <span className="inline-block text-secondary text-xs tracking-[0.25em] uppercase mb-4 font-medium">
          {program.subtitle}
        </span>
        
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground mb-3 leading-tight">
          {program.titleHighlight ? (
            <>
              {program.title.split(program.titleHighlight)[0]}
              <em className="italic text-secondary">{program.titleHighlight}</em>
              {program.title.split(program.titleHighlight)[1]}
            </>
          ) : (
            program.title
          )}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed text-base">
          {program.description}
        </p>

        {program.price && (
          <p className="text-secondary font-semibold mb-4 text-lg">{program.price}</p>
        )}

        <Button
          asChild
          className={`cta-premium bg-foreground hover:bg-foreground/90 text-background px-8 py-5 text-sm font-medium tracking-wide transition-all duration-300 ${
            isReversed ? "md:ml-auto" : ""
          }`}
        >
          <Link to={`/programa/${program.slug}`}>
            {program.ctaText}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export const JornadaSoberanaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Order programs for display: entry first, then mid, then elite
  const orderedPrograms = [
    ...programsList.filter((p) => p.tier === "entry"),
    ...programsList.filter((p) => p.tier === "mid"),
    ...programsList.filter((p) => p.tier === "elite"),
  ];

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Circle Pattern decoration - corners */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.10]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'top right',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.10]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
        }}
      />

      {/* Isotipo Gold - decorative */}
      <div className="absolute top-1/4 left-8 opacity-[0.15] hidden lg:block animate-float-slow">
        <img src={isotipoGold} alt="" className="w-24 h-24" />
      </div>
      <div className="absolute bottom-1/4 right-8 opacity-[0.15] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoGold} alt="" className="w-28 h-28" />
      </div>

      {/* Subtle decorative lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

      <div className="container-soberana relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          {/* Isotipo S decoration */}
          <div className="flex justify-center mb-4">
            <img src={isotipoSGold} alt="" className="w-10 h-10 opacity-80" />
          </div>
          
          <span className="inline-block text-muted-foreground text-xs tracking-[0.25em] uppercase mb-6">
            A Jornada Soberana
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-foreground mb-6">
            Escolha Seu <em className="italic">Momento</em>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            O Ecossistema Soberana: Do Digital ao Presencial. 
            Cada programa foi desenhado para uma fase específica da sua jornada.
          </p>
        </motion.div>

        {/* Programs List */}
        <div className="space-y-20 md:space-y-32">
          {orderedPrograms.map((program, index) => (
            <ProgramCard
              key={program.slug}
              program={program}
              index={index}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-24 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Não sabe qual programa escolher?
          </p>
          <Button
            asChild
            variant="outline"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background px-8 py-5"
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
        </motion.div>
      </div>
    </section>
  );
};
