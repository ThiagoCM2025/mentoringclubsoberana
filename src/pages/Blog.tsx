import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  tags: string[];
  reading_time_minutes: number;
  published_at: string;
  category_id: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, tags, reading_time_minutes, published_at, category_id")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setCategories(data);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <>
      <SEO
        title="Blog | Soberana Mentoring Club - Marketing Jurídico Digital"
        description="Artigos e insights sobre marketing jurídico digital, captação de clientes para advogadas, e estratégias para crescer na advocacia."
        keywords="blog marketing jurídico, artigos para advogadas, captação de clientes advocacia, marketing digital advocacia"
        url="https://soberana.com.br/blog"
        type="website"
      />

      <Navbar />

      <main className="min-h-screen bg-background pt-24">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Blog <span className="text-secondary">Soberana</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Insights, estratégias e conhecimento para advogadas que querem
                crescer com marketing jurídico digital.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border/50 focus:border-secondary"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-y border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor:
                      selectedCategory === category.id ? category.color : undefined,
                    borderColor: category.color,
                  }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Nenhum artigo encontrado.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => {
                  const category = getCategoryName(post.category_id);
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group"
                    >
                      <Link to={`/blog/${post.slug}`} className="block">
                        <div className="relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/5">
                          {/* Cover Image */}
                          <div className="aspect-video bg-muted overflow-hidden">
                            {post.cover_image_url ? (
                              <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                                <span className="font-serif text-4xl text-secondary/50">S</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            {/* Category */}
                            {category && (
                              <Badge
                                variant="outline"
                                className="mb-3 text-xs"
                                style={{ borderColor: category.color, color: category.color }}
                              >
                                {category.name}
                              </Badge>
                            )}

                            {/* Title */}
                            <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-3">
                              {post.title}
                            </h2>

                            {/* Excerpt */}
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                              {post.excerpt}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(post.published_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {post.reading_time_minutes} min
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs text-muted-foreground flex items-center gap-1"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-secondary/5 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Quer acelerar seus resultados?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Conheça nossos programas de mentoria e transforme sua carreira jurídica
              com estratégias comprovadas.
            </p>
            <Link
              to="/#programas"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-medium hover:bg-secondary/90 transition-colors"
            >
              Conhecer Programas
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
