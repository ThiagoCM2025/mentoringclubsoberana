import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  message?: string;
}

export const WhatsAppButton = ({ message }: WhatsAppButtonProps) => {
  const defaultMessage = "Olá! Vim pelo site Soberana e gostaria de mais informações";
  const encodedMessage = encodeURIComponent(message || defaultMessage);

  return (
    <motion.a
      href={`https://wa.me/5511993563468?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 bg-[#25D366] text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
      aria-label="Falar com Suporte Soberana no WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium text-sm max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[120px] transition-all duration-300">
        Suporte
      </span>
    </motion.a>
  );
};
