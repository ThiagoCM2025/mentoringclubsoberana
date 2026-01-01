import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { resolveImageUrl } from "@/lib/imageResolver";

interface ContinueWatchingItem {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  thumbnail: string | null;
  progress: number;
  duration: number | null;
}

interface ContinueWatchingProps {
  items: ContinueWatchingItem[];
}

const ContinueWatching = ({ items }: ContinueWatchingProps) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-serif font-bold text-cream mb-4">
        Continue Assistindo
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item, index) => (
          <motion.div
            key={item.lessonId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/student/lesson/${item.lessonId}`)}
            className="flex-shrink-0 w-72 bg-zinc-900 rounded-xl overflow-hidden cursor-pointer group border border-secondary/10 hover:border-secondary/30 transition-all duration-300"
          >
            <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
              {resolveImageUrl(item.thumbnail) ? (
                <img
                  src={resolveImageUrl(item.thumbnail)!}
                  alt={item.lessonTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary/40 transition-all duration-300">
                    <Play className="w-8 h-8 text-secondary ml-1" />
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Play button on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-secondary/90 flex items-center justify-center shadow-lg shadow-secondary/30">
                  <Play className="w-6 h-6 text-black ml-1" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0">
                <Progress value={item.progress} className="h-1 rounded-none bg-zinc-800" />
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-secondary mb-1 truncate font-medium">
                {item.courseTitle}
              </p>
              <h3 className="font-medium text-cream line-clamp-2 mb-2">
                {item.lessonTitle}
              </h3>
              <div className="flex items-center justify-between text-xs text-cream/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.duration ? `${item.duration} min` : "—"}
                </span>
                <span className="text-secondary font-semibold">
                  {item.progress}% completo
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatching;
