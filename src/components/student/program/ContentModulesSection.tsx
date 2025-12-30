import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock,
  FileText,
  Video,
  Target,
  Filter,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
  lesson_type: string;
  lesson_label: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  module_type: string;
  unlock_week: number | null;
  is_dynamic: boolean;
  lessons: Lesson[];
}

interface ContentModulesSectionProps {
  modules: Module[];
  lessonProgress: Record<string, boolean>;
  onLessonClick: (lessonId: string) => void;
}

export const ContentModulesSection = ({
  modules,
  lessonProgress,
  onLessonClick
}: ContentModulesSectionProps) => {
  const navigate = useNavigate();
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  // Filter out onboarding and dynamic modules (they have their own sections)
  const contentModules = modules.filter(m => 
    m.module_type !== 'onboarding' && !m.is_dynamic
  );

  // Calculate overall progress
  const totalLessons = contentModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = contentModules.reduce((acc, m) => 
    acc + m.lessons.filter(l => lessonProgress[l.id]).length, 0
  );
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Get lesson badge based on lesson_label or lesson_type
  const getLessonBadge = (lesson: Lesson) => {
    // Priority: lesson_label (specific labels)
    if (lesson.lesson_label === 'estrategico') {
      return <Badge className="bg-secondary/20 text-secondary text-[10px] border-0">ESTRATÉGICO</Badge>;
    }
    if (lesson.lesson_label === 'tecnico') {
      return <Badge className="bg-blue-500/20 text-blue-400 text-[10px] border-0">TÉCNICO</Badge>;
    }
    if (lesson.lesson_label === 'material') {
      return <Badge className="bg-green-500/20 text-green-400 text-[10px] border-0">MATERIAL</Badge>;
    }
    if (lesson.lesson_label === 'tutorial') {
      return <Badge className="bg-purple-500/20 text-purple-400 text-[10px] border-0">TUTORIAL</Badge>;
    }
    if (lesson.lesson_label === 'entregavel') {
      return <Badge className="bg-orange-500/20 text-orange-400 text-[10px] border-0">ENTREGÁVEL</Badge>;
    }
    if (lesson.lesson_label === 'acao') {
      return <Badge className="bg-pink-500/20 text-pink-400 text-[10px] border-0">AÇÃO</Badge>;
    }
    
    // Fallback to lesson_type
    switch (lesson.lesson_type) {
      case 'video':
        return <Badge variant="outline" className="border-secondary/30 text-secondary text-[10px]">VÍDEO</Badge>;
      case 'text':
        return <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-[10px]">MATERIAL</Badge>;
      case 'action':
        return <Badge variant="outline" className="border-green-400/30 text-green-400 text-[10px]">AÇÃO</Badge>;
      default:
        return null;
    }
  };

  const getLessonIcon = (lesson: Lesson, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    
    if (lesson.lesson_label === 'material' || lesson.lesson_label === 'entregavel' || lesson.lesson_type === 'text') {
      return <FileText className="w-4 h-4" />;
    }
    
    return <Video className="w-4 h-4" />;
  };

  // Get module icon based on type
  const getModuleIcon = (module: Module, isComplete: boolean) => {
    if (isComplete) return <CheckCircle className="w-5 h-5" />;
    
    switch (module.module_type) {
      case 'recordings':
        return <Video className="w-5 h-5" />;
      case 'individual':
        return <FileText className="w-5 h-5" />;
      default:
        return null; // Will show number instead
    }
  };

  // Filter lessons based on completion status
  const getFilteredLessons = (lessons: Lesson[]) => {
    if (!showOnlyIncomplete) return lessons;
    return lessons.filter(l => !lessonProgress[l.id]);
  };

  // Filter modules that have lessons to show
  const filteredModules = showOnlyIncomplete 
    ? contentModules.filter(m => m.lessons.some(l => !lessonProgress[l.id]))
    : contentModules;

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-serif font-bold text-cream flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary" />
            Conteúdo do Programa
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filter toggle */}
          <button
            onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
              showOnlyIncomplete 
                ? "bg-secondary/20 text-secondary" 
                : "bg-zinc-800 text-cream/70 hover:bg-zinc-700"
            )}
          >
            <Filter className="w-4 h-4" />
            {showOnlyIncomplete ? "Mostrando pendentes" : "Mostrar pendentes"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-zinc-900/80 rounded-xl p-4 border border-secondary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-cream/70">Progresso do conteúdo</span>
          <span className="text-sm font-medium text-secondary">
            {completedLessons}/{totalLessons} aulas ({Math.round(progressPercentage)}%)
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-secondary [&>div]:to-amber-400"
        />
      </div>

      {/* Modules Accordion */}
      <Accordion type="multiple" className="space-y-3">
        {filteredModules.map((module, moduleIndex) => {
          const filteredLessons = getFilteredLessons(module.lessons);
          const moduleCompleted = module.lessons.every(l => lessonProgress[l.id]);
          const moduleLessonsCompleted = module.lessons.filter(l => lessonProgress[l.id]).length;
          const moduleProgress = module.lessons.length > 0 
            ? (moduleLessonsCompleted / module.lessons.length) * 100 
            : 0;

          // Get pilar number if it's a pillar module
          const pilarMatch = module.title.match(/Pilar\s*(\d+)/i);
          const pilarNumber = pilarMatch ? parseInt(pilarMatch[1]) : null;

          return (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="bg-zinc-900 rounded-xl border border-secondary/20 overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-4 text-left w-full">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                    moduleCompleted
                      ? "bg-green-500/20 text-green-400"
                      : "bg-secondary/20 text-secondary"
                  )}>
                    {moduleCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : getModuleIcon(module, false) || (
                      <span>{pilarNumber || moduleIndex + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold text-cream">
                        {module.title}
                      </h3>
                      {module.module_type === 'recordings' && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">
                          GRAVAÇÕES
                        </Badge>
                      )}
                      {module.module_type === 'individual' && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">
                          INDIVIDUAL
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-cream/50">
                        {moduleLessonsCompleted}/{module.lessons.length} aulas
                      </p>
                      <div className="flex-1 max-w-24">
                        <Progress 
                          value={moduleProgress} 
                          className="h-1 bg-zinc-800 [&>div]:bg-secondary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-5 pb-4">
                <div className="space-y-1 pt-2">
                  {filteredLessons.length === 0 ? (
                    <p className="text-sm text-cream/50 text-center py-4">
                      Todas as aulas deste módulo foram concluídas! 🎉
                    </p>
                  ) : (
                    filteredLessons.map((lesson) => {
                      const isCompleted = lessonProgress[lesson.id];
                      
                      return (
                        <motion.button
                          key={lesson.id}
                          onClick={() => onLessonClick(lesson.id)}
                          whileHover={{ x: 4 }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/10 transition-all text-left group"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            isCompleted 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-zinc-800 text-cream/50 group-hover:bg-secondary/20 group-hover:text-secondary"
                          )}>
                            {getLessonIcon(lesson, isCompleted)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium transition-colors truncate",
                              isCompleted ? "text-cream/50 line-through" : "text-cream group-hover:text-secondary"
                            )}>
                              {lesson.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getLessonBadge(lesson)}
                            {lesson.duration_minutes && (
                              <span className="text-xs text-cream/40 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration_minutes}m
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {filteredModules.length === 0 && showOnlyIncomplete && (
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-secondary/20">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="font-serif font-semibold text-cream text-lg mb-2">
            Parabéns! Conteúdo 100% concluído! 🎉
          </h3>
          <p className="text-cream/60 text-sm">
            Você completou todas as aulas do programa.
          </p>
        </div>
      )}
    </div>
  );
};
