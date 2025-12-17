import { motion } from "framer-motion";
import { Play, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  progress: number;
  totalLessons?: number;
  completedLessons?: number;
  index?: number;
}

const CourseCard = ({
  id,
  title,
  description,
  thumbnail,
  progress,
  totalLessons = 0,
  completedLessons = 0,
  index = 0
}: CourseCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/student/course/${id}`)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary to-marsala-light">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-primary-foreground/30" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
          >
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </motion.div>
        </div>

        {/* Progress indicator */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progress} className="h-1.5 rounded-none bg-background/30" />
          </div>
        )}

        {/* Badge */}
        {progress === 100 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 rounded-full text-xs font-medium text-white">
            Concluído
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-serif font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {totalLessons > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {completedLessons}/{totalLessons} aulas
              </span>
            )}
          </div>
          
          <span className="flex items-center gap-1 text-sm font-medium text-secondary group-hover:translate-x-1 transition-transform">
            {progress === 0 ? "Começar" : progress === 100 ? "Revisar" : "Continuar"}
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
