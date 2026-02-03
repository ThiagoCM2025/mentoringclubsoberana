

## Plano: Corrigir Modal Fechando ao Clicar na Scrollbar

### Problema

O modal full-screen fecha quando o usuário clica na barra de rolagem lateral para rolar o conteudo. Isso acontece porque o Radix UI Dialog interpreta o clique na scrollbar como um clique "fora" do conteudo do dialog.

### Causa Tecnica

O componente `DialogContent` do Radix UI possui um handler `onPointerDownOutside` que fecha o modal quando detecta cliques fora da area de conteudo. A scrollbar, tecnicamente, esta fora do conteudo do dialog.

### Solucao

Adicionar o prop `onPointerDownOutside` com `e.preventDefault()` para impedir que cliques na scrollbar fechem o modal.

### Alteracao

**Arquivo**: `src/components/admin/leads/LeadDetailModal.tsx`

**Linha 241-246** - Adicionar prop para prevenir fechamento:

```typescript
<DialogContent 
  variant="fullscreen"
  className="flex flex-col bg-background p-0 gap-0"
  hideClose
  onPointerDownOutside={(e) => e.preventDefault()}
  onInteractOutside={(e) => e.preventDefault()}
>
```

### Detalhes Tecnicos

| Prop | Funcao |
|------|--------|
| `onPointerDownOutside` | Previne fechamento ao clicar fora (incluindo scrollbar) |
| `onInteractOutside` | Previne fechamento em qualquer interacao externa |

O modal ainda pode ser fechado pelo botao "Voltar" ou pelo "X" no header.

### Resultado

O usuario podera clicar na barra de rolagem para navegar pelo conteudo do lead sem que o modal feche inesperadamente.

