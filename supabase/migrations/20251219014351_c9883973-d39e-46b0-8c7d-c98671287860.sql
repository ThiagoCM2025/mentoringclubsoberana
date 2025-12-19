-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#B6904D',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES public.blog_categories(id),
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  reading_time_minutes INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create blog_analytics table
CREATE TABLE public.blog_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  visitor_id TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_page_seconds INTEGER,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics ENABLE ROW LEVEL SECURITY;

-- Blog categories policies (public read, admin write)
CREATE POLICY "Anyone can view blog categories"
ON public.blog_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage blog categories"
ON public.blog_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Blog posts policies (public read published, admin all)
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Blog analytics policies (public insert, admin read)
CREATE POLICY "Anyone can insert blog analytics"
ON public.blog_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view blog analytics"
ON public.blog_analytics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on blog_posts
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description, color) VALUES
('Marketing Digital', 'marketing-digital', 'Estratégias de marketing digital para advogados', '#B6904D'),
('Captação de Clientes', 'captacao-clientes', 'Como atrair e converter clientes na advocacia', '#8B4513'),
('Inteligência Artificial', 'inteligencia-artificial', 'IA aplicada ao direito e advocacia', '#4A90A4'),
('Gestão de Escritório', 'gestao-escritorio', 'Administração e gestão de escritórios de advocacia', '#6B8E23'),
('Redes Sociais', 'redes-sociais', 'Marketing em redes sociais para advogados', '#9B59B6'),
('Ética e OAB', 'etica-oab', 'Regras éticas e diretrizes da OAB', '#E74C3C');