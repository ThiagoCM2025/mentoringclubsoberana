
# Plano: Liberar Todas as Missões

## Problema Atual
A lógica na linha 80 de `CurrentMissionSection.tsx` bloqueia missões futuras:
```javascript
const isLocked = selectedWeek > currentWeek;
```

Isso faz com que:
- Apenas missões até a semana atual da aluna fiquem disponíveis
- Semanas futuras mostrem um card com cadeado 🔒 e "Disponível em X dias"

## Solução
Remover completamente a lógica de bloqueio temporal, permitindo que a aluna:
- Navegue livremente entre todas as 12 semanas
- Submeta qualquer missão em qualquer momento
- Veja o conteúdo completo de todas as missões

## Alterações Técnicas

### Arquivo: `src/components/student/program/CurrentMissionSection.tsx`

| Mudança | Antes | Depois |
|---------|-------|--------|
| Variável isLocked | `selectedWeek > currentWeek` | Sempre `false` |
| Card bloqueado | Renderiza cadeado e contador | Removido completamente |
| Arena de Execução | Condicional `!isLocked` | Sempre visível |

### Código a modificar:

1. **Remover variável `isLocked`** (linha 80)
2. **Remover função `getDaysUntilUnlock`** (linhas 83-91) - não mais necessária
3. **Remover renderização do card bloqueado** (linhas 328-349)
4. **Simplificar condição da MissionArena** (linha 592)

## Resultado Esperado
- ✅ Todas as 12 semanas navegáveis
- ✅ Todas as missões clicáveis e submetíveis
- ✅ Aluna pode completar missões na ordem que preferir
- ✅ Mantém indicador visual "🔥 Atual" apenas como referência

## Arquivos Afetados
- `src/components/student/program/CurrentMissionSection.tsx`
