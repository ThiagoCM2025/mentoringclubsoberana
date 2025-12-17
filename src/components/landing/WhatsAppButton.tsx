import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os programas Soberana."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5C] text-white px-5 py-3 rounded-full shadow-lg transition-all group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-medium hidden sm:inline">Falar com Suporte</span>
      
      {/* Pulse animation */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping" />
    </motion.a>
  );
};
