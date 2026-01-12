import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Variable {
  key: string;
  label: string;
  example: string;
}

const AVAILABLE_VARIABLES: Variable[] = [
  { key: "{{nome}}", label: "Nome completo", example: "Maria Silva" },
  { key: "{{primeiro_nome}}", label: "Primeiro nome", example: "Maria" },
  { key: "{{email}}", label: "E-mail", example: "maria@email.com" },
  { key: "{{phone}}", label: "Telefone", example: "(11) 99999-9999" },
];

interface VariableInsertBarProps {
  onInsert: (variable: string) => void;
}

export function VariableInsertBar({ onInsert }: VariableInsertBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border">
      <span className="text-xs text-muted-foreground font-medium">
        Variáveis:
      </span>
      {AVAILABLE_VARIABLES.map((variable) => (
        <Button
          key={variable.key}
          variant="outline"
          size="sm"
          className="h-7 text-xs font-mono hover:bg-primary/10 hover:text-primary hover:border-primary"
          onClick={() => onInsert(variable.key)}
          title={`${variable.label} - Ex: ${variable.example}`}
        >
          {variable.key}
        </Button>
      ))}
      <Badge variant="secondary" className="ml-auto text-xs">
        Clique para inserir
      </Badge>
    </div>
  );
}

export function replaceVariablesWithExamples(text: string): string {
  let result = text;
  AVAILABLE_VARIABLES.forEach((variable) => {
    result = result.replace(new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'), variable.example);
  });
  return result;
}

export { AVAILABLE_VARIABLES };
