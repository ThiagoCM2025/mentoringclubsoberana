import { motion, useInView } from "framer-motion";
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
  Loader2
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

export const ProgramContentPreview = ({ programSlug }: ProgramContentPreviewProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

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

        if (modulesData) {
          const formattedModules = modulesData.map(m => ({
            ...m,
            lessons: (m.lessons || []).sort((a: any, b: any) => 
              (a.order_index || 0) - (b.order_index || 0)
            )
          }));
          setModules(formattedModules);
        }
      } catch (error) {
        console.error("Error fetching course content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [programSlug]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0),
    0
  );

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
      <section className="section-padding bg-background">
        <div className="container-soberana flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (modules.length === 0) {
    return null;
  }

  return (
    <PremiumBackground
      variant="light"
      pattern="circles-marsala"
      patternOpacity={0.03}
      showIsotipos
      isotipoVariant="marsala"
      showTopBorder
      showBottomBorder
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              Conteúdo Completo
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              O Que Você Vai{" "}
              <span className="text-primary">Aprender</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore todos os módulos e aulas disponíveis no programa
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{modules.length}</p>
                <p className="text-sm text-muted-foreground">Módulos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-foreground">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-sm text-muted-foreground">Aulas</p>
              </div>
            </div>

            {totalDuration > 0 && (
              <div className="flex items-center gap-3 text-foreground">
                <div className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
                  <p className="text-sm text-muted-foreground">De conteúdo</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Modules List */}
          <motion.div variants={staggerItem} className="max-w-4xl mx-auto">
            <div className="space-y-3">
              {modules.map((module, moduleIndex) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const moduleDuration = module.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0);

                return (
                  <Collapsible 
                    key={module.id} 
                    open={isExpanded} 
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className={cn(
                        "group rounded-xl border transition-all duration-300 p-4 flex items-center gap-4 cursor-pointer",
                        isExpanded 
                          ? "bg-card border-primary/30 shadow-lg shadow-primary/5" 
                          : "bg-card/50 border-border hover:border-primary/20 hover:bg-card"
                      )}>
                        {/* Module Number */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold shrink-0">
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
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="mt-2 ml-16 space-y-2 pb-2">
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
                    </CollapsibleContent>
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
