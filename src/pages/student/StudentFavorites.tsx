import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Heart, 
  PlayCircle, 
  Clock,
  BookOpen,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import brandLogo from "@/assets/brand-logo.png";

interface FavoriteLesson {
  id: string;
  lesson_id: string;
  lessons: {
    id: string;
    title: string;
    duration_minutes: number | null;
    modules: {
      title: string;
      courses: {
        id: string;
        title: string;
        thumbnail_url: string | null;
      };
    };
  };
}

const StudentFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        id,
        lesson_id,
        lessons (
          id,
          title,
          duration_minutes,
          modules (
            title,
            courses (
              id,
              title,
              thumbnail_url
            )
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setFavorites(data as unknown as FavoriteLesson[]);
    }
    setLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive",
      });
    } else {
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: "Removido dos favoritos",
        description: "A aula foi removida da sua lista.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/student")}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Soberana" className="w-10 h-10 object-contain" />
            <span className="font-serif font-bold text-xl">Aulas Favoritas</span>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Minhas Aulas Favoritas</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'aula salva' : 'aulas salvas'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma aula favorita ainda
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Clique no ícone de coração nas aulas para salvá-las aqui e acessá-las facilmente depois.
            </p>
            <Button onClick={() => navigate("/student")} className="bg-primary hover:bg-primary/90">
              <BookOpen className="w-4 h-4 mr-2" />
              Explorar cursos
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="aspect-video bg-muted relative cursor-pointer"
                  onClick={() => navigate(`/student/lesson/${favorite.lesson_id}`)}
                >
                  {favorite.lessons.modules?.courses?.thumbnail_url ? (
                    <img 
                      src={favorite.lessons.modules.courses.thumbnail_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <PlayCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                    {favorite.lessons.modules?.courses?.title}
                  </p>
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                    {favorite.lessons.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {favorite.lessons.modules?.title}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {favorite.lessons.duration_minutes && (
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {favorite.lessons.duration_minutes} min
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(favorite.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentFavorites;
