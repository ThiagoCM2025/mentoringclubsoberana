
# Plano: Navegação por Lista de Missões

## Problema Identificado
A interface agrupa missões por `week_number`, mas:
- Semana 1 tem 8 missões
- Semana 2 tem 1 missão
- O `find()` retorna apenas a primeira de cada semana

```javascript
// Linha 68 - só pega UMA missão por semana
const mission = missions.find(m => m.week_number === selectedWeek);
```

## Solução
Trocar navegação de "semanas" para "lista de missões", permitindo navegar entre todas as missões criadas.

## Alterações Técnicas

### Arquivo: `src/components/student/program/CurrentMissionSection.tsx`

| Item | Antes | Depois |
|------|-------|--------|
| Estado | `selectedWeek` (número da semana) | `selectedIndex` (índice na lista) |
| Navegação | Semana 1-12 | Missão 1 de N |
| Seleção | `find(m => m.week_number === selectedWeek)` | `missions[selectedIndex]` |
| Label | "Semana X de 12" | "Missão X de N" ou título da missão |

### Mudanças no código:

1. **Remover lógica de semanas:**
```javascript
// REMOVER
const weeksWithMissions = [...new Set(missions.map(m => m.week_number))];
const [selectedWeek, setSelectedWeek] = useState(getInitialWeek);
const mission = missions.find(m => m.week_number === selectedWeek);

// ADICIONAR
const [selectedIndex, setSelectedIndex] = useState(0);
const mission = missions[selectedIndex];
```

2. **Atualizar navegação:**
```javascript
const canGoPrev = selectedIndex > 0;
const canGoNext = selectedIndex < missions.length - 1;

// Botões
onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}
onClick={() => setSelectedIndex(i => Math.min(missions.length - 1, i + 1))}
```

3. **Atualizar labels visuais:**
- De "Semana X de 12" para "Missão X de Y"
- Manter indicador de semana dentro do card como referência

## Resultado Esperado
- Todas as 9 missões navegáveis
- Setas avançam entre missões, não semanas
- Novas missões adicionadas aparecem automaticamente
- Card ainda mostra "Semana X" como informação contextual

## Arquivos a Modificar
- `src/components/student/program/CurrentMissionSection.tsx`
