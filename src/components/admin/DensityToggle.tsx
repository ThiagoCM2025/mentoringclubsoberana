import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DENSITY_KEY = "admin-density-mode";

export type DensityMode = "comfortable" | "compact";

interface DensityToggleProps {
  onChange?: (mode: DensityMode) => void;
}

export const useDensityMode = () => {
  const [mode, setMode] = useState<DensityMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(DENSITY_KEY) as DensityMode) || "comfortable";
    }
    return "comfortable";
  });

  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, mode);
    
    // Apply CSS class to root element
    const root = document.documentElement;
    if (mode === "compact") {
      root.classList.add("admin-compact");
    } else {
      root.classList.remove("admin-compact");
    }
  }, [mode]);

  return { mode, setMode };
};

export const DensityToggle = ({ onChange }: DensityToggleProps) => {
  const { mode, setMode } = useDensityMode();

  const toggleMode = () => {
    const newMode = mode === "comfortable" ? "compact" : "comfortable";
    setMode(newMode);
    onChange?.(newMode);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMode}
            className="text-muted-foreground hover:text-secondary hover:bg-secondary/10"
          >
            {mode === "comfortable" ? (
              <List className="w-4 h-4" />
            ) : (
              <LayoutGrid className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {mode === "comfortable" ? "Modo Compacto" : "Modo Confortável"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
