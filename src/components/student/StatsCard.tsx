import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: "primary" | "secondary" | "accent" | "green" | "orange";
  index?: number;
}

const StatsCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color = "secondary",
  index = 0
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 bg-zinc-900 rounded-xl border border-secondary/20 hover:border-secondary/40 transition-all"
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg",
        color === "green" ? "bg-gradient-to-br from-green-500 to-green-400" :
        color === "orange" ? "bg-gradient-to-br from-orange-500 to-orange-400" :
        "bg-gradient-to-br from-secondary to-secondary-light"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          color === "green" || color === "orange" ? "text-white" : "text-black"
        )} />
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-cream">{value}</p>
          <p className="text-sm text-cream/75 mt-1 font-medium">{label}</p>
        </div>
        
        {trend && (
          <span className="text-xs text-green-400 font-medium bg-green-500/20 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
