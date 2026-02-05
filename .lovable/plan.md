
# Plano: Alertas de Missão Rejeitada + Celebração Aprovada

## Situação Atual

### ✅ Já Funciona (Aprovação)
- `WeekCelebrationModal` com fogos de artifício via `useConfetti`
- Toast de sucesso com XP ganho
- Atualização em tempo real via Supabase Realtime

### ⚠️ Parcialmente Implementado (Rejeição)
- Toast de alerta é exibido
- Card mostra borda vermelha e badge "↻ Reenviar"
- Feedback da mentora aparece no card
- **PORÉM:** o hook retorna `rejection` e `clearRejection` que NÃO estão sendo usados na página

## Alterações Necessárias

### 1. Criar Modal de Rejeição
**Arquivo:** `src/components/student/program/MissionRejectionModal.tsx`

Modal com design consistente para alertar a aluna quando sua missão for rejeitada:
- Ícone de alerta (⚠️ ou similar)
- Semana e título da missão
- Feedback da mentora em destaque
- Botão "Entendi, vou corrigir"
- Animação de entrada suave (sem confetti)

### 2. Integrar Modal na Página
**Arquivo:** `src/pages/student/ProgramCourseDetail.tsx`

```text
Mudanças:
┌─────────────────────────────────────────────────────────────┐
│ Linha 53 (atual):                                           │
│   const { celebration, clearCelebration } = useRealtime...  │
│                                                             │
│ Linha 53 (novo):                                            │
│   const { celebration, clearCelebration, rejection,         │
│           clearRejection } = useRealtime...                 │
└─────────────────────────────────────────────────────────────┘

+ Adicionar <MissionRejectionModal /> no final do componente
+ Passar rejection como props e clearRejection como onClose
```

### 3. Refresh de Dados na Rejeição
Adicionar effect para atualizar os dados quando uma missão for rejeitada:

```text
useEffect(() => {
  if (rejection) {
    refetch();
  }
}, [rejection, refetch]);
```

## Componente MissionRejectionModal

```text
┌──────────────────────────────────────────┐
│              ⚠️ (ícone vermelho)         │
│                                          │
│    Semana 3 • Missão Precisa de Ajustes  │
│                                          │
│    "Título da Missão"                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 💬 Feedback da Mentora             │  │
│  │                                    │  │
│  │ "O screenshot precisa mostrar o    │  │
│  │  resultado final do perfil..."     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Não desanime! Ajustes fazem parte do    │
│  processo de aprendizado.                │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   Entendi, Vou Corrigir  →         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/student/program/MissionRejectionModal.tsx` | **CRIAR** |
| `src/pages/student/ProgramCourseDetail.tsx` | MODIFICAR |

## Resultado Esperado

1. **Missão Aprovada**: Modal celebratório com confetti + toast de sucesso ✨
2. **Missão Rejeitada**: Modal de alerta com feedback + toast de aviso 📝
3. **Card atualizado**: Mostra status em tempo real com feedback visível
4. **Navegação clara**: Botão leva a aluna a corrigir e reenviar

## Detalhes Técnicos

O modal de rejeição terá:
- Animações com Framer Motion (consistente com o resto do app)
- Cores vermelhas/laranjas para indicar atenção
- Design responsivo
- Integração com o hook existente `useRealtimeMissionCelebration`
