import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Search,
  Tag,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  tags: string[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  reading_time_minutes: number;
  is_published: boolean;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const defaultPost: BlogPost = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: null,
  category_id: null,
  tags: [],
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  reading_time_minutes: 5,
  is_published: false,
  is_featured: false,
};

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [post, setPost] = useState<BlogPost>(defaultPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (!isNew && id) {
      fetchPost();
    }
  }, [id, isNew]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast.error("Artigo não encontrado");
      navigate("/admin/blog");
      return;
    }

    setPost({
      ...data,
      tags: data.tags || [],
      meta_title: data.meta_title || "",
      meta_description: data.meta_description || "",
      meta_keywords: data.meta_keywords || "",
    });
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");

    if (data) {
      setCategories(data);
    }
  };

  const handleSave = async () => {
    if (!post.title || !post.content) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    setSaving(true);

    const slug = post.slug || post.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const postData = {
      ...post,
      slug,
      published_at: post.is_published ? new Date().toISOString() : null,
    };

    let result;
    if (isNew) {
      result = await supabase.from("blog_posts").insert(postData).select().single();
    } else {
      result = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", id)
        .select()
        .single();
    }

    if (result.error) {
      toast.error("Erro ao salvar artigo");
      console.error(result.error);
    } else {
      toast.success("Artigo salvo com sucesso");
      if (isNew) {
        navigate(`/admin/blog/${result.data.id}`);
      }
    }

    setSaving(false);
  };

  const generateContent = async () => {
    if (!post.title) {
      toast.error("Insira um título para gerar conteúdo");
      return;
    }

    setGenerating("content");
    toast.info("Gerando conteúdo com IA...");

    try {
      const { data, error } = await supabase.functions.invoke("blog-generate-content", {
        body: {
          topic: post.title,
          tone: "profissional e inspirador",
          keywords: post.tags.length > 0 ? post.tags : ["marketing jurídico", "advogada"],
        },
      });

      if (error) throw error;

      setPost((prev) => ({
        ...prev,
        title: data.title || prev.title,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        tags: data.tags || prev.tags,
        meta_title: data.meta_title || prev.meta_title,
        meta_description: data.meta_description || prev.meta_description,
        meta_keywords: data.meta_keywords || prev.meta_keywords,
        reading_time_minutes: data.reading_time_minutes || prev.reading_time_minutes,
      }));

      toast.success("Conteúdo gerado com sucesso!");
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast.error(error.message || "Erro ao gerar conteúdo");
    }

    setGenerating(null);
  };

  const generateCover = async () => {
    if (!post.title) {
      toast.error("Insira um título para gerar a capa");
      return;
    }

    setGenerating("cover");
    toast.info("Gerando capa com IA...");

    try {
      const { data, error } = await supabase.functions.invoke("blog-generate-cover", {
        body: {
          title: post.title,
          theme: "professional legal, business woman, success",
        },
      });

      if (error) throw error;

      if (data.cover_url) {
        setPost((prev) => ({
          ...prev,
          cover_image_url: data.cover_url,
        }));
        toast.success("Capa gerada com sucesso!");
      } else {
        toast.info("Capa não disponível no momento");
      }
    } catch (error: any) {
      console.error("Error generating cover:", error);
      toast.error(error.message || "Erro ao gerar capa");
    }

    setGenerating(null);
  };

  const optimizeSEO = async () => {
    if (!post.title || !post.content) {
      toast.error("Preencha título e conteúdo para otimizar SEO");
      return;
    }

    setGenerating("seo");
    toast.info("Otimizando SEO com IA...");

    try {
      const { data, error } = await supabase.functions.invoke("blog-optimize-seo", {
        body: {
          title: post.title,
          content: post.content,
          currentSeo: {
            meta_title: post.meta_title,
            meta_description: post.meta_description,
          },
        },
      });

      if (error) throw error;

      setPost((prev) => ({
        ...prev,
        slug: data.slug || prev.slug,
        meta_title: data.meta_title || prev.meta_title,
        meta_description: data.meta_description || prev.meta_description,
        meta_keywords: data.meta_keywords || prev.meta_keywords,
      }));

      setSeoScore(data.score || null);
      setSeoSuggestions(data.suggestions || []);

      toast.success("SEO otimizado!");
    } catch (error: any) {
      console.error("Error optimizing SEO:", error);
      toast.error(error.message || "Erro ao otimizar SEO");
    }

    setGenerating(null);
  };

  const analyzeTags = async () => {
    if (!post.content) {
      toast.error("Adicione conteúdo para analisar tags");
      return;
    }

    setGenerating("tags");
    toast.info("Analisando tags com IA...");

    try {
      const { data, error } = await supabase.functions.invoke("blog-analyze-tags", {
        body: {
          title: post.title,
          content: post.content,
          existingTags: post.tags,
        },
      });

      if (error) throw error;

      if (data.suggested_tags) {
        setPost((prev) => ({
          ...prev,
          tags: [...new Set([...prev.tags, ...data.suggested_tags])],
        }));
        toast.success("Tags sugeridas adicionadas!");
      }
    } catch (error: any) {
      console.error("Error analyzing tags:", error);
      toast.error(error.message || "Erro ao analisar tags");
    }

    setGenerating(null);
  };

  const addTag = () => {
    if (tagInput && !post.tags.includes(tagInput)) {
      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.toLowerCase()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/blog")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold">
                {isNew ? "Novo Artigo" : "Editar Artigo"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Use IA para criar conteúdo otimizado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={post.is_published}
                onCheckedChange={(checked) =>
                  setPost((prev) => ({ ...prev, is_published: checked }))
                }
              />
              <Label>Publicar</Label>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>

        {/* Editor Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Título</Label>
                  <div className="flex gap-2">
                    <Input
                      value={post.title}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Título do artigo..."
                      className="text-lg font-medium"
                    />
                    <Button
                      variant="outline"
                      onClick={generateContent}
                      disabled={generating === "content"}
                    >
                      {generating === "content" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label>Resumo / Excerpt</Label>
                  <Textarea
                    value={post.excerpt}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    placeholder="Breve resumo do artigo..."
                    rows={2}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={post.content}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Escreva o conteúdo do artigo... (suporta markdown: ## para H2, ### para H3, - para listas)"
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Imagem de Capa</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateCover}
                        disabled={generating === "cover"}
                      >
                        {generating === "cover" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1" />
                            Gerar
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt="Cover"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <Input
                      value={post.cover_image_url || ""}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          cover_image_url: e.target.value,
                        }))
                      }
                      placeholder="URL da imagem..."
                      className="mt-3"
                    />
                  </CardContent>
                </Card>

                {/* Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={post.category_id || ""}
                      onValueChange={(value) =>
                        setPost((prev) => ({ ...prev, category_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Tags</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={analyzeTags}
                        disabled={generating === "tags"}
                      >
                        {generating === "tags" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Tag className="w-4 h-4 mr-1" />
                            Sugerir
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Nova tag..."
                        onKeyDown={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button variant="outline" size="sm" onClick={addTag}>
                        +
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Otimização SEO</span>
                  <Button
                    variant="outline"
                    onClick={optimizeSEO}
                    disabled={generating === "seo"}
                  >
                    {generating === "seo" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Otimizar com IA
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {seoScore !== null && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        seoScore >= 80
                          ? "bg-green-100 text-green-700"
                          : seoScore >= 60
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {seoScore}
                    </div>
                    <div>
                      <p className="font-medium">Score SEO</p>
                      <p className="text-sm text-muted-foreground">
                        {seoScore >= 80
                          ? "Excelente otimização"
                          : seoScore >= 60
                          ? "Boa otimização, pode melhorar"
                          : "Precisa de melhorias"}
                      </p>
                    </div>
                  </div>
                )}

                {seoSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sugestões de melhoria</Label>
                    <ul className="space-y-2">
                      {seoSuggestions.map((suggestion, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Meta Title (max 60 chars)</Label>
                    <Input
                      value={post.meta_title}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          meta_title: e.target.value,
                        }))
                      }
                      placeholder="Título para SEO..."
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {post.meta_title.length}/60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Slug / URL</Label>
                    <Input
                      value={post.slug}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="url-do-artigo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Meta Description (max 160 chars)</Label>
                  <Textarea
                    value={post.meta_description}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        meta_description: e.target.value,
                      }))
                    }
                    placeholder="Descrição para resultados do Google..."
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {post.meta_description.length}/160 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Keywords</Label>
                  <Input
                    value={post.meta_keywords}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        meta_keywords: e.target.value,
                      }))
                    }
                    placeholder="palavra-chave1, palavra-chave2, ..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Artigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Artigo em Destaque</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir em posição de destaque no blog
                    </p>
                  </div>
                  <Switch
                    checked={post.is_featured}
                    onCheckedChange={(checked) =>
                      setPost((prev) => ({ ...prev, is_featured: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tempo de Leitura (minutos)</Label>
                  <Input
                    type="number"
                    value={post.reading_time_minutes}
                    onChange={(e) =>
                      setPost((prev) => ({
                        ...prev,
                        reading_time_minutes: parseInt(e.target.value) || 5,
                      }))
                    }
                    min={1}
                    max={60}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default BlogEditor;
