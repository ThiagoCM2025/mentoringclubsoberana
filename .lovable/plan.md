
## Plano: Substituição dos 6 Pilares para 4 Pilares + Seção "O Que É / Não É"

### Resumo das Mudanças

Os pilares atuais (6 pilares com foco em Direito Imobiliário) serão substituídos pelos **4 novos pilares** do Método Soberano:

| Pilar | Título | Descrição |
|-------|--------|-----------|
| 1 | **Estrutura** | Definir oferta clara, promessa e proposta fechável |
| 2 | **Posicionamento** | Conteúdo estratégico e autoridade para ser escolhida |
| 3 | **Gestão** | Rotina comercial, processos e previsibilidade |
| 4 | **Escala** | Precificação alta, contratos maiores e plano de crescimento |

---

### Arquivos a Modificar

#### 1. `src/components/landing/MethodologySection.tsx`
**Mudanças principais:**
- Linhas 14-63: Substituir array `pillars` de 6 para 4 pilares
- Atualizar ícones apropriados (Building2, Users, Settings, TrendingUp)
- Ajustar grid de 2 linhas x 3 cards para 1 linha x 4 cards ou 2x2
- Adicionar nova seção **"O Que É / O Que Não É"** após os pilares

**Nova estrutura do array:**
```typescript
const pillars = [
  {
    number: 1,
    title: "ESTRUTURA",
    subtitle: "O alicerce do negócio",
    description: "Definir oferta clara, promessa e proposta fechável.",
    icon: Building2,
  },
  {
    number: 2,
    title: "POSICIONAMENTO",
    subtitle: "Ser escolhida",
    description: "Conteúdo estratégico e autoridade para ser escolhida.",
    icon: Users,
  },
  {
    number: 3,
    title: "GESTÃO",
    subtitle: "Previsibilidade",
    description: "Rotina comercial, processos e previsibilidade.",
    icon: Settings,
  },
  {
    number: 4,
    title: "ESCALA",
    subtitle: "Crescimento sustentável",
    description: "Precificação alta, contratos maiores e plano de crescimento.",
    icon: TrendingUp,
  },
];
```

**Nova seção "O Que É / Não É"** (após os pilares):
- Cards lado a lado: verde (É) e vermelho (NÃO É)
- Design premium alinhado com a estética dark/gold

---

#### 2. `src/components/landing/FAQSection.tsx`
**Mudanças:**
- Linha 20-22: FAQ "Como funciona a metodologia dos 6 Pilares?" → "4 Pilares"
- Linha 27: Remover "5 pilares" → "4 pilares"
- Linhas 35-42: Atualizar referências aos pilares antigos

**FAQs atualizados:**
```typescript
{
  question: "Como funciona a metodologia dos 4 Pilares?",
  answer: "Os 4 Pilares — Estrutura, Posicionamento, Gestão e Escala — formam um sistema integrado. Estrutura define sua oferta fechável. Posicionamento constrói autoridade. Gestão cria rotina comercial previsível. Escala permite crescimento com contratos maiores."
}
```

---

#### 3. `src/data/programs.ts`
**Mudanças no programa "Aceleração" (linhas 186-250):**
- Linha 193: "6 pilares" → "4 pilares: Estrutura, Posicionamento, Gestão e Escala"
- Linha 194: Atualizar fullDescription
- Linha 205: Atualizar deliverables
- Linhas 216-222: Substituir 6 módulos por 4 módulos

**Novos módulos:**
```typescript
modules: [
  { title: "Pilar 1: Estrutura", description: "Defina oferta clara, promessa e proposta fechável" },
  { title: "Pilar 2: Posicionamento", description: "Conteúdo estratégico e autoridade para ser escolhida" },
  { title: "Pilar 3: Gestão", description: "Rotina comercial, processos e previsibilidade" },
  { title: "Pilar 4: Escala", description: "Precificação alta, contratos maiores e plano de crescimento" }
]
```

---

#### 4. `src/components/landing/ExperienceFAQ.tsx`
**Mudanças:**
- Linha 21-22: Atualizar FAQ "O que são os 6 Pilares?" → "4 Pilares"
- Linha 34: Atualizar referência ao pilar de "Vendas e Lucratividade"
- Linha 38: Atualizar referência aos "5 pilares"

---

### Design da Seção "O Que É / O Que Não É"

Será adicionada ao MethodologySection após os cards de pilares:

```text
┌─────────────────────────────────────────────────────────────┐
│                  O Método Soberano                          │
├─────────────────────────┬───────────────────────────────────┤
│       ✓ É               │         ✕ NÃO É                   │
├─────────────────────────┼───────────────────────────────────┤
│ • Estruturar oferta     │ • Aula de tese, peça,             │
│   fechável              │   estratégia processual           │
│                         │                                   │
│ • Posicionar com        │ • Revisão de petição,             │
│   autoridade            │   jurisprudência, doutrina        │
│                         │                                   │
│ • Criar rotina          │ • Para quem busca milagres        │
│   comercial previsível  │   sem executar                    │
│                         │                                   │
│ • Organizar processos   │ • Promessa de resultado           │
│   e escalar com         │   sem rotina comercial            │
│   ticket maior          │                                   │
└─────────────────────────┴───────────────────────────────────┘
```

---

### Resumo de Arquivos

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `src/components/landing/MethodologySection.tsx` | Substituir pilares + adicionar seção "O Que É/Não É" |
| `src/components/landing/FAQSection.tsx` | Atualizar FAQs |
| `src/data/programs.ts` | Atualizar programa Aceleração |
| `src/components/landing/ExperienceFAQ.tsx` | Atualizar FAQs |

### Impacto

- **4 arquivos** modificados
- Consistência em toda a landing page e área do estudante
- Nova seção visual clarifica o posicionamento do Método Soberano
