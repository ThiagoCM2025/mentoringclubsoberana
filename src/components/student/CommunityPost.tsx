import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Send,
  ChevronDown,
  ChevronUp,
  Pin,
  Star
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_pinned: boolean;
  is_highlighted: boolean;
  is_hidden: boolean;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  user_liked?: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "Geral", color: "bg-muted text-muted-foreground" },
  duvidas: { label: "Dúvidas", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  sucesso: { label: "Histórias de Sucesso", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  dicas: { label: "Dicas", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
};

interface CommunityPostProps {
  post: Post;
  index: number;
  onLike: (postId: string, isLiked: boolean) => void;
  onRefresh: () => void;
}

const CommunityPost = ({ post, index, onLike, onRefresh }: CommunityPostProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const authorName = post.profiles?.full_name || "Aluna";
  const authorInitials = authorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const categoryInfo = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.general;

  const fetchComments = async () => {
    if (!showComments) {
      setShowComments(true);
      setLoadingComments(true);

      const { data: commentsData } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (commentsData) {
        // Fetch profiles for comment authors
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
        );

        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id) || null,
        }));

        setComments(commentsWithProfiles as Comment[]);
      }
      setLoadingComments(false);
    } else {
      setShowComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);

    const { error } = await supabase
      .from("community_comments")
      .insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      // Refresh comments
      const { data: commentsData } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (commentsData) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
        );

        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id) || null,
        }));

        setComments(commentsWithProfiles as Comment[]);
      }
      onRefresh();
    }

    setSubmittingComment(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-xl border border-border p-5 shadow-sm",
        post.is_pinned && "border-secondary",
        post.is_highlighted && "border-green-500 bg-green-500/5"
      )}
    >
      {/* Status Badges */}
      {(post.is_pinned || post.is_highlighted) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.is_pinned && (
            <Badge className="bg-secondary text-secondary-foreground text-xs">
              <Pin className="w-3 h-3 mr-1" /> Fixado
            </Badge>
          )}
          {post.is_highlighted && (
            <Badge className="bg-green-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1" /> História de Sucesso
            </Badge>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">{authorName}</span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(post.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
          <Badge variant="secondary" className={cn("mt-1 text-xs", categoryInfo.color)}>
            {categoryInfo.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-lg text-foreground mb-2">{post.title}</h3>
      <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <button
          onClick={() => onLike(post.id, post.user_liked || false)}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            post.user_liked 
              ? "text-red-500" 
              : "text-muted-foreground hover:text-red-500"
          )}
        >
          <Heart className={cn("w-5 h-5", post.user_liked && "fill-current")} />
          <span>{post.likes_count}</span>
        </button>

        <button
          onClick={fetchComments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count}</span>
          {showComments ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {loadingComments ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nenhum comentário ainda. Seja o primeiro!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const commentAuthor = comment.profiles?.full_name || "Aluna";
                    const commentInitials = commentAuthor.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {commentInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {commentAuthor}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New Comment Input */}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="min-h-[80px] resize-none"
                />
                <Button
                  size="icon"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="bg-secondary hover:bg-secondary/90 self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CommunityPost;
