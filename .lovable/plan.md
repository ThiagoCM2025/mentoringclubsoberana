
# Plano: Corrigir Status "Aguardando Aprovação" em Missões Não Enviadas

## Problema Identificado
Missões que **nunca foram enviadas** estão aparecendo como "Aguardando aprovação da mentora" porque:

1. **RPC retorna `'pending'` por padrão** quando não existe registro de envio
2. **Frontend trata `'pending'` como "enviado"** na condição `isSubmitted`

## Correção Necessária

### Arquivo: `src/components/student/program/CurrentMissionSection.tsx`

**Linha 70 - Antes:**
```javascript
const isSubmitted = status === 'submitted' || status === 'pending';
```

**Linha 70 - Depois:**
```javascript
const isSubmitted = status === 'submitted';
```

### Mapeamento de Status Correto

| Status | Significado | UI Exibida |
|--------|-------------|------------|
| `undefined` / `null` / `pending` | Não enviada | Botão "Entregar Missão" |
| `submitted` | Aguardando revisão | "Aguardando aprovação da mentora" |
| `approved` | Completa | "Missão Completada! +XP" |
| `rejected` | Reprovada | Botão "Reenviar Entrega" |

## Arquivos Afetados

Vou verificar e corrigir em **todos os arquivos** que usam essa lógica:

| Arquivo | Ação |
|---------|------|
| `src/components/student/program/CurrentMissionSection.tsx` | CORRIGIR |
| `src/components/student/program/WeeklyMissionCard.tsx` | VERIFICAR |
| `src/components/student/TextLessonContent.tsx` | VERIFICAR |

## Resultado Esperado
- Missões não enviadas → Botão "Entregar Missão"
- Missões enviadas (status `submitted`) → "Aguardando aprovação"
- Missões aprovadas → Badge de sucesso
- Missões rejeitadas → Botão "Reenviar"
