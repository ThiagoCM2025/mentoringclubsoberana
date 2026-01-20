import { useState } from "react";
import { Filter, X, Calendar, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface ConversationFilters {
  contactType: "all" | "lead" | "student";
  dateRange: "all" | "today" | "week" | "month";
  hasUnread: boolean;
}

interface ConversationFiltersProps {
  filters: ConversationFilters;
  onFiltersChange: (filters: ConversationFilters) => void;
}

const contactTypeOptions = [
  { value: "all", label: "Todas" },
  { value: "lead", label: "Leads" },
  { value: "student", label: "Alunas" },
] as const;

const dateRangeOptions = [
  { value: "all", label: "Qualquer data" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
] as const;

export function ConversationFiltersPopover({
  filters,
  onFiltersChange,
}: ConversationFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = [
    filters.contactType !== "all",
    filters.dateRange !== "all",
    filters.hasUnread,
  ].filter(Boolean).length;

  const handleContactTypeChange = (value: ConversationFilters["contactType"]) => {
    onFiltersChange({ ...filters, contactType: value });
  };

  const handleDateRangeChange = (value: ConversationFilters["dateRange"]) => {
    onFiltersChange({ ...filters, dateRange: value });
  };

  const handleUnreadChange = (checked: boolean) => {
    onFiltersChange({ ...filters, hasUnread: checked });
  };

  const handleClearAll = () => {
    onFiltersChange({
      contactType: "all",
      dateRange: "all",
      hasUnread: false,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 relative",
            activeFiltersCount > 0 && "text-[#25D366]"
          )}
        >
          <Filter className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#25D366] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filtros</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleClearAll}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="p-3 space-y-4">
          {/* Contact Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Tipo de Contato
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contactTypeOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filters.contactType === option.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    filters.contactType === option.value
                      ? "bg-[#25D366] hover:bg-[#128C7E] border-[#25D366]"
                      : "hover:border-[#25D366]/50"
                  )}
                  onClick={() => handleContactTypeChange(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Período
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dateRangeOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filters.dateRange === option.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    filters.dateRange === option.value
                      ? "bg-[#25D366] hover:bg-[#128C7E] border-[#25D366]"
                      : "hover:border-[#25D366]/50"
                  )}
                  onClick={() => handleDateRangeChange(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Unread Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unread-only"
              checked={filters.hasUnread}
              onCheckedChange={(checked) => handleUnreadChange(checked as boolean)}
              className="data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366]"
            />
            <Label
              htmlFor="unread-only"
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Apenas não lidas
            </Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
