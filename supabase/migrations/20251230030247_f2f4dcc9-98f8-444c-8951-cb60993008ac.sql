-- Update mission data with proper month_title, gamification_title, and gamification_reward
-- Based on the complete 12-week program structure provided

-- First, let's add columns if they don't exist (they should already exist based on schema)
-- Then update all 12 weeks with proper data

-- Get the course ID for "Programa de Aceleração Soberana" (main program)
-- Week 1: Missão Identidade Soberana
UPDATE weekly_missions 
SET 
  title = 'Missão Identidade Soberana',
  challenge_description = 'Preencher o Diagnóstico Inicial e realizar o "Upgrade" no seu posicionamento (Bio, Foto e Link). Definir o nicho, a persona e a sua promessa: assistir a Aula Gravada: Construindo e arrumando o seu Alicerce',
  why_do = 'O cliente de alto ticket decide se te contrata nos primeiros 3 segundos.',
  month_number = 1,
  month_title = 'O Despertar da CEO (Fundação e Atração)',
  gamification_emoji = '🔓',
  gamification_title = 'Nível Desbloqueado: Advogada Invisível ➔ Autoridade em Construção',
  gamification_reward = 'Ao postar o print do perfil atualizado, você ganha o selo de "Pronta para o Jogo"',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 1;

-- Week 2: Missão Radar de Desejos
UPDATE weekly_missions 
SET 
  title = 'Missão Radar de Desejos',
  challenge_description = 'Criar 3 conteúdos usando a técnica do "Gancho Magnético" (dor + solução imobiliária).',
  why_do = 'Para parar de postar "informativos chatos" e começar a gerar desejo de compra.',
  month_number = 1,
  month_title = 'O Despertar da CEO (Fundação e Atração)',
  gamification_emoji = '🎯',
  gamification_title = 'Ação de Elite: Criadora de Conteúdo Estratégico',
  gamification_reward = 'Quem postar os 3 links dos conteúdos ganha uma análise de "Engajamento Lucrativo"',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 2;

-- Week 3: Missão Motor de Vendas
UPDATE weekly_missions 
SET 
  title = 'Missão Motor de Vendas',
  challenge_description = 'Configuração técnica do Gerenciador de Anúncios e Google Meu Negócio.',
  why_do = 'É aqui que você para de esperar indicações e assume as rédeas do seu faturamento.',
  month_number = 1,
  month_title = 'O Despertar da CEO (Fundação e Atração)',
  gamification_emoji = '⚙️',
  gamification_title = 'Power Up: Dona do Tráfego',
  gamification_reward = 'Pedir avaliação no Google Meu Negócio para 5 clientes e subir a sua primeira campanha',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 3;

-- Week 4: Missão Primeira Tração
UPDATE weekly_missions 
SET 
  title = 'Missão Primeira Tração',
  challenge_description = 'Colocar o primeiro anúncio de prospecção no ar com o seu vídeo ou arte soberana.',
  why_do = 'Validar se o mercado quer o que você está vendendo.',
  month_number = 1,
  month_title = 'O Despertar da CEO (Fundação e Atração)',
  gamification_emoji = '🔥',
  gamification_title = 'Conquista: Fogo Iniciado! (Primeiro lead vindo de anúncio)',
  gamification_reward = 'Bônus: Checklist de "Como responder o primeiro Oi, Doutora"',
  xp_reward = 200,
  requires_proof = true
WHERE week_number = 4;

-- Week 5: Missão Lucro Real
UPDATE weekly_missions 
SET 
  title = 'Missão Lucro Real',
  challenge_description = 'Aplicar a Planilha de Precificação em todos os seus serviços ativos.',
  why_do = 'Para descobrir se você está ganhando dinheiro ou apenas "trocando seis por meia dúzia".',
  month_number = 2,
  month_title = 'A Engenharia do Lucro (Conversão e Dinheiro)',
  gamification_emoji = '💰',
  gamification_title = 'Upgrade de Classe: Mestre da Precificação',
  gamification_reward = 'Selo "Escritório Saudável" (rumo a Margem de lucro acima de 40%)',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 5;

-- Week 6: Missão Script de Ferro
UPDATE weekly_missions 
SET 
  title = 'Missão Script de Ferro',
  challenge_description = 'Treinar o script de fechamento e gravar um áudio de "Quebra de Objeção".',
  why_do = 'Para não gaguejar quando o cliente disser que o vizinho cobra mais barato.',
  month_number = 2,
  month_title = 'A Engenharia do Lucro (Conversão e Dinheiro)',
  gamification_emoji = '🗣️',
  gamification_title = 'Habilidade: Persuasão Soberana',
  gamification_reward = 'Feedback direto da mentora sobre o seu tom de voz (Exclusivo 360)',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 6;

-- Week 7: Missão Ajuste Fino
UPDATE weekly_missions 
SET 
  title = 'Missão Ajuste Fino',
  challenge_description = 'Analisar as métricas dos anúncios e descartar o que não funciona.',
  why_do = 'Escalar exige cortar o desperdício de dinheiro.',
  month_number = 2,
  month_title = 'A Engenharia do Lucro (Conversão e Dinheiro)',
  gamification_emoji = '🔍',
  gamification_title = 'Nível: Analista de Performance',
  gamification_reward = 'Desbloqueio da aula secreta: "O Público Oculto do Imobiliário"',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 7;

-- Week 8: Missão Proposta Irresistível
UPDATE weekly_missions 
SET 
  title = 'Missão Proposta Irresistível',
  challenge_description = 'Montar seu deck de apresentação de proposta em PDF de alto padrão.',
  why_do = 'Para o cliente sentir que está contratando uma empresa, não apenas uma pessoa.',
  month_number = 2,
  month_title = 'A Engenharia do Lucro (Conversão e Dinheiro)',
  gamification_emoji = '💎',
  gamification_title = 'Item de Luxo: Proposta de Alto Ticket',
  gamification_reward = 'Template de Proposta Soberana para download',
  xp_reward = 200,
  requires_proof = true
WHERE week_number = 8;

-- Week 9: Missão Cérebro Digital
UPDATE weekly_missions 
SET 
  title = 'Missão Cérebro Digital',
  challenge_description = 'Estruturar o seu funil de vendas (Pipeline) dentro do sistema Auralex e comentar sobre a sua escala de vendas.',
  why_do = 'Para nunca mais esquecer de dar retorno para um cliente potencial.',
  month_number = 3,
  month_title = 'Rumo aos +50K (Escala e Liberdade)',
  gamification_emoji = '🤖',
  gamification_title = 'Status: Advogada Organizada',
  gamification_reward = 'Uso versão gratuita do Auralex',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 9;

-- Week 10: Missão Dobra de Tempo (IA)
UPDATE weekly_missions 
SET 
  title = 'Missão Dobra de Tempo (IA)',
  challenge_description = 'Produzir uma peça complexa ou contrato usando os Prompts de IA do método.',
  why_do = 'Se você trabalha 12h/dia, você não tem tempo para faturar 50k.',
  month_number = 3,
  month_title = 'Rumo aos +50K (Escala e Liberdade)',
  gamification_emoji = '⚡',
  gamification_title = 'Super Poder: Velocidade de Execução',
  gamification_reward = 'Ganho de 4 horas livres na sua semana',
  xp_reward = 150,
  requires_proof = true
WHERE week_number = 10;

-- Week 11: Missão Escala Agressiva
UPDATE weekly_missions 
SET 
  title = 'Missão Escala Agressiva',
  challenge_description = 'Dobrar o investimento no anúncio que mais trouxe contratos fechados.',
  why_do = 'É aqui que o faturamento de 5k vira 50k.',
  month_number = 3,
  month_title = 'Rumo aos +50K (Escala e Liberdade)',
  gamification_emoji = '📈',
  gamification_title = 'Conquista: Rumo ao Topo!',
  gamification_reward = 'Convite para o "Hall da Fama Soberana" (Networking com quem já fatura +50k)',
  xp_reward = 200,
  requires_proof = true
WHERE week_number = 11;

-- Week 12: Missão Próximo Nível (CEO)
UPDATE weekly_missions 
SET 
  title = 'Missão Próximo Nível (CEO)',
  challenge_description = 'Criar o seu plano de contratação ou expansão para o próximo trimestre.',
  why_do = 'Para garantir que os 50k sejam o seu novo "piso", não o seu teto.',
  month_number = 3,
  month_title = 'Rumo aos +50K (Escala e Liberdade)',
  gamification_emoji = '👑',
  gamification_title = 'Título Final: SOBERANA DO IMOBILIÁRIO',
  gamification_reward = 'Certificado de Conclusão da Aceleração e Rota Final para a Mentoria 360',
  xp_reward = 250,
  requires_proof = true
WHERE week_number = 12;

-- Create mission_comments table for Arena de Execução
CREATE TABLE IF NOT EXISTS public.mission_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.weekly_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_delivery BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mission_comments_mission_id ON public.mission_comments(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_comments_user_id ON public.mission_comments(user_id);

-- Enable RLS
ALTER TABLE public.mission_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all mission comments" 
  ON public.mission_comments 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own comments" 
  ON public.mission_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
  ON public.mission_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON public.mission_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
  ON public.mission_comments 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for mission_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_comments;