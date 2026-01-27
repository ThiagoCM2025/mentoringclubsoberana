

## Plano: Atualizar Calendário de Encontros Ao Vivo

### Alteração Solicitada

Substituir as 6 datas atuais por 5 novas datas conforme especificado.

### Mudanças

| Datas Atuais (6) | Novas Datas (5) |
|------------------|-----------------|
| 28 de Janeiro | **29 de Janeiro** |
| 23 de Fevereiro | **12 de Fevereiro** |
| 12 de Março | **26 de Fevereiro** |
| 16 de Abril | **11 de Março** |
| 14 de Maio | **26 de Março** |
| 18 de Junho | *(removido)* |

### Arquivo a Modificar

**`src/components/student/program/CourseGamificationSidebar.tsx`** (linhas 103-108)

```typescript
// De (6 datas):
{ date: new Date(2026, 0, 28, 18, 30), label: "28 de Janeiro" },
{ date: new Date(2026, 1, 23, 18, 30), label: "23 de Fevereiro" },
{ date: new Date(2026, 2, 12, 18, 30), label: "12 de Março" },
{ date: new Date(2026, 3, 16, 18, 30), label: "16 de Abril" },
{ date: new Date(2026, 4, 14, 18, 30), label: "14 de Maio" },
{ date: new Date(2026, 5, 18, 18, 30), label: "18 de Junho" },

// Para (5 datas):
{ date: new Date(2026, 0, 29, 18, 30), label: "29 de Janeiro" },
{ date: new Date(2026, 1, 12, 18, 30), label: "12 de Fevereiro" },
{ date: new Date(2026, 1, 26, 18, 30), label: "26 de Fevereiro" },
{ date: new Date(2026, 2, 11, 18, 30), label: "11 de Março" },
{ date: new Date(2026, 2, 26, 18, 30), label: "26 de Março" },
```

### Detalhes Técnicos

- **Janeiro** = mês 0 em JavaScript
- **Fevereiro** = mês 1
- **Março** = mês 2
- Horário mantido: 18:30 (Brasília)

### Resultado

O calendário exibirá 5 encontros concentrados entre Janeiro e Março de 2026, com a mesma lógica visual de próximo/passado funcionando corretamente.

