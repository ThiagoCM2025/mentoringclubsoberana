import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Heart,
  MessageCircle,
  Send,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import CommunityPost from "@/components/student/CommunityPost";

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

const CATEGORIES = [
  { value: "all", label: "Todos" },
  { value: "general", label: "Geral" },
  { value: "duvidas", label: "Dúvidas" },
  { value: "sucesso", label: "Histórias de Sucesso" },
  { value: "dicas", label: "Dicas" },
];

const StudentCommunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, selectedCategory]);

  const fetchPosts = async () => {
    if (!user) return;

    let query = supabase
      .from("community_posts")
      .select("*")
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory);
    }

    const { data: postsData } = await query;

    if (postsData) {
      // Fetch profiles for post authors
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
      );

      // Check which posts the user has liked
      const { data: userLikes } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", user.id);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);

      const postsWithData = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null,
        user_liked: likedPostIds.has(post.id),
      }));

      setPosts(postsWithData as Post[]);
    }

    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;

    setCreating(true);

    const { error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a publicação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Publicação criada! 🎉",
        description: "Sua publicação está visível para a comunidade.",
      });
      setCreateDialogOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("general");
      fetchPosts();
    }

    setCreating(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      await supabase
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("community_likes")
        .insert({
          post_id: postId,
          user_id: user.id,
        });
    }

    // Update local state
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
          user_liked: !isLiked,
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-secondary/20 py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={isotipoGold} alt="Soberana" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]" />
              <div className="flex flex-col leading-tight">
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase">
                  Mentoring
                </span>
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase -mt-0.5">
                  Club
                </span>
                <span className="font-serif font-bold text-secondary text-sm tracking-wider mt-0.5">
                  SOBERANA
                </span>
              </div>
            </div>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nova Publicação</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Publicação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="post-title">Título</Label>
                  <Input
                    id="post-title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Qual é o assunto?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-content">Conteúdo</Label>
                  <Textarea
                    id="post-content"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Compartilhe sua experiência, dúvida ou dica..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="duvidas">Dúvidas</SelectItem>
                      <SelectItem value="sucesso">Histórias de Sucesso</SelectItem>
                      <SelectItem value="dicas">Dicas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={creating || !newPostTitle.trim() || !newPostContent.trim()}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {creating ? "Publicando..." : "Publicar"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container-soberana py-8">
        {/* Header section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-cream">Comunidade Soberana</h1>
            <p className="text-cream/60">
              Conecte-se com outras alunas, tire dúvidas e compartilhe experiências
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-cream/50 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? "bg-secondary text-black"
                  : "bg-zinc-800 text-cream/70 hover:bg-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-cream/40" />
            </div>
            <h3 className="text-xl font-semibold text-cream mb-2">
              Nenhuma publicação ainda
            </h3>
            <p className="text-cream/50 mb-6 max-w-md mx-auto">
              Seja a primeira a compartilhar algo com a comunidade!
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira publicação
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post, index) => (
                <CommunityPost
                  key={post.id}
                  post={post}
                  index={index}
                  onLike={handleLike}
                  onRefresh={fetchPosts}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentCommunity;
