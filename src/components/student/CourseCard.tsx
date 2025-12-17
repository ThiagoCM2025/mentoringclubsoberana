import { motion } from "framer-motion";
import { Play, BookOpen, ChevronRight, Lock, ShoppingCart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  index?: number;
  isLocked?: boolean;
  price?: number | null;
  onPreview?: () => void;
}

const CourseCard = ({
  id,
  title,
  description,
  thumbnail,
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  index = 0,
  isLocked = false,
  price = null,
  onPreview
}: CourseCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLocked && onPreview) {
      onPreview();
    } else if (isLocked) {
      window.location.href = "/#produtos";
    } else {
      navigate(`/student/course/${id}`);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "";
    if (price === 0) return "Grátis";
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-secondary/10 group-hover:border-secondary/30 transition-colors">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLocked ? 'grayscale opacity-50' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className={`w-20 h-20 ${isLocked ? 'text-cream/10' : 'text-cream/20'}`} />
          </div>
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-zinc-800 border border-secondary/30 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-secondary" />
            </div>
            {price !== null && (
              <span className="px-4 py-1.5 bg-secondary rounded-full text-sm font-bold text-black">
                {formatPrice(price)}
              </span>
            )}
          </div>
        )}

        {/* Overlay gradient for unlocked */}
        {!isLocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Play button for unlocked */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-secondary/30"
            >
              <Play className="w-7 h-7 text-black ml-1" />
            </motion.div>
          </div>
        )}

        {/* Progress indicator for unlocked */}
        {!isLocked && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progress} className="h-1.5 rounded-none bg-zinc-800" />
          </div>
        )}

        {/* Completed Badge */}
        {!isLocked && progress === 100 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 rounded-full text-xs font-medium text-white">
            Concluído
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-serif font-semibold text-lg text-cream line-clamp-2 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-cream/50 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          {isLocked ? (
            <>
              <span className="text-sm text-cream/40">
                {price === 0 ? "Curso gratuito" : "Curso disponível"}
              </span>
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-1.5 bg-secondary text-black hover:bg-secondary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/#produtos";
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Adquirir
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 text-xs text-cream/40">
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
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
