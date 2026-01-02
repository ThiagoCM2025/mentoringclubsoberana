import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Bell, Plus, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  alert_type: string;
  conditions: any;
  threshold_value: number;
  threshold_unit: string;
  severity: string;
  is_active: boolean;
}

interface AlertRulesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const alertTypes = [
  { value: "lead_inactive", label: "Lead sem Contato" },
  { value: "student_inactive", label: "Aluna Inativa" },
  { value: "mission_pending", label: "Missão Pendente" },
  { value: "low_conversion", label: "Conversão Baixa" },
];

const severityConfig = {
  info: { label: "Informação", color: "bg-blue-500" },
  warning: { label: "Atenção", color: "bg-yellow-500" },
  critical: { label: "Crítico", color: "bg-red-500" },
};

export const AlertRulesManager = ({ open, onOpenChange }: AlertRulesManagerProps) => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    alert_type: "lead_inactive",
    threshold_value: 24,
    threshold_unit: "hours",
    severity: "warning",
  });

  useEffect(() => {
    if (open) {
      fetchRules();
    }
  }, [open]);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_alert_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setRules(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      if (editingRule) {
        const { error } = await supabase
          .from("admin_alert_rules")
          .update({
            name: formData.name,
            description: formData.description || null,
            alert_type: formData.alert_type,
            threshold_value: formData.threshold_value,
            threshold_unit: formData.threshold_unit,
            severity: formData.severity,
          })
          .eq("id", editingRule.id);

        if (error) throw error;
        toast.success("Regra atualizada!");
      } else {
        const { error } = await supabase.from("admin_alert_rules").insert({
          name: formData.name,
          description: formData.description || null,
          alert_type: formData.alert_type,
          threshold_value: formData.threshold_value,
          threshold_unit: formData.threshold_unit,
          severity: formData.severity,
          conditions: {},
        });

        if (error) throw error;
        toast.success("Regra criada!");
      }

      resetForm();
      fetchRules();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar regra");
    }
  };

  const toggleActive = async (rule: AlertRule) => {
    try {
      const { error } = await supabase
        .from("admin_alert_rules")
        .update({ is_active: !rule.is_active })
        .eq("id", rule.id);

      if (error) throw error;
      fetchRules();
    } catch (error: any) {
      toast.error("Erro ao atualizar regra");
    }
  };

  const handleDelete = async (rule: AlertRule) => {
    if (!confirm(`Excluir a regra "${rule.name}"?`)) return;

    try {
      const { error } = await supabase.from("admin_alert_rules").delete().eq("id", rule.id);
      if (error) throw error;
      toast.success("Regra excluída");
      fetchRules();
    } catch (error: any) {
      toast.error("Erro ao excluir regra");
    }
  };

  const startEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      alert_type: rule.alert_type,
      threshold_value: rule.threshold_value,
      threshold_unit: rule.threshold_unit,
      severity: rule.severity,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      alert_type: "lead_inactive",
      threshold_value: 24,
      threshold_unit: "hours",
      severity: "warning",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Regras de Alertas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {showForm ? (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Regra</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Lead VIP sem contato"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do alerta"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Alerta</Label>
                  <Select
                    value={formData.alert_type}
                    onValueChange={(v) => setFormData({ ...formData, alert_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alertTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Severidade</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => setFormData({ ...formData, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tempo Limite</Label>
                  <Input
                    type="number"
                    value={formData.threshold_value}
                    onChange={(e) =>
                      setFormData({ ...formData, threshold_value: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select
                    value={formData.threshold_unit}
                    onValueChange={(v) => setFormData({ ...formData, threshold_unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                      <SelectItem value="percent">Porcentagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingRule ? "Atualizar" : "Criar Regra"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra de Alerta
            </Button>
          )}

          {/* Rules List */}
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => toggleActive(rule)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      <Badge
                        variant="outline"
                        className={`${severityConfig[rule.severity as keyof typeof severityConfig]?.color} text-white border-0 text-xs`}
                      >
                        {severityConfig[rule.severity as keyof typeof severityConfig]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alertTypes.find((t) => t.value === rule.alert_type)?.label} •{" "}
                      {rule.threshold_value} {rule.threshold_unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(rule)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(rule)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
