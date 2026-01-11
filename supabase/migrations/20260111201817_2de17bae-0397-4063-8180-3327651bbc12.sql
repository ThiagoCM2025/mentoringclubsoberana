-- Adicionar colunas soft delete na tabela modules
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Adicionar colunas soft delete na tabela lessons
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_modules_deleted_at ON modules(deleted_at);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at ON lessons(deleted_at);

-- Comentários de documentação
COMMENT ON COLUMN modules.deleted_at IS 'Data/hora em que o módulo foi movido para lixeira';
COMMENT ON COLUMN modules.deleted_by IS 'ID do usuário que moveu o módulo para lixeira';
COMMENT ON COLUMN lessons.deleted_at IS 'Data/hora em que a aula foi movida para lixeira';
COMMENT ON COLUMN lessons.deleted_by IS 'ID do usuário que moveu a aula para lixeira';