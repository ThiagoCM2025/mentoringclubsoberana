import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DollarSign,
  Users,
  TrendingUp,
  Target,
  BookOpen,
  Activity,
  Award,
  Bell,
  BarChart3,
} from "lucide-react";

interface Widget {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const availableWidgets: Widget[] = [
  { id: "revenue", name: "Receita", icon: DollarSign, description: "Faturamento total e mensal" },
  { id: "students", name: "Alunos", icon: Users, description: "Total de alunas matriculadas" },
  { id: "leads", name: "Leads", icon: Target, description: "Leads captados e conversão" },
  { id: "enrollments", name: "Matrículas", icon: BookOpen, description: "Novas matrículas" },
  { id: "engagement", name: "Engajamento", icon: Activity, description: "Taxa de conclusão e atividade" },
  { id: "growth", name: "Crescimento", icon: TrendingUp, description: "Métricas de crescimento" },
  { id: "badges", name: "Badges", icon: Award, description: "Badges desbloqueados" },
  { id: "alerts", name: "Alertas", icon: Bell, description: "Alertas ativos" },
  { id: "topStudents", name: "Top Alunas", icon: BarChart3, description: "Ranking de alunas" },
];

interface WidgetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWidgets: string[];
  onSave: (widgets: string[]) => void;
}

export const WidgetSelector = ({
  open,
  onOpenChange,
  selectedWidgets,
  onSave,
}: WidgetSelectorProps) => {
  const [selected, setSelected] = useState<string[]>(selectedWidgets);

  useEffect(() => {
    setSelected(selectedWidgets);
  }, [selectedWidgets, open]);

  const toggleWidget = (widgetId: string) => {
    setSelected((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Dashboard</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {availableWidgets.map((widget) => {
            const Icon = widget.icon;
            const isChecked = selected.includes(widget.id);

            return (
              <div
                key={widget.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleWidget(widget.id)}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{widget.name}</p>
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage widget layout
export const useWidgetLayout = () => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<string[]>([
    "revenue",
    "students",
    "leads",
    "enrollments",
    "engagement",
    "growth",
    "badges",
    "alerts",
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLayout();
    }
  }, [user]);

  const fetchLayout = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_dashboard_layouts")
        .select("layout_config")
        .eq("admin_id", user?.id)
        .single();

      if (data?.layout_config && Array.isArray(data.layout_config)) {
        const layoutArray = data.layout_config.filter((item): item is string => typeof item === 'string');
        setLayout(layoutArray);
      }
    } catch (error) {
      // Use default layout if none saved
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (newLayout: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("admin_dashboard_layouts")
        .upsert({
          admin_id: user.id,
          layout_config: newLayout,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "admin_id"
        });

      if (error) throw error;
      setLayout(newLayout);
      toast.success("Layout salvo!");
    } catch (error: any) {
      toast.error("Erro ao salvar layout");
    }
  };

  return { layout, saveLayout, loading };
};
