import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  ShoppingCart, 
  Gift,
  Loader2 
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  order_index: number | null;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  is_free: boolean | null;
  order_index: number | null;
}

interface CoursePreviewModalProps {
  courseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CoursePreviewModal = ({ courseId, isOpen, onClose }: CoursePreviewModalProps) => {
  const [course, setCourse] = useState<{
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    price: number | null;
  } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && isOpen) {
      fetchCourseData();
    }
  }, [courseId, isOpen]);

  const fetchCourseData = async () => {
    if (!courseId) return;
    
    setLoading(true);

    const { data: courseData } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, price")
      .eq("id", courseId)
      .maybeSingle();

    if (courseData) {
      setCourse(courseData);
    }

    const { data: modulesData } = await supabase
      .from("modules")
      .select(`
        id, 
        title, 
        order_index,
        lessons (
          id, 
          title, 
          duration_minutes, 
          is_free, 
          order_index
        )
      `)
      .eq("course_id", courseId)
      .order("order_index");

    if (modulesData) {
      const sortedModules = modulesData.map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      }));
      setModules(sortedModules as Module[]);
    }

    setLoading(false);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
    0
  );
  const freeLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.is_free).length,
    0
  );

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "";
    if (price === 0) return "Grátis";
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const handlePurchase = () => {
    window.location.href = "/#produtos";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : course ? (
          <>
            <DialogHeader className="space-y-4">
              {course.thumbnail_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted -mx-6 -mt-6">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <DialogTitle className="text-2xl font-serif">{course.title}</DialogTitle>
              {course.description && (
                <p className="text-muted-foreground text-sm">{course.description}</p>
              )}
            </DialogHeader>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-lg font-bold">{modules.length}</span>
                </div>
                <span className="text-xs text-muted-foreground">Módulos</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <PlayCircle className="w-4 h-4" />
                  <span className="text-lg font-bold">{totalLessons}</span>
                </div>
                <span className="text-xs text-muted-foreground">Aulas</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-lg font-bold">{formatDuration(totalDuration)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Conteúdo</span>
              </div>
            </div>

            {/* Modules Accordion */}
            <div className="flex-1 overflow-y-auto py-2 -mx-6 px-6">
              {modules.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                  {modules.map((module, idx) => (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      className="border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-medium">{module.title}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({module.lessons.length} aulas)
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <ul className="space-y-2 pl-10">
                          {module.lessons.map((lesson, lessonIdx) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">
                                  {idx + 1}.{lessonIdx + 1}
                                </span>
                                <span className="text-foreground">{lesson.title}</span>
                                {lesson.is_free && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full">
                                    <Gift className="w-3 h-3" />
                                    Grátis
                                  </span>
                                )}
                              </div>
                              {lesson.duration_minutes && (
                                <span className="text-xs text-muted-foreground">
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>O conteúdo deste curso será disponibilizado em breve.</p>
                </div>
              )}
            </div>

            {/* Footer with price and CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-border -mx-6 px-6 -mb-6 pb-6 bg-muted/30">
              <div>
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(course.price)}
                </span>
                {freeLessons > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {freeLessons} aula{freeLessons > 1 ? "s" : ""} gratuita{freeLessons > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <Button onClick={handlePurchase} size="lg" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Adquirir Agora
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Curso não encontrado.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoursePreviewModal;
