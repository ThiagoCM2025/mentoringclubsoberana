import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Clock, CheckCircle } from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface SchedulingContentProps {
  url: string;
  title: string;
  description?: string | null;
  buttonText?: string | null;
  isCompleted?: boolean;
  onComplete?: () => void;
}

const SchedulingContent = ({
  url,
  title,
  description,
  buttonText,
  isCompleted,
  onComplete,
}: SchedulingContentProps) => {
  const handleOpenCalendar = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      {/* Floating isotipo decoration */}
      <motion.img
        src={isotipoGold}
        alt=""
        className="absolute top-8 right-8 w-16 h-16 opacity-20"
        animate={{
          y: [0, -10, 0],
          filter: [
            "drop-shadow(0 0 10px hsla(38, 30%, 51%, 0.2))",
            "drop-shadow(0 0 20px hsla(38, 30%, 51%, 0.4))",
            "drop-shadow(0 0 10px hsla(38, 30%, 51%, 0.2))",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* Calendar Icon with glow */}
        <motion.div
          className="mx-auto mb-8 w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 20px hsla(38, 30%, 51%, 0.2)",
              "0 0 40px hsla(38, 30%, 51%, 0.4)",
              "0 0 20px hsla(38, 30%, 51%, 0.2)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Calendar className="w-12 h-12 text-secondary" />
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-cream mb-4">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-cream/70 mb-8 leading-relaxed">
            {description}
          </p>
        )}

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            onClick={handleOpenCalendar}
            className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold px-8 py-6 text-lg shadow-lg shadow-secondary/20"
          >
            <Calendar className="w-5 h-5 mr-3" />
            {buttonText || "Agendar Agora"}
            <ExternalLink className="w-4 h-4 ml-3 opacity-60" />
          </Button>
        </motion.div>

        {/* Completion reminder */}
        {!isCompleted && onComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-cream/50 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Após agendar, marque como concluída acima
          </motion.p>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex items-center justify-center gap-2 text-green-500"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Agendamento realizado!</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SchedulingContent;
