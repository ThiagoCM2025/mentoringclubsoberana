import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CommentReactionsProps {
  commentId: string;
}

interface ReactionCount {
  [key: string]: number;
}

const REACTIONS = [
  { type: "clap", emoji: "👏", label: "Aplausos" },
  { type: "heart", emoji: "❤️", label: "Amei" },
  { type: "laugh", emoji: "😂", label: "Haha" },
];

const CommentReactions = ({ commentId }: CommentReactionsProps) => {
  const { user } = useAuth();
  const [reactionCounts, setReactionCounts] = useState<ReactionCount>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [commentId, user]);

  const fetchReactions = async () => {
    if (!commentId) return;

    // Fetch all reactions for this comment
    const { data: reactions } = await supabase
      .from("comment_reactions")
      .select("reaction_type, user_id")
      .eq("comment_id", commentId);

    if (reactions) {
      // Count reactions by type
      const counts: ReactionCount = {};
      const userReacts: string[] = [];

      reactions.forEach((r) => {
        counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        if (user && r.user_id === user.id) {
          userReacts.push(r.reaction_type);
        }
      });

      setReactionCounts(counts);
      setUserReactions(userReacts);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user || loading) return;

    setLoading(true);

    const hasReacted = userReactions.includes(reactionType);

    if (hasReacted) {
      // Remove reaction
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType);

      setUserReactions((prev) => prev.filter((r) => r !== reactionType));
      setReactionCounts((prev) => ({
        ...prev,
        [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1),
      }));
    } else {
      // Add reaction
      await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType,
      });

      setUserReactions((prev) => [...prev, reactionType]);
      setReactionCounts((prev) => ({
        ...prev,
        [reactionType]: (prev[reactionType] || 0) + 1,
      }));
    }

    setLoading(false);
  };

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map((reaction) => {
        const count = reactionCounts[reaction.type] || 0;
        const isActive = userReactions.includes(reaction.type);

        return (
          <motion.button
            key={reaction.type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReaction(reaction.type)}
            disabled={loading}
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all",
              isActive
                ? "bg-secondary/20 text-secondary"
                : "hover:bg-secondary/10 text-cream/50 hover:text-cream/70"
            )}
            title={reaction.label}
          >
            <span className="text-sm">{reaction.emoji}</span>
            {count > 0 && (
              <span className={cn("font-medium", isActive && "text-secondary")}>
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CommentReactions;
