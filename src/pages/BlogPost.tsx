import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Linkedin, Twitter, Facebook, Tag, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getBlogCoverImage } from "@/lib/blogCoverImages";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  reading_time_minutes: number;
  published_at: string;
  updated_at: string;
  category_id: string | null;
  view_count: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  reading_time_minutes: number;
  published_at: string;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setPost(data);
    
    // Track view
    await supabase
      .from("blog_posts")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id);

    // Track analytics
    await supabase.from("blog_analytics").insert({
      post_id: data.id,
      visitor_id: `visitor-${Date.now()}`,
      device_type: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
      referrer: document.referrer || null,
    });

    // Fetch category
    if (data.category_id) {
      const { data: categoryData } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("id", data.category_id)
        .maybeSingle();
      
      if (categoryData) {
        setCategory(categoryData);
      }
    }

    // Fetch related posts
    const { data: related } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, reading_time_minutes, published_at")
      .eq("is_published", true)
      .neq("id", data.id)
      .limit(3);

    if (related) {
      setRelatedPosts(related);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const sharePost = async (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || "";

    if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
      } catch {
        toast.error("Não foi possível copiar o link");
      }
    }
  };

  const renderInlineFormatting = (text: string) => {
    // Handle inline bold and italic
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === "ol") {
          elements.push(
            <ol key={`list-${elements.length}`} className="my-6 ml-6 space-y-3 list-decimal marker:text-secondary marker:font-semibold">
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${elements.length}`} className="my-6 ml-6 space-y-3">
              {listItems}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      // Heading 2
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={i} className="text-2xl md:text-3xl font-serif font-semibold mt-12 mb-6 pb-4 border-b-2 border-secondary/30 text-foreground">
            {line.replace("## ", "")}
          </h2>
        );
        return;
      }

      // Heading 3
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={i} className="text-xl md:text-2xl font-serif font-semibold mt-10 mb-4 text-foreground flex items-center gap-3">
            <span className="w-1 h-6 bg-secondary rounded-full" />
            {line.replace("### ", "")}
          </h3>
        );
        return;
      }

      // Heading 4
      if (line.startsWith("#### ")) {
        flushList();
        elements.push(
          <h4 key={i} className="text-lg font-semibold mt-8 mb-3 text-foreground">
            {line.replace("#### ", "")}
          </h4>
        );
        return;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={i} className="my-8 pl-6 py-4 border-l-4 border-secondary bg-secondary/5 rounded-r-lg italic text-lg text-muted-foreground">
            {renderInlineFormatting(line.replace("> ", ""))}
          </blockquote>
        );
        return;
      }

      // Ordered list
      const orderedMatch = line.match(/^(\d+)\.\s(.+)/);
      if (orderedMatch) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        listItems.push(
          <li key={i} className="text-lg leading-relaxed text-muted-foreground pl-2">
            {renderInlineFormatting(orderedMatch[2])}
          </li>
        );
        return;
      }

      // Unordered list
      if (line.startsWith("- ")) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        listItems.push(
          <li key={i} className="text-lg leading-relaxed text-muted-foreground pl-2 flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-secondary mt-2.5 flex-shrink-0" />
            <span>{renderInlineFormatting(line.replace("- ", ""))}</span>
          </li>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === "---") {
        flushList();
        elements.push(
          <hr key={i} className="my-10 border-t border-border/50" />
        );
        return;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={i} className="text-lg leading-relaxed text-muted-foreground mb-6">
          {renderInlineFormatting(line)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-2/3 mb-8" />
            <Skeleton className="h-96 w-full rounded-xl mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-serif mb-4">Artigo não encontrado</h1>
            <p className="text-muted-foreground mb-8">O artigo que você procura não existe ou foi removido.</p>
            <Link to="/blog" className="text-secondary hover:underline">
              Voltar para o Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.meta_title || post.title,
    "description": post.meta_description || post.excerpt,
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "image": post.cover_image_url,
    "author": { "@type": "Person", "name": "Fabiana Soberana" },
    "publisher": { "@type": "Organization", "name": "Soberana Mentoring Club" }
  };

  return (
    <>
      <SEO
        title={`${post.meta_title || post.title} | Blog Soberana`}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords || post.tags?.join(", ")}
        image={post.cover_image_url || undefined}
        url={`https://soberana.com.br/blog/${post.slug}`}
        type="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        schema={articleSchema}
      />

      <Navbar />

      <main className="min-h-screen bg-background pt-24">
        <article className="container mx-auto px-4 py-8 lg:py-16 max-w-4xl">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {category && (
              <Badge
                variant="outline"
                className="mb-4"
                style={{ borderColor: category.color, color: category.color }}
              >
                {category.name}
              </Badge>
            )}

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/30">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Fabiana Soberana
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.reading_time_minutes} min de leitura
              </span>
            </div>
          </motion.header>

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <img
              src={getBlogCoverImage(post.slug, post.cover_image_url)}
              alt={post.title}
              className="w-full rounded-2xl shadow-lg"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none text-foreground"
          >
            {renderContent(post.content)}
          </motion.div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 pt-6 border-t border-border/30"
            >
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 pt-6 border-t border-border/30"
          >
            <h3 className="font-serif text-lg mb-4">Compartilhar este artigo</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => sharePost("linkedin")}
                className="hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => sharePost("twitter")}
                className="hover:bg-[#1da1f2] hover:text-white hover:border-[#1da1f2]"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => sharePost("facebook")}
                className="hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2]"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => sharePost()}
                className="hover:bg-secondary hover:text-secondary-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Author CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-8 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="font-serif text-3xl text-secondary">FS</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-serif text-xl mb-2">Fabiana Soberana</h3>
                <p className="text-muted-foreground mb-4">
                  Mentora de advogadas há mais de 10 anos, ajudando profissionais a
                  construírem carreiras jurídicas de sucesso.
                </p>
                <Link
                  to="/#mentora"
                  className="text-secondary hover:underline font-medium"
                >
                  Conhecer mais sobre a mentora →
                </Link>
              </div>
            </div>
          </motion.div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="font-serif text-2xl md:text-3xl text-center mb-10">
                Artigos Relacionados
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <div className="bg-card rounded-xl overflow-hidden border border-border/50 hover:border-secondary/50 transition-all hover:shadow-lg">
                      <div className="aspect-video bg-muted">
                        {relatedPost.cover_image_url ? (
                          <img
                            src={relatedPost.cover_image_url}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                            <span className="font-serif text-3xl text-secondary/50">S</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif text-lg group-hover:text-secondary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relatedPost.reading_time_minutes} min
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogPostPage;
