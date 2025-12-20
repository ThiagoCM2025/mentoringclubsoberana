import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StudyDay {
  date: string;
  lessonsCompleted: number;
  minutesStudied: number;
}

export function StudyCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [studyDays, setStudyDays] = useState<Map<string, StudyDay>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudyData();
    }
  }, [user, currentMonth]);

  const fetchStudyData = async () => {
    if (!user) return;

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data: progressData } = await supabase
      .from("progress")
      .select("completed_at, progress_seconds")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("completed_at", startOfMonth.toISOString())
      .lte("completed_at", endOfMonth.toISOString());

    const dayMap = new Map<string, StudyDay>();

    progressData?.forEach(p => {
      if (p.completed_at) {
        const dateStr = p.completed_at.split('T')[0];
        const existing = dayMap.get(dateStr) || { date: dateStr, lessonsCompleted: 0, minutesStudied: 0 };
        existing.lessonsCompleted += 1;
        existing.minutesStudied += Math.round((p.progress_seconds || 0) / 60);
        dayMap.set(dateStr, existing);
      }
    });

    setStudyDays(dayMap);
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Empty slots for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getHeatmapColor = (day: StudyDay | undefined): string => {
    if (!day) return "bg-zinc-800/50";
    if (day.lessonsCompleted >= 5) return "bg-green-500";
    if (day.lessonsCompleted >= 3) return "bg-green-500/80";
    if (day.lessonsCompleted >= 2) return "bg-green-500/60";
    if (day.lessonsCompleted >= 1) return "bg-green-500/40";
    return "bg-zinc-800/50";
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const totalLessons = Array.from(studyDays.values()).reduce((sum, d) => sum + d.lessonsCompleted, 0);
  const totalMinutes = Array.from(studyDays.values()).reduce((sum, d) => sum + d.minutesStudied, 0);
  const daysStudied = studyDays.size;

  const days = getDaysInMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-secondary/20 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-cream flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Calendário de Estudos
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8 text-cream/70 hover:text-cream"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-cream min-w-[120px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8 text-cream/70 hover:text-cream"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-secondary">{daysStudied}</p>
          <p className="text-xs text-cream/50">dias</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-secondary">{totalLessons}</p>
          <p className="text-xs text-cream/50">aulas</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-secondary">{Math.round(totalMinutes / 60)}h</p>
          <p className="text-xs text-cream/50">estudo</p>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs text-cream/50 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        <TooltipProvider>
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = day.toISOString().split('T')[0];
            const studyDay = studyDays.get(dateStr);
            const isToday = day.getTime() === today.getTime();
            const isFuture = day > today;

            return (
              <Tooltip key={dateStr}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                      isFuture ? "bg-zinc-800/30 text-cream/30" : getHeatmapColor(studyDay),
                      isToday && "ring-2 ring-secondary ring-offset-1 ring-offset-zinc-900",
                      studyDay && "text-white font-medium"
                    )}
                  >
                    {day.getDate()}
                  </motion.div>
                </TooltipTrigger>
                {!isFuture && (
                  <TooltipContent side="top" className="bg-zinc-900 border-secondary/30">
                    <div className="text-center">
                      <p className="text-xs text-cream/70">
                        {day.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </p>
                      {studyDay ? (
                        <div className="text-sm">
                          <p className="text-secondary font-medium">{studyDay.lessonsCompleted} aula(s)</p>
                          <p className="text-cream/60">{studyDay.minutesStudied} min</p>
                        </div>
                      ) : (
                        <p className="text-cream/50 text-xs">Sem atividade</p>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-xs text-cream/50 mr-2">Menos</span>
        <div className="w-3 h-3 rounded-sm bg-zinc-800/50" />
        <div className="w-3 h-3 rounded-sm bg-green-500/40" />
        <div className="w-3 h-3 rounded-sm bg-green-500/60" />
        <div className="w-3 h-3 rounded-sm bg-green-500/80" />
        <div className="w-3 h-3 rounded-sm bg-green-500" />
        <span className="text-xs text-cream/50 ml-2">Mais</span>
      </div>
    </div>
  );
}
