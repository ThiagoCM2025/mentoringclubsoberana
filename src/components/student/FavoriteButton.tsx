import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  lessonId: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  showText?: boolean;
}

const FavoriteButton = ({ 
  lessonId, 
  className,
  variant = "ghost",
  showText = false 
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && lessonId) {
      checkFavorite();
    }
  }, [user, lessonId]);

  const checkFavorite = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user || loading) return;

    setLoading(true);

    if (isFavorite) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);

      if (!error) {
        setIsFavorite(false);
        toast({
          title: "Removido dos favoritos",
          description: "A aula foi removida da sua lista.",
        });
      }
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
        });

      if (!error) {
        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos ❤️",
          description: "Acesse suas aulas favoritas a qualquer momento.",
        });
      }
    }

    setLoading(false);
  };

  return (
    <Button
      variant={variant}
      size={showText ? "sm" : "icon"}
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        isFavorite 
          ? "text-red-500 hover:text-red-600" 
          : "text-muted-foreground hover:text-red-500",
        className
      )}
    >
      <Heart 
        className={cn(
          "w-5 h-5",
          isFavorite && "fill-current"
        )} 
      />
      {showText && (
        <span className="ml-2">
          {isFavorite ? "Favoritada" : "Favoritar"}
        </span>
      )}
    </Button>
  );
};

export default FavoriteButton;
