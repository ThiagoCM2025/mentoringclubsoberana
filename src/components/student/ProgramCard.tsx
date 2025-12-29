import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Lock } from "lucide-react";
import { Program } from "@/data/programs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProgramCardProps {
  program: Program;
  index?: number;
  isEnrolled?: boolean;
  courseId?: string;
}

const tierLabels: Record<string, string> = {
  entry: "Entrada",
  mid: "Premium",
  elite: "Elite"
};

const tierColors: Record<string, string> = {
  entry: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  mid: "bg-secondary/20 text-secondary border-secondary/30",
  elite: "bg-purple-500/20 text-purple-400 border-purple-500/30"
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const ProgramCard = ({ program, index = 0, isEnrolled = false, courseId }: ProgramCardProps) => {
  const navigate = useNavigate();
  const IconComponent = program.icon;

  const handleClick = () => {
    if (isEnrolled && courseId) {
      // Navigate to program page for structured programs
      navigate(`/student/program/${courseId}`);
    } else {
      // Navigate to external products section if not enrolled
      window.location.href = "/#produtos";
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer relative"
      onClick={handleClick}
    >
      {/* Shimmer Border Effect */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-secondary/50 to-transparent bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card Content */}
      <div className="relative bg-zinc-900/80 rounded-xl overflow-hidden border border-secondary/10 group-hover:border-secondary/30 transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {program.image && (
            <img 
              src={program.image} 
              alt={program.title}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isEnrolled ? 'grayscale-[30%] opacity-80' : ''}`}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          
          {/* Locked Overlay for non-enrolled */}
          {!isEnrolled && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800/90 border border-secondary/30 flex items-center justify-center">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          )}
          
          {/* Premium Glow Effect - only for enrolled */}
          {isEnrolled && (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          )}
          
          {/* Floating Particles - only for enrolled */}
          {isEnrolled && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-secondary/60"
                  initial={{ 
                    x: `${20 + Math.random() * 60}%`, 
                    y: "100%", 
                    opacity: 0 
                  }}
                  animate={{ 
                    y: "0%", 
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 1.5,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Tier Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${tierColors[program.tier]}`}>
            {tierLabels[program.tier]}
          </div>
          
          {/* Enrolled Badge */}
          {isEnrolled && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Matriculada
            </div>
          )}
          
          {/* Featured Badge - only if not enrolled and featured */}
          {!isEnrolled && program.featured && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-secondary/90 text-black text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Destaque
            </div>
          )}
          
          {/* Icon */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-secondary/20 group-hover:border-secondary/40 transition-colors">
            <IconComponent className="w-6 h-6 text-secondary" />
          </div>
        </div>
        
        {/* Info Section - Fixed Height */}
        <div className="p-5 h-[180px] flex flex-col">
          {/* Impact Phrase */}
          <p className="text-secondary text-xs font-medium tracking-wide uppercase h-4 mb-2">
            {program.impactPhrase || '\u00A0'}
          </p>
          
          {/* Title */}
          <h3 className="font-serif text-lg text-cream group-hover:text-secondary transition-colors line-clamp-2 min-h-[56px] mb-2">
            {program.subtitle}
          </h3>
          
          {/* Description */}
          <p className="text-cream/50 text-sm line-clamp-2 leading-relaxed flex-grow">
            {program.description}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-secondary/10 mt-auto">
            {isEnrolled ? (
              <>
                <span className="text-emerald-400 font-medium text-sm">Acesso Liberado</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-secondary hover:text-secondary hover:bg-secondary/10 group-hover:translate-x-1 transition-all"
                >
                  Acessar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                {program.price ? (
                  <span className="text-secondary font-bold">{program.price}</span>
                ) : (
                  <span className="text-cream/40 text-sm">Consultar</span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-cream/70 hover:text-secondary hover:bg-secondary/10 group-hover:translate-x-1 transition-all"
                >
                  Adquirir
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-4 rounded-2xl bg-secondary/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </motion.div>
  );
};

export default ProgramCard;
