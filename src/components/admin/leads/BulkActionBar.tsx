import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, X, CheckSquare, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionBarProps {
  selectedCount: number;
  onSendMessage: () => void;
  onClearSelection: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  totalLeads: number;
}

export function BulkActionBar({
  selectedCount,
  onSendMessage,
  onClearSelection,
  isSelectionMode,
  onToggleSelectionMode,
  onSelectAll,
  totalLeads,
}: BulkActionBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left side - Selection mode toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={isSelectionMode ? "gold" : "outline"}
          size="sm"
          onClick={onToggleSelectionMode}
          className="gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          {isSelectionMode ? "Sair da Seleção" : "Selecionar"}
        </Button>

        {isSelectionMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Selecionar Todos ({totalLeads})
          </Button>
        )}
      </div>

      {/* Right side - Floating action bar when items selected */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 bg-card border border-secondary/30 rounded-lg px-4 py-2 shadow-lg"
          >
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/30">
              {selectedCount} lead{selectedCount > 1 ? "s" : ""} selecionado{selectedCount > 1 ? "s" : ""}
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={onSendMessage}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Enviar Mensagem
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
