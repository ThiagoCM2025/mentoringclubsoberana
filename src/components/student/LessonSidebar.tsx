import { motion } from "framer-motion";
import { CheckCircle, PlayCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  completed: boolean;
  isCurrent: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonSidebarProps {
  modules: Module[];
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
}

const LessonSidebar = ({ modules, currentLessonId, onLessonSelect }: LessonSidebarProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.map(m => m.id)
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <div className="p-4 border-b border-secondary/20 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10">
        <h3 className="font-serif font-semibold text-cream">
          Conteúdo do Curso
        </h3>
      </div>

      <div className="divide-y divide-secondary/20">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.includes(module.id);
          const completedCount = module.lessons.filter(l => l.completed).length;
          const hasCurrentLesson = module.lessons.some(l => l.id === currentLessonId);

          return (
            <div key={module.id}>
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors text-left",
                  hasCurrentLesson && "bg-secondary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                    completedCount === module.lessons.length
                      ? "bg-green-500/20 text-green-500"
                      : "bg-secondary/20 text-secondary"
                  )}>
                    {moduleIndex + 1}
                  </div>
                  <div>
                    <p className="font-medium text-cream text-sm">
                      {module.title}
                    </p>
                    <p className="text-xs text-cream/50">
                      {completedCount}/{module.lessons.length} aulas
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-cream/50" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-cream/50" />
                )}
              </button>

              {/* Lessons */}
              <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : 0 }}
                className="overflow-hidden"
              >
                <div className="py-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCurrent = lesson.id === currentLessonId;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onLessonSelect(lesson.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-all text-left",
                          isCurrent && "bg-secondary/15 border-l-2 border-secondary"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                          lesson.completed
                            ? "bg-green-500/20 text-green-500"
                            : isCurrent
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-zinc-800 text-cream/50"
                        )}>
                          {lesson.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isCurrent ? (
                            <PlayCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{lessonIndex + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            lesson.completed
                              ? "text-cream/50"
                              : isCurrent
                              ? "text-cream font-medium"
                              : "text-cream/70"
                          )}>
                            {lesson.title}
                          </p>
                          {lesson.duration_minutes && (
                            <p className="text-xs text-cream/40 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {lesson.duration_minutes} min
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonSidebar;
