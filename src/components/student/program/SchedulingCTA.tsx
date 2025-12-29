import { motion } from "framer-motion";
import { Calendar, ExternalLink, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SchedulingCTAProps {
  calendarLink: string;
  isEnabled: boolean;
  className?: string;
}

export const SchedulingCTA = ({ calendarLink, isEnabled, className }: SchedulingCTAProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        "relative rounded-xl border p-6 overflow-hidden transition-all duration-300",
        isEnabled 
          ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-secondary/10 border-secondary/30"
          : "bg-zinc-900/50 border-zinc-700/50",
        className
      )}
    >
      {/* Background shimmer when enabled */}
      {isEnabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/5 to-transparent animate-shimmer" />
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
          isEnabled 
            ? "bg-secondary/20 text-secondary"
            : "bg-zinc-800 text-zinc-500"
        )}>
          {isEnabled ? (
            <Calendar className="w-7 h-7" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className={cn(
            "text-xs mb-1",
            isEnabled ? "text-cream/50" : "text-zinc-600"
          )}>
            Passo 2
          </p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-serif font-semibold text-lg",
              isEnabled ? "text-cream" : "text-zinc-500"
            )}>
              Agende seu Encontro Individual de Onboarding
            </h3>
            {isEnabled && (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>
          <p className={cn(
            "text-sm",
            isEnabled ? "text-cream/70" : "text-zinc-600"
          )}>
            {isEnabled 
              ? "Clique aqui para agendar seu Encontro Individual de Onboarding."
              : "Complete o diagnóstico acima para liberar o agendamento"
            }
          </p>
        </div>

        {/* Button */}
        <Button
          variant={isEnabled ? "cta" : "outline"}
          size="lg"
          disabled={!isEnabled}
          onClick={() => window.open(calendarLink, '_blank', 'noopener,noreferrer')}
          className={cn(
            "flex-shrink-0 gap-2 whitespace-nowrap",
            !isEnabled && "opacity-50 cursor-not-allowed border-zinc-700 text-zinc-600"
          )}
        >
          <Calendar className="w-4 h-4" />
          AGENDAR ONBOARDING INDIVIDUAL
          {isEnabled && <ExternalLink className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};
