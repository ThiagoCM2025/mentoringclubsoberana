
# Plano: Adicionar Contador de Missões no Header

## Problema
A seção "Sua Jornada Semanal" não exibe o progresso total de missões (ex: "3/9 Concluídas") no header, dificultando que o aluno veja seu progresso geral.

## Solução
Adicionar um badge/contador de progresso no header do `CurrentMissionSection` mostrando missões completadas vs total.

---

## Mudanças Técnicas

### 1. Atualizar `CurrentMissionSection.tsx`

**Adicionar props para receber contagem de missões completadas:**
```text
interface CurrentMissionSectionProps {
  missions: WeeklyMission[];
  missionCompletions: Record<string, {...}>;
  // ... existing props
}
```

**Calcular missões concluídas:**
```text
const completedMissionsCount = missions.filter(
  m => missionCompletions[m.id]?.status === 'approved'
).length;
const totalMissionsCount = missions.length;
```

**Adicionar badge no header:**
```text
// No header, junto ao título "Sua Jornada Semanal"
<div className="flex items-center gap-3">
  <Badge className="bg-secondary/20 text-secondary border-secondary/30">
    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
    {completedMissionsCount}/{totalMissionsCount} Missões
  </Badge>
</div>
```

### 2. Layout do Header Atualizado
```text
┌─────────────────────────────────────────────────────────────┐
│  🔥 Sua Jornada Semanal                                     │
│     Arena de Execução   [✓ 3/9 Missões]    [< Semana 1 >]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivo a Modificar
1. `src/components/student/program/CurrentMissionSection.tsx`

## Resultado Esperado
- O aluno verá instantaneamente quantas missões completou do total
- O contador atualiza automaticamente quando missões são aprovadas
- Mantém consistência visual com o design premium existente
