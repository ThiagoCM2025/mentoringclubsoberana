import { motion } from "framer-motion";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Program } from "@/data/programs";
import { Button } from "@/components/ui/button";

interface ProgramCardProps {
  program: Program;
  index?: number;
}

const tierLabels = {
  entry: "Entrada",
  mid: "Premium",
  elite: "Elite"
};

const tierColors = {
  entry: "bg-secondary/80 text-black",
  mid: "bg-gradient-to-r from-secondary to-secondary-light text-black",
  elite: "bg-gradient-to-r from-primary to-primary-light text-cream"
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

export const ProgramCard = ({ program, index = 0 }: ProgramCardProps) => {
  const navigate = useNavigate();
  const IconComponent = program.icon;
  
  const handleClick = () => {
    // If it's an external link, open in new tab
    if (program.ctaLink.startsWith('http')) {
      window.open(program.ctaLink, '_blank');
    } else {
      navigate(`/programa/${program.slug}`);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-secondary/20 hover:border-secondary/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_40px_rgba(166,144,97,0.2)]">
        {/* Background Image */}
        {program.image && (
          <img 
            src={program.image} 
            alt={program.subtitle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        {/* Tier Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${tierColors[program.tier]}`}>
          {tierLabels[program.tier]}
        </div>
        
        {/* Featured Badge */}
        {program.featured && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-primary/90 rounded-full text-xs font-semibold text-cream flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
            Destaque
          </div>
        )}
        
        {/* Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center border border-secondary/40">
            <IconComponent className="w-8 h-8 text-secondary" />
          </div>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Impact Phrase */}
          <p className="text-secondary text-xs font-medium mb-1 tracking-wide uppercase">
            {program.impactPhrase}
          </p>
          
          {/* Title */}
          <h3 className="font-serif text-lg text-cream font-bold mb-2 leading-tight">
            {program.subtitle}
          </h3>
          
          {/* Description */}
          <p className="text-cream/60 text-sm line-clamp-2 mb-3">
            {program.description}
          </p>
          
          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            {program.price ? (
              <span className="text-secondary font-bold text-lg">
                {program.price}
              </span>
            ) : (
              <span className="text-cream/50 text-sm">Consultar valores</span>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-secondary hover:text-secondary hover:bg-secondary/10 gap-1 p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Conhecer
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/10 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
};

export default ProgramCard;
