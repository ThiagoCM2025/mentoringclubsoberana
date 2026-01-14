-- Criar tabela de categorias de agentes
CREATE TABLE public.ai_agent_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela principal de agentes de IA
CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  full_description TEXT,
  objective TEXT,
  category_id UUID REFERENCES ai_agent_categories(id) ON DELETE SET NULL,
  icon VARCHAR(50) DEFAULT 'Bot',
  thumbnail_url TEXT,
  thumbnail_position VARCHAR(50) DEFAULT '50% 50%',
  external_url TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Criar tabela de acesso aos agentes
CREATE TABLE public.ai_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID,
  UNIQUE(agent_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.ai_agent_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_access ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (leitura pública)
CREATE POLICY "Categories are viewable by everyone"
  ON public.ai_agent_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.ai_agent_categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Políticas para agentes
CREATE POLICY "Published agents are viewable by authenticated users"
  ON public.ai_agents FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    (is_published = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Admins can manage agents"
  ON public.ai_agents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Políticas para acesso
CREATE POLICY "Users can view their own access"
  ON public.ai_agent_access FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all access"
  ON public.ai_agent_access FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Trigger para updated_at
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias iniciais
INSERT INTO public.ai_agent_categories (name, slug, icon, color, display_order) VALUES
  ('Comportamento', 'comportamento', 'Brain', 'purple', 1),
  ('Conteúdo', 'conteudo', 'PenTool', 'amber', 2),
  ('Vendas', 'vendas', 'TrendingUp', 'green', 3),
  ('Estratégia', 'estrategia', 'Target', 'blue', 4),
  ('Jurídico', 'juridico', 'Scale', 'rose', 5),
  ('Produtividade', 'produtividade', 'Clock', 'orange', 6),
  ('Marketing', 'marketing', 'Megaphone', 'pink', 7),
  ('Propostas', 'propostas', 'FileText', 'yellow', 8);

-- Inserir agentes iniciais
INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Assistente Comportamental para Advogadas',
  'assistente-comportamental',
  'Análise de temperamento e estratégias comportamentais para advogadas',
  'Ajudar advogadas a entenderem seu temperamento e desenvolverem estratégias de comunicação mais eficazes',
  id,
  'Brain',
  'https://chatgpt.com/g/g-683394d0890c8191b9bef563840ef51a-soberana-assistente-comportamental-para-advogadas',
  true,
  1
FROM ai_agent_categories WHERE slug = 'comportamento';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Especialista Criação Conteúdos Soberanos',
  'especialista-conteudos',
  'Criação de conteúdos estratégicos para redes sociais e marketing jurídico',
  'Auxiliar na criação de conteúdos que posicionam a advogada como autoridade no nicho',
  id,
  'PenTool',
  'https://chatgpt.com/g/g-WLVTMOMFN-especialista-criacao-conteudos-soberanos',
  true,
  2
FROM ai_agent_categories WHERE slug = 'conteudo';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Vendas e Funis de Vendas para Advogadas',
  'vendas-funis',
  'Estratégias de vendas e construção de funis para advocacia',
  'Estruturar processos de vendas e funis de conversão para escritórios de advocacia',
  id,
  'TrendingUp',
  'https://chatgpt.com/g/g-693ec73940bc8191b32e05bfb4ebecbb-vendas-e-funis-de-vendas-para-adv',
  true,
  3
FROM ai_agent_categories WHERE slug = 'vendas';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Diretora de Estratégia de Nicho Jurídico',
  'estrategia-nicho',
  'Definição e posicionamento estratégico de nicho na advocacia',
  'Ajudar advogadas a definirem e dominarem um nicho jurídico específico',
  id,
  'Target',
  'https://chatgpt.com/g/g-695da4767ea88191a69a35a3e13fc5e3-diretora-de-estrategia-de-nicho-juridico',
  true,
  4
FROM ai_agent_categories WHERE slug = 'estrategia';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Criador de Propostas Comerciais',
  'criador-propostas',
  'Elaboração de propostas comerciais profissionais e persuasivas',
  'Criar propostas comerciais que convertem e valorizam os honorários',
  id,
  'FileText',
  'https://chatgpt.com/share/6967934a-fc5c-8004-b945-96b5b28ef10a',
  true,
  5
FROM ai_agent_categories WHERE slug = 'propostas';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Advogada Expert em Peças Jurídicas',
  'expert-pecas',
  'Assistência especializada na elaboração de peças jurídicas',
  'Auxiliar na criação e revisão de peças processuais de alta qualidade',
  id,
  'Scale',
  'https://chatgpt.com/g/g-684b74ee63708191904fab96ba2851ec-soberana-advogada-expert-em-pecas',
  true,
  6
FROM ai_agent_categories WHERE slug = 'juridico';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Assistente Pessoal e Organização de Agenda',
  'organizacao-agenda',
  'Gestão de tempo e organização de agenda para advogadas',
  'Otimizar a gestão de tempo e produtividade do dia a dia',
  id,
  'Clock',
  'https://chatgpt.com/g/g-684b6cde543c8191aa185365b991abc8-soberana-assistente-pessoal-e-organizacao-agenda',
  true,
  7
FROM ai_agent_categories WHERE slug = 'produtividade';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Gestora de Tráfego Soberana',
  'gestora-trafego',
  'Estratégias de tráfego pago para advogadas',
  'Configurar e otimizar campanhas de tráfego pago para captação de clientes',
  id,
  'Megaphone',
  'https://chatgpt.com/g/g-6844e5328e588191a135e89828583a07-soberana-gestora-de-trafego',
  true,
  8
FROM ai_agent_categories WHERE slug = 'marketing';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Petições e Peças Jurídicas',
  'peticoes-pecas',
  'Criação e revisão de petições e peças processuais',
  'Auxiliar na elaboração técnica de documentos jurídicos',
  id,
  'FileCheck',
  'https://chatgpt.com/g/g-6824c8e9f6b081918376f0e5e1d06105-soberana-peticoes-e-pecas-juridicas',
  true,
  9
FROM ai_agent_categories WHERE slug = 'juridico';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Criação de Artigos para Blog',
  'criacao-artigos',
  'Produção de artigos otimizados para SEO e autoridade',
  'Criar artigos de blog que posicionam a advogada como referência',
  id,
  'BookOpen',
  'https://chatgpt.com/g/g-67be5832ef848191a158842fe2acf6c6-soberana-criacao-de-artigos-blog',
  true,
  10
FROM ai_agent_categories WHERE slug = 'conteudo';

INSERT INTO public.ai_agents (title, slug, description, objective, category_id, icon, external_url, is_published, display_order)
SELECT 
  'Especialista em Vendas Advocacia Imobiliária',
  'vendas-imobiliaria',
  'Estratégias de vendas específicas para advocacia imobiliária',
  'Converter leads em clientes na área de direito imobiliário',
  id,
  'Building',
  'https://chatgpt.com/g/g-6744b603f6408191ad49a340641902f9-especialista-em-vendas-advocacia-imobiliario',
  true,
  11
FROM ai_agent_categories WHERE slug = 'vendas';