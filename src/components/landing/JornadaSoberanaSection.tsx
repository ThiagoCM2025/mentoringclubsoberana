import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { programsList } from "@/data/programs";

interface ProgramCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  impactPhrase: string;
  description: string;
  deliverable: string;
  cta: string;
  ctaLink: string;
  internalLink?: string;
  featured?: boolean;
  delay?: number;
}

const ProgramCard = ({
  icon: Icon,
  title,
  subtitle,
  impactPhrase,
  description,
  deliverable,
  cta,
  ctaLink,
  internalLink,
  featured = false,
  delay = 0,
}: ProgramCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={`relative group rounded-2xl p-6 md:p-8 transition-all duration-300 h-full flex flex-col ${
        featured
          ? "bg-gradient-to-br from-primary via-primary to-foreground text-white border-2 border-secondary shadow-xl"
          : "bg-card border border-border hover:border-secondary/50 hover:shadow-lg"
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1 rounded-full">
          MAIS POPULAR
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          featured ? "bg-white/10" : "bg-primary/10"
        }`}
      >
        <Icon className={`w-7 h-7 ${featured ? "text-secondary" : "text-primary"}`} />
      </div>

      {/* Subtitle */}
      <span className={`text-sm font-medium mb-1 ${featured ? "text-secondary" : "text-secondary"}`}>
        {subtitle}
      </span>

      {/* Title */}
      <h3 className={`text-xl md:text-2xl font-serif font-bold mb-2 ${featured ? "text-white" : "text-foreground"}`}>
        {title}
      </h3>

      {/* Impact Phrase */}
      <p className={`text-sm font-medium mb-4 ${featured ? "text-white/80" : "text-muted-foreground"}`}>
        "{impactPhrase}"
      </p>

      {/* Description */}
      <p className={`text-sm mb-4 flex-grow ${featured ? "text-white/70" : "text-muted-foreground"}`}>
        {description}
      </p>

      {/* Deliverable */}
      <div className={`text-sm font-medium mb-6 p-3 rounded-lg ${featured ? "bg-white/10" : "bg-muted"}`}>
        <span className={featured ? "text-secondary" : "text-secondary"}>✦</span>{" "}
        <span className={featured ? "text-white" : "text-foreground"}>{deliverable}</span>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2">
        {internalLink ? (
          <Button
            className={`w-full ${
              featured
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            asChild
          >
            <Link to={internalLink}>
              {cta}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <Button
            className={`w-full ${
              featured
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            asChild
          >
            <a href={ctaLink} target="_blank" rel="noopener noreferrer">
              {cta}
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
        {internalLink && (
          <Button
            variant="ghost"
            size="sm"
            className={featured ? "text-white/70 hover:text-white" : "text-muted-foreground"}
            asChild
          >
            <Link to={internalLink}>
              Ver detalhes completos →
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export const JornadaSoberanaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const entryPrograms = programsList.filter((p) => p.tier === "entry");
  const midPrograms = programsList.filter((p) => p.tier === "mid");
  const presencialPrograms = programsList.filter((p) => p.tier === "presencial");

  return (
    <section ref={ref} id="programas" className="section-padding bg-muted/30 overflow-hidden">
      <div className="container-soberana">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-4">A Jornada</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            O Ecossistema Soberana:{" "}
            <span className="text-primary">Do Digital ao Presencial</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Escolha o programa ideal para o seu momento. Da entrada à elite, 
            cada passo te leva mais perto da liberdade que você merece.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Entry Programs */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-lg font-semibold text-muted-foreground mb-6 flex items-center gap-2"
            >
              <span className="w-8 h-px bg-secondary" />
              ENTRADA
            </motion.h3>
            <div className="grid md:grid-cols-2 gap-6">
              {entryPrograms.map((program, index) => (
                <ProgramCard
                  key={program.slug}
                  icon={program.icon}
                  title={program.title}
                  subtitle={program.subtitle}
                  impactPhrase={program.impactPhrase}
                  description={program.description}
                  deliverable={program.deliverables[0]}
                  cta={program.ctaText}
                  ctaLink={program.ctaLink}
                  internalLink={`/programa/${program.slug}`}
                  delay={0.1 + index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Mid Programs (Mentorias) */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg font-semibold text-muted-foreground mb-6 flex items-center gap-2"
            >
              <span className="w-8 h-px bg-secondary" />
              MENTORIAS
            </motion.h3>
            <div className="grid md:grid-cols-2 gap-6">
              {midPrograms.map((program, index) => (
                <ProgramCard
                  key={program.slug}
                  icon={program.icon}
                  title={program.title}
                  subtitle={program.subtitle}
                  impactPhrase={program.impactPhrase}
                  description={program.description}
                  deliverable={program.deliverables[0]}
                  cta={program.ctaText}
                  ctaLink={program.ctaLink}
                  internalLink={`/programa/${program.slug}`}
                  featured={program.featured}
                  delay={0.3 + index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Presencial Programs */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg font-semibold text-muted-foreground mb-6 flex items-center gap-2"
            >
              <span className="w-8 h-px bg-secondary" />
              EXPERIÊNCIAS PRESENCIAIS
            </motion.h3>
            <div className="grid md:grid-cols-2 gap-6">
              {presencialPrograms.map((program, index) => (
                <ProgramCard
                  key={program.slug}
                  icon={program.icon}
                  title={program.title}
                  subtitle={program.subtitle}
                  impactPhrase={program.impactPhrase}
                  description={program.description}
                  deliverable={program.deliverables[0]}
                  cta={program.ctaText}
                  ctaLink={program.ctaLink}
                  internalLink={`/programa/${program.slug}`}
                  delay={0.5 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Não sabe qual programa é ideal para você?
          </p>
          <a
            href="https://wa.me/5511993563468?text=Olá! Preciso de ajuda para escolher o programa ideal para mim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-secondary/80 font-semibold underline underline-offset-4 transition-colors"
          >
            Fale com nossa equipe e receba uma orientação personalizada →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
