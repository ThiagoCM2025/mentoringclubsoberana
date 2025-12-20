import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Map, 
  BookOpen, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Lock,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  difficulty_level: string;
  estimated_hours: number;
  order_index: number;
}

interface PathCourse {
  id: string;
  course_id: string;
  order_index: number;
  is_required: boolean;
  course: {
    id: string;
    title: string;
    thumbnail_url: string | null;
  };
}

interface UserPathProgress {
  learning_path_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-500 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-500 border-red-500/30"
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado"
};

export function LearningPaths() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [pathCourses, setPathCourses] = useState<Record<string, PathCourse[]>>({});
  const [userProgress, setUserProgress] = useState<Record<string, UserPathProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningPaths();
  }, [user]);

  const fetchLearningPaths = async () => {
    // Fetch published learning paths
    const { data: pathsData } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("is_published", true)
      .order("order_index");

    if (pathsData) {
      setPaths(pathsData);

      // Fetch courses for each path
      for (const path of pathsData) {
        const { data: coursesData } = await supabase
          .from("learning_path_courses")
          .select(`
            id,
            course_id,
            order_index,
            is_required,
            courses:course_id (
              id,
              title,
              thumbnail_url
            )
          `)
          .eq("learning_path_id", path.id)
          .order("order_index");

        if (coursesData) {
          setPathCourses(prev => ({
            ...prev,
            [path.id]: coursesData.map(c => ({
              ...c,
              course: c.courses as any
            }))
          }));
        }
      }

      // Fetch user progress
      if (user) {
        const { data: progressData } = await supabase
          .from("user_learning_paths")
          .select("*")
          .eq("user_id", user.id);

        if (progressData) {
          const progressMap: Record<string, UserPathProgress> = {};
          progressData.forEach(p => {
            progressMap[p.learning_path_id] = p;
          });
          setUserProgress(progressMap);
        }
      }
    }

    setLoading(false);
  };

  const startLearningPath = async (pathId: string) => {
    if (!user) return;

    await supabase.from("user_learning_paths").insert({
      user_id: user.id,
      learning_path_id: pathId,
      progress_percentage: 0
    });

    setUserProgress(prev => ({
      ...prev,
      [pathId]: {
        learning_path_id: pathId,
        progress_percentage: 0,
        started_at: new Date().toISOString(),
        completed_at: null
      }
    }));

    // Navigate to first course
    const courses = pathCourses[pathId];
    if (courses && courses.length > 0) {
      navigate(`/student/course/${courses[0].course_id}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-48 bg-zinc-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="text-center py-12">
        <Map className="w-12 h-12 text-cream/30 mx-auto mb-3" />
        <p className="text-cream/50">Nenhuma trilha disponível ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {paths.map((path, index) => {
        const courses = pathCourses[path.id] || [];
        const progress = userProgress[path.id];
        const isStarted = !!progress;
        const isCompleted = progress?.completed_at != null;

        return (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative overflow-hidden rounded-2xl border transition-all",
              isCompleted 
                ? "border-green-500/30 bg-green-500/5" 
                : "border-secondary/20 bg-zinc-900/50 hover:border-secondary/40"
            )}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-transparent to-accent" />
            </div>

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", DIFFICULTY_COLORS[path.difficulty_level])}>
                      {DIFFICULTY_LABELS[path.difficulty_level] || path.difficulty_level}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-cream">{path.title}</h3>
                  {path.description && (
                    <p className="text-sm text-cream/60 mt-1 line-clamp-2">{path.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm text-cream/60">
                    <Clock className="w-4 h-4" />
                    {path.estimated_hours}h
                  </div>
                  <div className="flex items-center gap-1 text-sm text-cream/60 mt-1">
                    <BookOpen className="w-4 h-4" />
                    {courses.length} cursos
                  </div>
                </div>
              </div>

              {/* Progress */}
              {isStarted && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-cream/70">Progresso</span>
                    <span className="text-secondary font-medium">{progress.progress_percentage}%</span>
                  </div>
                  <Progress value={progress.progress_percentage} className="h-2 bg-secondary/20" />
                </div>
              )}

              {/* Course Path */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {courses.map((course, i) => {
                  const isUnlocked = i === 0 || (isStarted && progress.progress_percentage >= (i / courses.length) * 100);
                  
                  return (
                    <div key={course.id} className="flex items-center shrink-0">
                      <motion.div
                        whileHover={isUnlocked ? { scale: 1.05 } : {}}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer",
                          isUnlocked 
                            ? "border-secondary bg-secondary/20 hover:bg-secondary/30" 
                            : "border-zinc-700 bg-zinc-800/50"
                        )}
                        onClick={() => isUnlocked && navigate(`/student/course/${course.course_id}`)}
                      >
                        {isUnlocked ? (
                          <Play className="w-5 h-5 text-secondary" />
                        ) : (
                          <Lock className="w-4 h-4 text-cream/40" />
                        )}
                      </motion.div>
                      {i < courses.length - 1 && (
                        <div className={cn(
                          "w-8 h-0.5 mx-1",
                          isUnlocked ? "bg-secondary/50" : "bg-zinc-700"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {!isStarted && (
                <Button
                  onClick={() => startLearningPath(path.id)}
                  className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Começar Trilha
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {isStarted && !isCompleted && (
                <Button
                  onClick={() => {
                    const nextCourseIndex = Math.floor((progress.progress_percentage / 100) * courses.length);
                    const nextCourse = courses[Math.min(nextCourseIndex, courses.length - 1)];
                    if (nextCourse) navigate(`/student/course/${nextCourse.course_id}`);
                  }}
                  className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Continuar Trilha
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
