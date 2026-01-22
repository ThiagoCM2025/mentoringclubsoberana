import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminTask, TaskPriority } from "@/hooks/useTasks";
import { getBrazilNow } from "@/lib/dateUtils";

interface TaskCalendarProps {
  tasks: AdminTask[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-muted-foreground",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-destructive",
};

export function TaskCalendar({ tasks, selectedDate, onDateSelect }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(getBrazilNow());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with weekday
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date) && task.status !== "completed" && task.status !== "cancelled";
    });
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayTasks = getTasksForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "aspect-square p-1 rounded-lg flex flex-col items-center justify-start transition-colors",
                "hover:bg-accent",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isToday(day) && !isSelected && "bg-accent",
                !isCurrentMonth && "opacity-40"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  isToday(day) && !isSelected && "text-primary"
                )}
              >
                {format(day, "d")}
              </span>

              {/* Task indicators */}
              {dayTasks.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground/70" : priorityColors[task.priority]
                      )}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span
                      className={cn(
                        "text-[8px] leading-none",
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
        {Object.entries(priorityColors).map(([priority, color]) => (
          <div key={priority} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="text-xs text-muted-foreground capitalize">
              {priority === "low" ? "Baixa" : priority === "medium" ? "Média" : priority === "high" ? "Alta" : "Urgente"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
