import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Loader2,
  Users,
  Trophy,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MissionComment {
  id: string;
  mission_id: string;
  user_id: string;
  content: string;
  is_delivery: boolean;
  is_approved: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MissionArenaProps {
  missionId: string;
  weekNumber: number;
  userId: string;
  courseId: string;
}

export const MissionArena = ({
  missionId,
  weekNumber,
  userId,
  courseId
}: MissionArenaProps) => {
  const [comments, setComments] = useState<MissionComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // Fetch comments first
        const { data: commentsData, error: commentsError } = await supabase
          .from('mission_comments')
          .select('*')
          .eq('mission_id', missionId)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (commentsError) throw commentsError;

        // Fetch profiles for users who commented
        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map(c => c.user_id))];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', userIds);

          const profilesMap = new Map(
            profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
          );

          const commentsWithProfiles = commentsData.map(comment => ({
            ...comment,
            profile: profilesMap.get(comment.user_id) || null
          }));

          setComments(commentsWithProfiles);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Error fetching mission comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`mission-comments-${missionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_comments',
          filter: `mission_id=eq.${missionId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('mission_comments')
        .insert({
          mission_id: missionId,
          user_id: userId,
          content: newComment.trim(),
          is_delivery: newComment.toLowerCase().includes('missão') && 
                       newComment.toLowerCase().includes('cumprida')
        });

      if (error) throw error;

      setNewComment("");
      toast.success("Comentário publicado!");
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error("Erro ao publicar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const deliveryComments = comments.filter(c => c.is_delivery || c.is_approved);
  const regularComments = comments.filter(c => !c.is_delivery && !c.is_approved);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-zinc-900/50 rounded-2xl border border-secondary/20 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-cream text-sm">
              Arena de Execução
            </h3>
            <p className="text-xs text-cream/50">
              Semana {weekNumber} • {comments.length} comentários
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {deliveryComments.length > 0 && (
            <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
              <Trophy className="w-3 h-3 mr-1" />
              {deliveryComments.length} entregas
            </Badge>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-cream/50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-secondary/10 p-4 space-y-4">
              {/* New Comment Input */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder='Compartilhe seu progresso! Ex: "Missão Semana X Cumprida! 🎯"'
                    className="bg-zinc-800/50 border-secondary/20 text-cream placeholder:text-cream/40 min-h-[80px] resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cream/40">
                    💡 Dica: Inclua "Missão Cumprida" para destacar sua entrega
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="bg-secondary hover:bg-secondary/90 text-black"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-cream/30 mx-auto mb-2" />
                    <p className="text-cream/50 text-sm">
                      Seja a primeira a compartilhar seu progresso!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Deliveries Section */}
                    {deliveryComments.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Entregas Destacadas
                        </p>
                        {deliveryComments.map((comment) => (
                          <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            isHighlighted={true}
                            getInitials={getInitials}
                          />
                        ))}
                      </div>
                    )}

                    {/* Regular Comments */}
                    {regularComments.length > 0 && (
                      <div className="space-y-3">
                        {deliveryComments.length > 0 && (
                          <p className="text-xs font-semibold text-cream/40 uppercase tracking-wider">
                            Discussão
                          </p>
                        )}
                        {regularComments.map((comment) => (
                          <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            isHighlighted={false}
                            getInitials={getInitials}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Comment Item Component
const CommentItem = ({ 
  comment, 
  isHighlighted,
  getInitials 
}: { 
  comment: MissionComment; 
  isHighlighted: boolean;
  getInitials: (name: string | null) => string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-3 rounded-xl transition-colors",
        isHighlighted 
          ? "bg-green-500/10 border border-green-500/20" 
          : "bg-zinc-800/30 hover:bg-zinc-800/50"
      )}
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
          {getInitials(comment.profile?.full_name || null)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-cream text-sm truncate">
            {comment.profile?.full_name || "Aluna"}
          </span>
          {isHighlighted && (
            <Badge variant="outline" className="border-green-500/50 text-green-400 text-[10px] px-1.5 py-0">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
              Entrega
            </Badge>
          )}
          <span className="text-xs text-cream/40">
            {formatDistanceToNow(new Date(comment.created_at), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </span>
        </div>
        <p className="text-cream/80 text-sm whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </motion.div>
  );
};