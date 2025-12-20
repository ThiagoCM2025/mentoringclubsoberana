import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, BarChart3 } from "lucide-react";

interface PollOption {
  text: string;
}

interface PostPollProps {
  postId: string;
  question: string;
  options: PollOption[];
}

interface VoteResult {
  optionIndex: number;
  count: number;
  percentage: number;
}

export const PostPoll = ({ postId, question, options }: PostPollProps) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<number | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchVotes();

    // Real-time subscription
    const channel = supabase
      .channel(`poll-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_poll_votes',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchVotes = async () => {
    // Get all votes for this poll
    const { data: votes } = await supabase
      .from("community_poll_votes")
      .select("option_index, user_id")
      .eq("post_id", postId);

    if (votes) {
      const total = votes.length;
      setTotalVotes(total);

      // Calculate results for each option
      const voteCounts = options.map((_, index) => {
        const count = votes.filter(v => v.option_index === index).length;
        return {
          optionIndex: index,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        };
      });
      setResults(voteCounts);

      // Check if current user voted
      if (user) {
        const userVoteData = votes.find(v => v.user_id === user.id);
        if (userVoteData) {
          setUserVote(userVoteData.option_index);
          setHasVoted(true);
        }
      }
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!user || loading || hasVoted) return;
    setLoading(true);

    const { error } = await supabase
      .from("community_poll_votes")
      .insert({
        post_id: postId,
        user_id: user.id,
        option_index: optionIndex
      });

    if (!error) {
      setUserVote(optionIndex);
      setHasVoted(true);
    }

    setLoading(false);
  };

  return (
    <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-secondary/20">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-secondary" />
        <h4 className="font-medium text-cream">{question}</h4>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const result = results.find(r => r.optionIndex === index);
          const isSelected = userVote === index;

          return (
            <motion.button
              key={index}
              whileHover={!hasVoted ? { scale: 1.01 } : {}}
              whileTap={!hasVoted ? { scale: 0.99 } : {}}
              onClick={() => handleVote(index)}
              disabled={hasVoted || loading}
              className={cn(
                "relative w-full text-left px-4 py-3 rounded-lg border transition-all overflow-hidden",
                hasVoted
                  ? isSelected
                    ? "border-secondary bg-secondary/10"
                    : "border-zinc-700 bg-zinc-800/30"
                  : "border-zinc-700 hover:border-secondary/50 cursor-pointer"
              )}
            >
              {/* Progress bar background */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result?.percentage || 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-lg",
                    isSelected ? "bg-secondary/20" : "bg-zinc-700/50"
                  )}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Check className="w-4 h-4 text-secondary" />
                  )}
                  <span className={cn(
                    "text-sm",
                    isSelected ? "text-cream font-medium" : "text-cream/80"
                  )}>
                    {option.text}
                  </span>
                </div>

                {hasVoted && (
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-secondary" : "text-cream/60"
                  )}>
                    {result?.percentage || 0}%
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-cream/50 mt-3 text-center">
        {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
      </p>
    </div>
  );
};

export default PostPoll;