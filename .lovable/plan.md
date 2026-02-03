

## Plano: Cadastro Livre de Lead + Modal Centralizado Full-Screen

### Problema 1: Cadastro Exige Email ou Telefone

**Atual**: O formulário exige pelo menos email OU telefone (linha 46-52):
```typescript
.refine(
  (data) => (data.email && data.email.trim() !== "") || (data.phone && data.phone.trim() !== ""),
  { message: "Preencha pelo menos o email ou o telefone", path: ["email"] }
)
```

**Solução**: Remover a validação `.refine()` para permitir cadastro apenas com nome.

### Problema 2: Modal Aparece à Direita e Some

**Atual** (LeadDetailModal.tsx, linha 243):
```typescript
className="fixed top-0 right-0 bottom-0 h-full max-w-none lg:left-[var(--admin-sidebar-offset,208px)]..."
```
O modal está configurado como slide-in panel lateral, não centralizado.

**Solução**: Usar `variant="fullscreen"` do DialogContent para layout full-screen centralizado.

---

### Alterações

#### Arquivo 1: `src/components/admin/NewLeadDialog.tsx`

| Linha | Alteração |
|-------|-----------|
| 38-52 | Remover `.refine()` - apenas `full_name` com min(1) obrigatório |
| 127 | Remover asterisco do label "Nome completo *" |

**Novo schema**:
```typescript
const formSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("Email inválido").max(255).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "negotiating", "converted", "lost"]),
  temperature: z.enum(["cold", "warm", "hot"]),
  notes: z.string().optional(),
});
// Sem .refine() - cadastro totalmente livre
```

#### Arquivo 2: `src/components/admin/leads/LeadDetailModal.tsx`

| Linha | Alteração |
|-------|-----------|
| 241-246 | Usar DialogContent com `variant="fullscreen"` e classes para centralizar |

**Novo DialogContent**:
```typescript
<DialogContent 
  variant="fullscreen"
  className="flex flex-col bg-background"
  hideClose
>
```

---

### Resultado

1. **Cadastro livre**: Pode criar lead apenas com nome, sem email/telefone
2. **Modal full-screen centralizado**: Ocupa toda a tela de forma limpa, sem desaparecer para o lado

