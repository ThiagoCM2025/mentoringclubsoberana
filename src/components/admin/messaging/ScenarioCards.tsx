import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface ScenarioCardsProps {
  templates: Template[];
  selectedId?: string;
  onSelect: (template: Template) => void;
}

export function ScenarioCards({ templates, selectedId, onSelect }: ScenarioCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={cn(
            "p-3 rounded-lg border-2 transition-all text-center",
            selectedId === template.id
              ? "border-secondary bg-secondary/10"
              : "border-secondary/30 bg-zinc-800/50 hover:border-secondary/60"
          )}
        >
          <div className="text-2xl mb-1">{template.icon || "📧"}</div>
          <div className="font-medium text-sm truncate text-cream">{template.name}</div>
          {template.description && (
            <div className="text-xs text-cream/60 truncate mt-1">
              {template.description}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
