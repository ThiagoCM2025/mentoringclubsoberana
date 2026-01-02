import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "default";
}

export const TagBadge = ({ name, color, onRemove, className, size = "default" }: TagBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-transparent",
        size === "sm" ? "text-xs px-1.5 py-0" : "text-xs px-2 py-0.5",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
};
