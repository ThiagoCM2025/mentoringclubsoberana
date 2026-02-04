

## Plano: Adicionar "A Promessa do Método" + Atualizar Seção "Para Quem É/Não É"

### Resumo das Mudanças

Adicionar nova seção com a promessa do método e substituir os textos da seção "O Que É / Não É" para o novo formato "Para Quem É / Para Quem Não É".

---

### Arquivo a Modificar

**`src/components/landing/MethodologySection.tsx`**

---

### Mudança 1: Atualizar os Arrays de Dados (linhas 49-61)

**Atual:**
```typescript
const whatItIs = [
  "Estruturar uma oferta fechável",
  "Posicionar com autoridade (conteúdo com intenção)",
  "Criar rotina comercial previsível (captação + follow-up + proposta)",
  "Organizar processos e escalar com ticket/contratos maiores",
];

const whatItIsNot = [
  "Aula de tese, peça, estratégia processual",
  "Revisão de petição, jurisprudência, doutrina",
  "Para quem busca milagres sem executar",
  "Promessa de resultado sem rotina comercial",
];
```

**Novo:**
```typescript
const forWho = [
  "Advogadas que trabalham muito e têm picos e sumiços de contratos",
  "Quem quer parar de depender de indicação e \"sorte\"",
  "Quem quer clareza de oferta, posicionamento que atrai, rotina comercial e processo de fechamento",
  "Quem quer crescer com mais margem, previsibilidade e leveza operacional",
];

const notForWho = [
  "Quem quer técnica jurídica (peças, teses, jurisprudência, revisão de petições)",
  "Quem quer resultado sem rotina comercial",
  "Quem não quer vender com clareza e processo",
];
```

---

### Mudança 2: Adicionar Seção "A Promessa do Método" (após o header, antes dos pilares)

Nova seção com design premium a ser inserida após a linha 509 (após o header) e antes dos pilares:

```typescript
{/* A Promessa do Método */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6, delay: 0.3 }}
  className="max-w-4xl mx-auto mb-12 md:mb-16 lg:mb-20"
>
  <div className="relative rounded-2xl border border-gold/30 bg-gradient-to-br from-black via-black/95 to-marsala-dark/10 p-6 md:p-8 lg:p-10">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent" />
    <div className="relative text-center">
      <h3 className="font-playfair text-lg md:text-xl lg:text-2xl font-bold text-gold mb-4">
        A Promessa do Método
      </h3>
      <p className="text-cream/90 text-base md:text-lg leading-relaxed mb-4">
        O Método Soberano ensina advogadas a saírem da instabilidade e construírem 
        uma advocacia previsível e lucrativa através de estrutura de oferta, 
        posicionamento, autoridade, gestão comercial e escala.
      </p>
      <p className="text-gold font-semibold text-sm md:text-base">
        Importante: aqui você não aprende Direito. Você aprende ADVOCACIA como negócio.
      </p>
    </div>
  </div>
</motion.div>
```

---

### Mudança 3: Atualizar Seção "O Que É/Não É" para "Para Quem É/Não É" (linhas 530-592)

**Mudanças:**
- Título: "O Método Soberano" permanece
- Card verde: "É" → "Para Quem É"
- Card vermelho: "NÃO É" → "Para Quem NÃO É"
- Arrays: `whatItIs` → `forWho` e `whatItIsNot` → `notForWho`

---

### Estrutura Visual Final

```text
┌──────────────────────────────────────────────────────────────────┐
│                    O MÉTODO COMPROVADO (header)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              A PROMESSA DO MÉTODO (NOVO)                   │  │
│  │  O Método Soberano ensina advogadas a saírem da           │  │
│  │  instabilidade e construírem uma advocacia previsível...  │  │
│  │                                                            │  │
│  │  Importante: aqui você não aprende Direito.               │  │
│  │  Você aprende ADVOCACIA como negócio.                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ ESTRUTURA  │ │POSICIONAM. │ │   GESTÃO   │ │   ESCALA   │   │
│  │  Pilar 1   │ │  Pilar 2   │ │  Pilar 3   │ │  Pilar 4   │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                  │
│  ┌─────────────────────────┬────────────────────────────────┐   │
│  │    ✓ PARA QUEM É        │      ✕ PARA QUEM NÃO É         │   │
│  ├─────────────────────────┼────────────────────────────────┤   │
│  │ • Advogadas com picos   │ • Quem quer técnica jurídica   │   │
│  │   e sumiços             │                                │   │
│  │ • Quem quer parar de    │ • Quem quer resultado sem      │   │
│  │   depender de indicação │   rotina comercial             │   │
│  │ • Quem quer clareza     │                                │   │
│  │   de oferta...          │ • Quem não quer vender com     │   │
│  │ • Quem quer crescer     │   clareza e processo           │   │
│  │   com mais margem       │                                │   │
│  └─────────────────────────┴────────────────────────────────┘   │
│                                                                  │
│               [ Conhecer a Jornada Soberana ]                   │
└──────────────────────────────────────────────────────────────────┘
```

---

### Resumo Técnico

| Local | Mudança |
|-------|---------|
| Linhas 49-61 | Renomear arrays: `whatItIs` → `forWho`, `whatItIsNot` → `notForWho` com novos textos |
| Após linha 509 | Adicionar nova seção "A Promessa do Método" |
| Linhas 537-589 | Atualizar títulos e referências dos arrays na seção verde/vermelha |

