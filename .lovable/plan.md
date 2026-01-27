
## Plano: Atualizar Datas dos Encontros Ao Vivo

### Alteração Necessária

Atualizar as datas do calendário de "Encontros Ao Vivo" da Mentoria 360° no componente `CourseGamificationSidebar.tsx`.

### Mudanças

| Data Atual | Nova Data |
|------------|-----------|
| 29 de Janeiro | **28 de Janeiro** |
| 22 de Fevereiro | **23 de Fevereiro** |
| 14 de Março | **12 de Março** |
| 16 de Abril | 16 de Abril (sem mudança) |
| 14 de Maio | 14 de Maio (sem mudança) |
| 18 de Junho | 18 de Junho (sem mudança) |

### Arquivo a Modificar

**`src/components/student/program/CourseGamificationSidebar.tsx`** (linhas 104-109)

```typescript
// De:
{ date: new Date(2026, 0, 29, 18, 30), label: "29 de Janeiro" },
{ date: new Date(2026, 1, 22, 18, 30), label: "22 de Fevereiro" },
{ date: new Date(2026, 2, 14, 18, 30), label: "14 de Março" },

// Para:
{ date: new Date(2026, 0, 28, 18, 30), label: "28 de Janeiro" },
{ date: new Date(2026, 1, 23, 18, 30), label: "23 de Fevereiro" },
{ date: new Date(2026, 2, 12, 18, 30), label: "12 de Março" },
```

### Resultado

O calendário de encontros na área do aluno exibirá as novas datas corretamente, mantendo o horário de 18:30 (Brasília) e toda a lógica visual de próximo encontro/passado.
