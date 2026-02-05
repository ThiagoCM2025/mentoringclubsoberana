
# Plano: Corrigir Exibição de Missões

## Problema Identificado
As missões não aparecem porque o componente busca missões pela semana atual do aluno. Se o aluno está na semana 5, mas só existem missões para semanas 1-2, o componente retorna `null` e nada é exibido.

## Solução Proposta
Modificar o `CurrentMissionSection` para **sempre mostrar as missões disponíveis**, independente da semana atual do aluno.

---

## Mudanças Técnicas

### 1. Atualizar `CurrentMissionSection.tsx`
- Remover a lógica que retorna `null` quando não há missão para a semana atual
- Inicializar `selectedWeek` com a primeira semana que tem missão (não a semana atual)
- Adicionar fallback para quando não há missão na semana selecionada

```text
Antes (linha 51):
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  ...
  if (!mission) return null;

Depois:
  // Encontrar primeira semana com missão disponível
  const firstMissionWeek = missions.length > 0 
    ? Math.min(...missions.map(m => m.week_number)) 
    : 1;
  
  // Inicializar com a semana atual SE tiver missão, senão usar primeira disponível
  const initialWeek = missions.some(m => m.week_number === currentWeek) 
    ? currentWeek 
    : firstMissionWeek;
    
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  
  // Se não houver missões, mostrar mensagem
  if (missions.length === 0) {
    return <EmptyMissionsPlaceholder />;
  }
```

### 2. Melhorar Navegação Entre Semanas
- Limitar navegação apenas às semanas que possuem missões
- Mostrar indicador visual de quais semanas têm missões

### 3. Adicionar Estado Vazio (Opcional)
- Criar componente de placeholder quando não há missões cadastradas

---

## Impacto
- Alunos verão as missões disponíveis imediatamente ao entrar no programa
- A navegação será mais intuitiva, mostrando apenas semanas com missões
- Sem quebra de funcionalidade existente

## Arquivos a Modificar
1. `src/components/student/program/CurrentMissionSection.tsx`
