import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, Lock, Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import agentHeroImage from "@/assets/agents/agent-hero.png";

interface AgentProgramCardProps {
  totalAgents: number;
  accessibleAgents: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function AgentProgramCard({ totalAgents, accessibleAgents }: AgentProgramCardProps) {
  const navigate = useNavigate();
  const hasAccess = accessibleAgents > 0;

  const handleClick = () => {
    navigate("/student/agents");
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative cursor-pointer group"
    >
      {/* Shimmer border effect */}
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/50 to-transparent animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 rounded-2xl overflow-hidden border border-secondary/30 group-hover:border-secondary/50 transition-all duration-300">
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
          <Badge className="bg-secondary/90 text-zinc-900 border-0 shadow-lg backdrop-blur-sm text-xs font-medium">
            <Sparkles className="w-3 h-3 mr-1" />
            IA Exclusiva
          </Badge>
          {hasAccess && (
            <Badge className="bg-emerald-500/90 text-white border-0 shadow-lg backdrop-blur-sm text-xs font-medium">
              {accessibleAgents} Liberados
            </Badge>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={agentHeroImage}
            alt="Assistentes Soberanas"
            className={`w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105 ${
              !hasAccess ? "grayscale brightness-50" : ""
            }`}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

          {/* Lock overlay */}
          {!hasAccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-secondary/30 flex items-center justify-center">
                <Lock className="w-8 h-8 text-secondary" />
              </div>
            </div>
          )}

          {/* Bot icon */}
          <div className="absolute bottom-20 right-4 w-12 h-12 rounded-xl bg-secondary/20 backdrop-blur-sm border border-secondary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Bot className="w-6 h-6 text-secondary" />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-secondary/60 rounded-full"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: "100%",
                  opacity: 0,
                }}
                animate={{
                  y: "-20%",
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-secondary text-xs font-medium tracking-wider uppercase">
              ✨ Inteligência Artificial
            </span>
          </div>
          <h3 className="text-lg font-serif font-bold text-cream mb-1 group-hover:text-secondary transition-colors">
            Assistentes Soberanas
          </h3>
          <p className="text-cream/60 text-sm mb-3 line-clamp-2">
            Seus agentes de IA especializados para advocacia imobiliária
          </p>

          <div className="flex items-center justify-between">
            <span className="text-cream/50 text-xs">
              {totalAgents} agentes • {accessibleAgents} liberados
            </span>
            <div className="flex items-center gap-1 text-secondary text-sm font-medium">
              <span>Acessar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Premium glow */}
        {hasAccess && (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
      </div>
    </motion.div>
  );
}

export default AgentProgramCard;
