import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2 mb-2"
    >
      <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-md px-3 py-2 shadow-md flex items-center gap-2">
        <div className="flex gap-1">
          <motion.span
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.span
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.15,
            }}
          />
          <motion.span
            className="w-2 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.3,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground italic">digitando...</span>
      </div>
    </motion.div>
  );
}
