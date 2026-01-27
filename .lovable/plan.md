

## Plano: Corrigir Tela em Branco ao Buscar Leads

### Problema Identificado

A tela fica em branco ao buscar leads porque o código tenta executar `.toLowerCase()` em um campo `email` que pode ser `null` no banco de dados.

**Linha problemática** (AdminLeads.tsx, linha 647):
```typescript
lead.email.toLowerCase().includes(search.toLowerCase())
```

Quando um lead não tem email (apenas telefone), `lead.email` é `null` e `null.toLowerCase()` gera um erro fatal.

### Causa Raiz

A memória do projeto confirma: *"Leads can be registered with only an email, only a phone number, or both. The 'leads' table 'email' column allows NULL values."*

Porém, as interfaces TypeScript definem `email: string` (não nullable), criando uma inconsistência.

### Correções Necessárias

#### 1. Corrigir o Filtro de Busca (AdminLeads.tsx)

**Antes:**
```typescript
const matchesSearch =
  lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
  lead.email.toLowerCase().includes(search.toLowerCase()) ||
  lead.phone?.includes(search);
```

**Depois:**
```typescript
const matchesSearch =
  lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
  lead.email?.toLowerCase().includes(search.toLowerCase()) ||
  lead.phone?.toLowerCase().includes(search.toLowerCase());
```

#### 2. Atualizar Interface Lead (3 arquivos)

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `src/pages/admin/AdminLeads.tsx` | 60 | `email: string` → `email: string \| null` |
| `src/components/admin/leads/LeadPipelineView.tsx` | 33 | `email: string` → `email: string \| null` |
| `src/components/admin/leads/LeadColumn.tsx` | 12 | `email: string` → `email: string \| null` |

### Detalhes Técnicos

- Usar optional chaining (`?.`) para acessar métodos em valores potencialmente null
- Também aplicar `.toLowerCase()` no campo `phone` para busca case-insensitive consistente
- Atualizar as interfaces para refletir a realidade do banco de dados

### Resultado Esperado

A busca de leads funcionará sem erros, mesmo quando houver leads cadastrados apenas com telefone (sem email).

