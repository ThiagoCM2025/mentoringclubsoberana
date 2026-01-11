import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { PremiumBackground } from "@/components/ui/premium-background";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  PlayCircle, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Paperclip,
  Loader2,
  Sparkles,
  FileText
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface ProgramContentPreviewProps {
  programSlug: string;
}

// Fallback modules for when there's no database content
const fallbackModules = [
  { id: "1", title: "Semana 1-2: Fundação e Mentalidade", lessons: 4, duration: 120 },
  { id: "2", title: "Semana 3-4: Posicionamento e Autoridade", lessons: 5, duration: 150 },
  { id: "3", title: "Semana 5-6: Marketing Ético e Captação", lessons: 6, duration: 180 },
  { id: "4", title: "Semana 7-8: Vendas e Negociação", lessons: 5, duration: 150 },
  { id: "5", title: "Semana 9-10: Gestão e Processos", lessons: 4, duration: 120 },
  { id: "6", title: "Semana 11-12: Escala e Automação", lessons: 4, duration: 120 },
];

export const ProgramContentPreview = ({ programSlug }: ProgramContentPreviewProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        // Map program slug to course title pattern
        const coursePatterns: Record<string, string> = {
          "aceleracao": "Aceleração",
          "mentoria-360": "360",
          "elite": "Elite",
          "workshop-ia": "IA",
          "experience-start": "Experience"
        };

        const pattern = coursePatterns[programSlug] || programSlug;

        // First, find the course
        const { data: courses, error: courseError } = await supabase
          .from("courses")
          .select("id, title")
          .ilike("title", `%${pattern}%`)
          .is("deleted_at", null)
          .limit(1);

        if (courseError) throw courseError;
        if (!courses || courses.length === 0) {
          setUseFallback(true);
          setLoading(false);
          return;
        }

        const courseId = courses[0].id;

        // Fetch modules with lessons
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select(`
            id,
            title,
            order_index,
            lessons (
              id,
              title,
              duration_minutes,
              order_index
            )
          `)
          .eq("course_id", courseId)
          .is("deleted_at", null)
          .order("order_index", { ascending: true });

        if (modulesError) throw modulesError;

        if (modulesData && modulesData.length > 0) {
          const formattedModules = modulesData.map(m => ({
            ...m,
            lessons: (m.lessons || []).sort((a: any, b: any) => 
              (a.order_index || 0) - (b.order_index || 0)
            )
          }));
          setModules(formattedModules);
        } else {
          setUseFallback(true);
        }
      } catch (error) {
        console.error("Error fetching course content:", error);
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [programSlug]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <section className="section-padding bg-card">
        <div className="container-soberana flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </section>
    );
  }

  // Fallback content when no database data
  if (useFallback || modules.length === 0) {
    const totalLessons = fallbackModules.reduce((acc, m) => acc + m.lessons, 0);
    const totalDuration = fallbackModules.reduce((acc, m) => acc + m.duration, 0);

    return (
      <PremiumBackground
        variant="light"
        pattern="circles-marsala"
        patternOpacity={0.03}
        showIsotipos
        isotipoVariant="marsala"
        showTopBorder
        showVignette
        isInView={isInView}
        sectionClassName="section-padding"
      >
        <div ref={ref} className="container-soberana">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-12"
          >
            {/* Header */}
            <motion.div variants={staggerItem} className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
                <Sparkles className="w-5 h-5 text-primary" />
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
                Conteúdo do{" "}
                <span className="text-primary">Programa</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                12 semanas de transformação com aulas práticas e mentorias ao vivo
              </p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{fallbackModules.length}</p>
                  <p className="text-sm text-muted-foreground">Módulos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 flex items-center justify-center">
                  <PlayCircle className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
                  <p className="text-sm text-muted-foreground">Aulas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-secondary/20 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatDuration(totalDuration)}</p>
                  <p className="text-sm text-muted-foreground">De conteúdo</p>
                </div>
              </div>
            </motion.div>

            {/* Fallback Modules List */}
            <motion.div variants={staggerItem} className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {fallbackModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    variants={staggerItem}
                    className="group"
                  >
                    <div className="relative rounded-xl overflow-hidden">
                      {/* Border gradient */}
                      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-secondary/30 via-transparent to-primary/20 group-hover:from-secondary/50 group-hover:to-primary/40 transition-all duration-500">
                        <div className="absolute inset-[1px] rounded-xl bg-card" />
                      </div>
                      
                      <div className="relative p-5 rounded-xl backdrop-blur-sm group-hover:shadow-[0_0_35px_rgba(166,144,97,0.1)] transition-all duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {module.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {module.lessons} aulas • {formatDuration(module.duration)}
                            </p>
                          </div>
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Note */}
            <motion.div variants={staggerItem} className="text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Paperclip className="w-4 h-4" />
                Materiais de apoio, templates e ferramentas exclusivas inclusos
              </p>
            </motion.div>
          </motion.div>
        </div>
      </PremiumBackground>
    );
  }

  // Database content exists
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0),
    0
  );

  return (
    <PremiumBackground
      variant="light"
      pattern="circles-marsala"
      patternOpacity={0.03}
      showIsotipos
      isotipoVariant="marsala"
      showTopBorder
      showVignette
      isInView={isInView}
      sectionClassName="section-padding"
    >
      <div ref={ref} className="container-soberana">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              O Que Você Vai{" "}
              <span className="text-primary">Aprender</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore todos os módulos e aulas disponíveis no programa
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{modules.length}</p>
                <p className="text-sm text-muted-foreground">Módulos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 flex items-center justify-center">
                <PlayCircle className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
                <p className="text-sm text-muted-foreground">Aulas</p>
              </div>
            </div>

            {totalDuration > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-secondary/20 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatDuration(totalDuration)}</p>
                  <p className="text-sm text-muted-foreground">De conteúdo</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Modules List */}
          <motion.div variants={staggerItem} className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {modules.map((module, moduleIndex) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const moduleDuration = module.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0);

                return (
                  <Collapsible 
                    key={module.id} 
                    open={isExpanded} 
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <div className="relative rounded-xl overflow-hidden group">
                      {/* Border gradient */}
                      <div className={cn(
                        "absolute inset-0 rounded-xl p-[1px] transition-all duration-500",
                        isExpanded 
                          ? "bg-gradient-to-br from-secondary/50 via-secondary/20 to-primary/40" 
                          : "bg-gradient-to-br from-secondary/30 via-transparent to-primary/20 group-hover:from-secondary/50 group-hover:to-primary/40"
                      )}>
                        <div className="absolute inset-[1px] rounded-xl bg-card" />
                      </div>

                      <CollapsibleTrigger className="w-full">
                        <div className={cn(
                          "relative rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-500",
                          isExpanded 
                            ? "shadow-lg shadow-secondary/10" 
                            : "hover:shadow-[0_0_35px_rgba(166,144,97,0.1)]"
                        )}>
                          {/* Module Number */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                            {moduleIndex + 1}
                          </div>

                          {/* Module Info */}
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {module.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {module.lessons.length} aula(s)
                              {moduleDuration > 0 && ` • ${formatDuration(moduleDuration)}`}
                            </p>
                          </div>

                          {/* Expand Icon */}
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-secondary" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative px-5 pb-5 pt-2"
                          >
                            <div className="ml-12 space-y-2 border-l-2 border-secondary/20 pl-4">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <span className="text-xs text-muted-foreground w-8">
                                    {moduleIndex + 1}.{lessonIndex + 1}
                                  </span>
                                  <PlayCircle className="w-4 h-4 text-secondary shrink-0" />
                                  <span className="flex-1 text-sm text-foreground truncate">
                                    {lesson.title}
                                  </span>
                                  {lesson.duration_minutes && (
                                    <span className="text-xs text-muted-foreground">
                                      {lesson.duration_minutes}min
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom Note */}
          <motion.div variants={staggerItem} className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Paperclip className="w-4 h-4" />
              Materiais de apoio e templates inclusos em cada módulo
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PremiumBackground>
  );
};
