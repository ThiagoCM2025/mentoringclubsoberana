import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Send,
  ChevronDown,
  ChevronUp,
  Pin,
  Star,
  Image as ImageIcon,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import PostReactions from "./PostReactions";
import PostPoll from "./PostPoll";
import MentionAutocomplete from "./MentionAutocomplete";
import CommentReactions from "./CommentReactions";

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

interface PollOption {
  text: string;
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
  image_url: string | null;
  poll_question: string | null;
  poll_options: PollOption[] | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  user_liked?: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "Geral", color: "bg-zinc-700 text-cream/80" },
  duvidas: { label: "Dúvidas", color: "bg-blue-900/50 text-blue-300" },
  sucesso: { label: "Histórias de Sucesso", color: "bg-green-900/50 text-green-300" },
  dicas: { label: "Dicas", color: "bg-amber-900/50 text-amber-300" },
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
  const [mentionedUsers, setMentionedUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const authorName = post.profiles?.full_name || "Aluna";
  const authorInitials = authorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const categoryInfo = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.general;

  const handleMention = (userId: string, userName: string) => {
    setMentionedUsers(prev => {
      if (!prev.some(m => m.userId === userId)) {
        return [...prev, { userId, userName }];
      }
      return prev;
    });
  };

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

    const { data: commentData, error } = await supabase
      .from("community_comments")
      .insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
    } else {
      // Create mentions for comment
      if (mentionedUsers.length > 0 && commentData) {
        await supabase.from("community_mentions").insert(
          mentionedUsers.map(m => ({
            comment_id: commentData.id,
            post_id: post.id,
            mentioned_user_id: m.userId,
            mentioner_user_id: user.id,
          }))
        );
      }

      setNewComment("");
      setMentionedUsers([]);
      
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

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    const { error } = await supabase
      .from("community_comments")
      .update({ content: editingContent.trim() })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível editar o comentário.",
        variant: "destructive",
      });
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: editingContent.trim() } : c
        )
      );
      setEditingCommentId(null);
      setEditingContent("");
      toast({
        title: "Comentário editado",
        description: "Seu comentário foi atualizado.",
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentToDelete);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
      onRefresh();
      toast({
        title: "Comentário excluído",
        description: "O comentário foi removido.",
      });
    }
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const confirmDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  // Render content with mentions highlighted
  const renderContent = (text: string) => {
    const mentionRegex = /@(\w+(?:\s\w+)?)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} className="text-secondary font-medium">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-zinc-900 rounded-xl border border-secondary/20 p-5 shadow-sm",
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
          <AvatarFallback className="bg-secondary/20 text-secondary">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-cream">{authorName}</span>
            <span className="text-cream/50 text-sm">•</span>
            <span className="text-cream/50 text-sm">
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
      <h3 className="font-semibold text-lg text-cream mb-2">{post.title}</h3>
      <p className="text-cream/80 whitespace-pre-wrap">{renderContent(post.content)}</p>

      {/* Post Image */}
      {post.image_url && (
        <motion.div 
          className="mt-4 rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
        >
          <img
            src={post.image_url}
            alt="Imagem do post"
            className="w-full max-h-96 object-cover rounded-lg"
            onLoad={() => setImageLoaded(true)}
          />
        </motion.div>
      )}

      {/* Poll */}
      {post.poll_question && post.poll_options && (
        <PostPoll
          postId={post.id}
          question={post.poll_question}
          options={post.poll_options}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-secondary/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id, post.user_liked || false)}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              post.user_liked 
                ? "text-red-500" 
                : "text-cream/60 hover:text-red-500"
            )}
          >
            <Heart className={cn("w-5 h-5", post.user_liked && "fill-current")} />
            <span>{post.likes_count}</span>
          </button>

          <button
            onClick={fetchComments}
            className="flex items-center gap-2 text-sm text-cream/60 hover:text-cream transition-colors"
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

        {/* Reactions */}
        <PostReactions postId={post.id} onReactionChange={onRefresh} />
      </div>

      {/* Comments Section - REDESIGNED */}
      {showComments && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-secondary/20"
        >
          {/* Comments Header */}
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-secondary" />
            <h4 className="text-sm font-medium text-cream">
              Comentários ({comments.length})
            </h4>
          </div>

          {loadingComments ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin w-5 h-5 border-2 border-secondary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <MessageCircle className="w-8 h-8 text-cream/20 mb-2" />
                  <p className="text-sm text-cream/50">
                    Nenhum comentário ainda. Seja a primeira!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {comments.map((comment, commentIndex) => {
                    const commentAuthor = comment.profiles?.full_name || "Aluna";
                    const commentInitials = commentAuthor.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    const isOwnComment = user?.id === comment.user_id;
                    const isEditing = editingCommentId === comment.id;
                    
                    return (
                      <motion.div 
                        key={comment.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: commentIndex * 0.05 }}
                        className="flex gap-3 group"
                      >
                        <Avatar className="w-8 h-8 ring-2 ring-secondary/10 flex-shrink-0">
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-zinc-800 text-cream/70 text-xs">
                            {commentInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gradient-to-br from-zinc-800 to-zinc-800/50 rounded-xl p-3 border border-secondary/10">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-cream">
                                {commentAuthor}
                              </span>
                              <span className="text-xs text-cream/40">
                                {formatDistanceToNow(new Date(comment.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            </div>
                            {isOwnComment && !isEditing && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary/10 transition-all">
                                    <MoreVertical className="w-4 h-4 text-cream/50" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-secondary/20">
                                  <DropdownMenuItem 
                                    onClick={() => startEditComment(comment)}
                                    className="text-cream hover:bg-secondary/10 cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => confirmDeleteComment(comment.id)}
                                    className="text-red-400 hover:bg-red-400/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="bg-zinc-700/50 border-secondary/20 text-cream text-sm resize-none"
                                rows={2}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditComment}
                                  className="text-cream/60 hover:text-cream h-7 px-2"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={!editingContent.trim()}
                                  className="bg-secondary hover:bg-secondary/90 h-7 px-2"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-cream/80 leading-relaxed">{renderContent(comment.content)}</p>
                          )}
                          
                          {/* Comment Reactions */}
                          {!isEditing && (
                            <div className="mt-2 pt-2 border-t border-secondary/5">
                              <CommentReactions commentId={comment.id} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* New Comment Input - REDESIGNED */}
              <div className="rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-800/40 border border-secondary/20 overflow-hidden focus-within:border-secondary/40 focus-within:shadow-[0_0_15px_rgba(198,161,97,0.1)] transition-all duration-300">
                <MentionAutocomplete
                  value={newComment}
                  onChange={setNewComment}
                  onMention={handleMention}
                  placeholder="Escreva um comentário..."
                  className="border-0 bg-transparent text-cream focus:ring-0 focus-visible:ring-0 resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-secondary/10 bg-zinc-900/30">
                  <div className="flex items-center gap-1.5 text-xs text-cream/40">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-secondary/20 text-secondary font-medium">@</span>
                    <span>para mencionar</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1.5 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {submittingComment ? (
                      <div className="animate-spin w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mentioned Users Indicator */}
              {mentionedUsers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2 text-xs text-secondary"
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary/20">
                    <span className="text-[10px]">@</span>
                  </span>
                  <span>Mencionando: {mentionedUsers.map(m => m.userName).join(", ")}</span>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-secondary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cream">Excluir comentário?</AlertDialogTitle>
            <AlertDialogDescription className="text-cream/60">
              Esta ação não pode ser desfeita. O comentário será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-cream hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default CommunityPost;