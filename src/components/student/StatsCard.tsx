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

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/30 text-accent-foreground",
  green: "bg-green-500/10 text-green-500",
  orange: "bg-orange-500/10 text-orange-500",
};

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
      className="bg-card rounded-xl p-5 border border-border/50 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg"
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        colorClasses[color]
      )}>
        <Icon className="w-6 h-6" />
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
        
        {trend && (
          <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
