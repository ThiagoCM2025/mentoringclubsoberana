import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Pin,
  PinOff,
  Star,
  StarOff,
  EyeOff,
  Eye,
  Trash2,
  MessageCircle,
  Heart,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  is_hidden?: boolean;
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
  moderated_at: string | null;
  moderated_by: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  comments?: Comment[];
  actualCommentsCount?: number;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "Geral", color: "bg-muted text-muted-foreground" },
  duvidas: { label: "Dúvidas", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  sucesso: { label: "Histórias de Sucesso", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  dicas: { label: "Dicas", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
};

const AdminCommunity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchTotalComments();
  }, []);

  const fetchTotalComments = async () => {
    const { count } = await supabase
      .from("community_comments")
      .select("*", { count: "exact", head: true });
    setTotalComments(count || 0);
  };

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsData) {
      // Fetch profiles
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
      );

      // Fetch actual comment counts for all posts
      const postIds = postsData.map(p => p.id);
      const { data: commentCounts } = await supabase
        .from("community_comments")
        .select("post_id")
        .in("post_id", postIds);

      const commentCountMap = new Map<string, number>();
      commentCounts?.forEach(c => {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      });

      const postsWithData = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null,
        actualCommentsCount: commentCountMap.get(post.id) || 0,
      }));

      setPosts(postsWithData as Post[]);
    }

    setLoading(false);
  };

  const fetchCommentsForPost = async (postId: string): Promise<Comment[]> => {
    const { data: commentsData } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!commentsData) return [];

    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    const profilesMap = new Map(
      profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
    );

    return commentsData.map(comment => ({
      ...comment,
      profiles: profilesMap.get(comment.user_id) || null,
    }));
  };

  const togglePostExpanded = async (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // Fetch comments if not already loaded
      const post = posts.find(p => p.id === postId);
      if (post && !post.comments) {
        const comments = await fetchCommentsForPost(postId);
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, comments } : p
        ));
      }
    }
    setExpandedPosts(newExpanded);
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Excluído",
        description: "Comentário removido.",
      });
      // Refresh comments for this post
      const comments = await fetchCommentsForPost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments, actualCommentsCount: comments.length } : p
      ));
      fetchTotalComments();
    }
  };

  const handleModeration = async (
    postId: string, 
    action: "pin" | "unpin" | "highlight" | "unhighlight" | "hide" | "unhide"
  ) => {
    const updates: Record<string, unknown> = {
      moderated_at: new Date().toISOString(),
      moderated_by: user?.id,
    };

    switch (action) {
      case "pin":
        updates.is_pinned = true;
        break;
      case "unpin":
        updates.is_pinned = false;
        break;
      case "highlight":
        updates.is_highlighted = true;
        break;
      case "unhighlight":
        updates.is_highlighted = false;
        break;
      case "hide":
        updates.is_hidden = true;
        break;
      case "unhide":
        updates.is_hidden = false;
        break;
    }

    const { error } = await supabase
      .from("community_posts")
      .update(updates)
      .eq("id", postId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a publicação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Publicação atualizada.",
      });
      fetchPosts();
    }
  };

  const handleDelete = async (postId: string) => {
    // First delete related comments and likes
    await supabase.from("community_comments").delete().eq("post_id", postId);
    await supabase.from("community_likes").delete().eq("post_id", postId);

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a publicação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Excluído",
        description: "Publicação removida permanentemente.",
      });
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter(post => {
    switch (activeTab) {
      case "pinned":
        return post.is_pinned;
      case "highlighted":
        return post.is_highlighted;
      case "hidden":
        return post.is_hidden;
      default:
        return true;
    }
  });

  const renderPost = (post: Post) => {
    const authorName = post.profiles?.full_name || "Aluna";
    const authorInitials = authorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const categoryInfo = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.general;

    return (
      <div 
        key={post.id} 
        className={cn(
          "bg-card rounded-xl border border-border p-5",
          post.is_hidden && "opacity-60 border-destructive/50",
          post.is_pinned && "border-secondary",
          post.is_highlighted && "border-green-500"
        )}
      >
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.is_pinned && (
            <Badge className="bg-secondary text-secondary-foreground">
              <Pin className="w-3 h-3 mr-1" /> Fixado
            </Badge>
          )}
          {post.is_highlighted && (
            <Badge className="bg-green-500 text-white">
              <Star className="w-3 h-3 mr-1" /> Destacado
            </Badge>
          )}
          {post.is_hidden && (
            <Badge variant="destructive">
              <EyeOff className="w-3 h-3 mr-1" /> Oculto
            </Badge>
          )}
        </div>

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
        <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">{post.content}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> {post.actualCommentsCount ?? post.comments_count}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {post.is_pinned ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleModeration(post.id, "unpin")}
            >
              <PinOff className="w-4 h-4 mr-2" /> Desafixar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleModeration(post.id, "pin")}
            >
              <Pin className="w-4 h-4 mr-2" /> Fixar
            </Button>
          )}

          {post.is_highlighted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleModeration(post.id, "unhighlight")}
            >
              <StarOff className="w-4 h-4 mr-2" /> Remover destaque
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleModeration(post.id, "highlight")}
            >
              <Star className="w-4 h-4 mr-2" /> Destacar
            </Button>
          )}

          {post.is_hidden ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleModeration(post.id, "unhide")}
            >
              <Eye className="w-4 h-4 mr-2" /> Restaurar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleModeration(post.id, "hide")}
            >
              <EyeOff className="w-4 h-4 mr-2" /> Ocultar
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A publicação e todos os comentários serão removidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(post.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Excluir permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Comments Section */}
        {(post.actualCommentsCount ?? post.comments_count) > 0 && (
          <Collapsible 
            open={expandedPosts.has(post.id)} 
            onOpenChange={() => togglePostExpanded(post.id)}
            className="mt-4 pt-4 border-t border-border"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Ver {post.actualCommentsCount ?? post.comments_count} comentário(s)
                </span>
                {expandedPosts.has(post.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {post.comments?.map((comment) => {
                const commentAuthor = comment.profiles?.full_name || "Aluna";
                const commentInitials = commentAuthor.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                
                return (
                  <div key={comment.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                        {commentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">{commentAuthor}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(comment.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
              {!post.comments && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin w-5 h-5 border-2 border-secondary border-t-transparent rounded-full" />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 admin-area">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Moderação da Comunidade
            </h1>
            <p className="text-muted-foreground">
              Gerencie publicações, fixe conteúdos e destaque histórias de sucesso
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-foreground">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Total de posts</p>
          </div>
          <div className="bg-card border border-blue-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-500">{totalComments}</p>
            <p className="text-sm text-muted-foreground">Total de comentários</p>
          </div>
          <div className="bg-card border border-secondary/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-secondary">{posts.filter(p => p.is_pinned).length}</p>
            <p className="text-sm text-muted-foreground">Fixados</p>
          </div>
          <div className="bg-card border border-emerald-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-500">{posts.filter(p => p.is_highlighted).length}</p>
            <p className="text-sm text-muted-foreground">Destacados</p>
          </div>
          <div className="bg-card border border-red-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-500">{posts.filter(p => p.is_hidden).length}</p>
            <p className="text-sm text-muted-foreground">Ocultos</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pinned">Fixados</TabsTrigger>
            <TabsTrigger value="highlighted">Destacados</TabsTrigger>
            <TabsTrigger value="hidden">Ocultos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma publicação nesta categoria.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPosts.map(renderPost)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunity;
