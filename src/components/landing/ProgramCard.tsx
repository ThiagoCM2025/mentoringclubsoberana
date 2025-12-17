import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ProgramCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  impactPhrase: string;
  description: string;
  deliverable: string;
  cta: string;
  ctaLink: string;
  featured?: boolean;
  delay?: number;
}

export const ProgramCard = ({
  icon: Icon,
  title,
  subtitle,
  impactPhrase,
  description,
  deliverable,
  cta,
  ctaLink,
  featured = false,
  delay = 0,
}: ProgramCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`relative h-full rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        featured
          ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-2 border-secondary"
          : "bg-card border border-border hover:border-secondary/50"
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
          Mais Completo
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
          featured ? "bg-secondary/20" : "bg-primary/10"
        }`}
      >
        <Icon className={`w-7 h-7 ${featured ? "text-secondary" : "text-primary"}`} />
      </div>

      {/* Header */}
      <div className="mb-4">
        <p className={`text-sm font-medium mb-1 ${featured ? "text-secondary" : "text-secondary"}`}>
          {subtitle}
        </p>
        <h3 className={`text-xl lg:text-2xl font-serif font-bold ${featured ? "text-primary-foreground" : "text-foreground"}`}>
          {title}
        </h3>
      </div>

      {/* Impact Phrase */}
      <p className={`text-lg font-medium mb-4 ${featured ? "text-primary-foreground/90" : "text-foreground"}`}>
        "{impactPhrase}"
      </p>

      {/* Description */}
      <p className={`text-sm mb-6 leading-relaxed ${featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {description}
      </p>

      {/* Deliverable */}
      <div className={`rounded-lg p-4 mb-6 ${featured ? "bg-white/10" : "bg-muted"}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${featured ? "text-secondary" : "text-secondary"}`}>
          Entregável Exclusivo
        </p>
        <p className={`text-sm font-medium ${featured ? "text-primary-foreground" : "text-foreground"}`}>
          {deliverable}
        </p>
      </div>

      {/* CTA */}
      <Button
        asChild
        className={`w-full group ${
          featured
            ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        <a href={ctaLink} target="_blank" rel="noopener noreferrer">
          {cta}
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </Button>
    </motion.div>
  );
};
