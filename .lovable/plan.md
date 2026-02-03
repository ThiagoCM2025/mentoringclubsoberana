
## Plano: Corrigir Scroll na Área de Conteúdo do Lead

### Problema Identificado

A seção "Dados de Qualificação" e outros conteúdos não rolam porque os containers flexbox não têm `min-h-0`. Em flexbox, `flex-1` permite crescer, mas o `min-height: auto` padrão impede que o elemento encolha abaixo do tamanho do conteúdo, quebrando o overflow scroll.

### Causa Técnica

```
DialogContent (inset-0 flex flex-col)
  └── Header (fixo)
  └── div.flex-1.overflow-hidden (problema: sem min-h-0)
        └── Sidebar (w-280px)
        └── div.flex-1.overflow-hidden (problema: sem min-h-0)
              └── Tabs.flex-1.flex-col (problema: sem min-h-0)
                    └── TabsContent.overflow-y-auto (não rola!)
```

Sem `min-h-0`, o container não pode encolher e força o conteúdo a expandir infinitamente ao invés de ativar o scroll.

### Solução

Adicionar `min-h-0` nos containers flexbox que precisam permitir scroll:

**Arquivo**: `src/components/admin/leads/LeadDetailModal.tsx`

| Linha | Atual | Corrigido |
|-------|-------|-----------|
| 298 | `flex flex-1 overflow-hidden` | `flex flex-1 overflow-hidden min-h-0` |
| 456 | `flex-1 overflow-hidden flex flex-col` | `flex-1 overflow-hidden flex flex-col min-h-0` |
| 457 | `flex-1 flex flex-col` | `flex-1 flex flex-col min-h-0` |

### Por que `min-h-0` funciona?

- `flex-1` = `flex: 1 1 0%` (grow, shrink, basis=0)
- Porém `min-height: auto` (padrão) impede shrink abaixo do conteúdo
- `min-h-0` = `min-height: 0` permite que o elemento encolha
- Isso ativa o `overflow-y-auto` no TabsContent corretamente

### Resultado

Após a correção, toda a área de conteúdo (Tarefas, Qualificação, Histórico) será rolável normalmente.
