-- Parte 1: Adicionar colunas para soft delete na tabela courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Parte 2: Recuperar o curso de Aceleração com dados corretos
UPDATE courses 
SET 
  title = 'Programa de Aceleração Soberana',
  description = 'O Programa de Aceleração é a mentoria em grupo de 90 dias para advogadas que querem sair do caos e estruturar um negócio jurídico organizado e lucrativo. Trabalhamos os 6 pilares fundamentais da Metodologia Soberana para você construir uma base sólida.',
  thumbnail_url = '/assets/programs/program-aceleracao.jpg',
  program_type = 'aceleracao',
  requires_diagnostic = true,
  is_subscription = true,
  updated_at = now(),
  deleted_at = NULL,
  deleted_by = NULL
WHERE id = 'c0000001-0003-0000-0000-000000000003';

-- Parte 3: Criar índice para performance em queries de soft delete
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at);

-- Comentário nas colunas para documentação
COMMENT ON COLUMN courses.deleted_at IS 'Data/hora em que o curso foi movido para lixeira (soft delete)';
COMMENT ON COLUMN courses.deleted_by IS 'ID do usuário que moveu o curso para lixeira';