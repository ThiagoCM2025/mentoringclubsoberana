import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { type: "like", emoji: "👏", label: "Aplausos" },
  { type: "fire", emoji: "🔥", label: "Incrível" },
  { type: "heart", emoji: "❤️", label: "Amei" },
  { type: "idea", emoji: "💡", label: "Ótima ideia" },
];

interface ReactionCount {
  type: string;
  count: number;
  hasReacted: boolean;
}

interface PostReactionsProps {
  postId: string;
  onReactionChange?: () => void;
}

export const PostReactions = ({ postId, onReactionChange }: PostReactionsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
    
    // Real-time subscription
    const channel = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_reactions',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchReactions = async () => {
    const { data: allReactions } = await supabase
      .from("community_reactions")
      .select("reaction_type, user_id")
      .eq("post_id", postId);

    if (allReactions) {
      const counts = REACTIONS.map(r => ({
        type: r.type,
        count: allReactions.filter(ar => ar.reaction_type === r.type).length,
        hasReacted: user ? allReactions.some(ar => ar.reaction_type === r.type && ar.user_id === user.id) : false
      }));
      setReactions(counts);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user || loading) return;
    setLoading(true);

    const existingReaction = reactions.find(r => r.type === reactionType && r.hasReacted);

    if (existingReaction) {
      // Remove reaction
      await supabase
        .from("community_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType);
    } else {
      // Add reaction
      await supabase
        .from("community_reactions")
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType
        });
    }

    setLoading(false);
    setShowPicker(false);
    onReactionChange?.();
  };

  const activeReactions = reactions.filter(r => r.count > 0);
  const userHasReacted = reactions.some(r => r.hasReacted);

  return (
    <div className="relative flex items-center gap-2">
      {/* Display existing reactions */}
      <div className="flex items-center gap-1">
        {activeReactions.map((reaction) => {
          const reactionInfo = REACTIONS.find(r => r.type === reaction.type);
          return (
            <motion.button
              key={reaction.type}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(reaction.type)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                reaction.hasReacted
                  ? "bg-secondary/20 border border-secondary/40"
                  : "bg-zinc-800 border border-zinc-700 hover:border-secondary/40"
              )}
            >
              <span>{reactionInfo?.emoji}</span>
              <span className="text-cream/80">{reaction.count}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Add reaction button - IMPROVED VISIBILITY */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all",
          "border-2 border-dashed",
          showPicker
            ? "bg-secondary text-secondary-foreground border-secondary"
            : userHasReacted
              ? "bg-secondary/20 text-secondary border-secondary/40 hover:bg-secondary/30"
              : "bg-zinc-800 text-cream border-cream/30 hover:border-secondary hover:text-secondary hover:bg-secondary/10"
        )}
        title="Adicionar reação"
      >
        +
      </motion.button>

      {/* Reaction picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full left-0 mb-2 bg-zinc-800 border border-secondary/30 rounded-full px-2 py-1 shadow-lg flex items-center gap-1"
          >
            {REACTIONS.map((reaction) => {
              const reactionCount = reactions.find(r => r.type === reaction.type);
              return (
                <motion.button
                  key={reaction.type}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(reaction.type)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors",
                    reactionCount?.hasReacted && "bg-secondary/20"
                  )}
                  title={reaction.label}
                >
                  {reaction.emoji}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostReactions;