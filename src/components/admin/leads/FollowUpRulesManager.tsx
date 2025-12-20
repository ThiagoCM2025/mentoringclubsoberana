import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus, Trash2, Loader2, Clock, Mail, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FollowUpRule {
  id: string;
  name: string;
  description: string | null;
  days_without_contact: number;
  target_status: string[];
  target_temperature: string[];
  template_id: string | null;
  channel: string;
  is_active: boolean;
}

interface Template {
  id: string;
  name: string;
}

export function FollowUpRulesManager() {
  const { toast } = useToast();
  const [rules, setRules] = useState<FollowUpRule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FollowUpRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<FollowUpRule | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [daysWithoutContact, setDaysWithoutContact] = useState(3);
  const [templateId, setTemplateId] = useState<string>("");
  const [channel, setChannel] = useState("email");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchRules();
    fetchTemplates();
  }, []);

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from("follow_up_rules")
      .select("*")
      .order("days_without_contact");

    if (data) setRules(data);
    if (error) console.error("Error fetching rules:", error);
    setLoading(false);
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("message_templates")
      .select("id, name")
      .eq("target_audience", "lead")
      .eq("is_active", true);

    setTemplates(data || []);
  };

  const openCreateDialog = () => {
    setEditingRule(null);
    setName("");
    setDescription("");
    setDaysWithoutContact(3);
    setTemplateId("");
    setChannel("email");
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditDialog = (rule: FollowUpRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description || "");
    setDaysWithoutContact(rule.days_without_contact);
    setTemplateId(rule.template_id || "");
    setChannel(rule.channel);
    setIsActive(rule.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      const ruleData = {
        name,
        description: description || null,
        days_without_contact: daysWithoutContact,
        template_id: templateId || null,
        channel,
        is_active: isActive,
      };

      if (editingRule) {
        const { error } = await supabase
          .from("follow_up_rules")
          .update(ruleData)
          .eq("id", editingRule.id);

        if (error) throw error;
        toast({ title: "Regra atualizada!" });
      } else {
        const { error } = await supabase
          .from("follow_up_rules")
          .insert(ruleData);

        if (error) throw error;
        toast({ title: "Regra criada!" });
      }

      setDialogOpen(false);
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast({ title: "Erro ao salvar regra", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRule) return;

    try {
      const { error } = await supabase
        .from("follow_up_rules")
        .delete()
        .eq("id", deletingRule.id);

      if (error) throw error;
      toast({ title: "Regra excluída!" });
      setDeleteDialogOpen(false);
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({ title: "Erro ao excluir regra", variant: "destructive" });
    }
  };

  const toggleRuleActive = async (rule: FollowUpRule) => {
    try {
      const { error } = await supabase
        .from("follow_up_rules")
        .update({ is_active: !rule.is_active })
        .eq("id", rule.id);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const getChannelIcon = (ch: string) => {
    return ch === "whatsapp" ? MessageCircle : Mail;
  };

  if (loading) {
    return (
      <Card className="admin-card">
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="admin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                Regras de Follow-up Automático
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure mensagens automáticas para leads sem contato
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma regra de follow-up configurada</p>
              <p className="text-sm">Crie uma regra para enviar mensagens automáticas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const ChannelIcon = getChannelIcon(rule.channel);
                const template = templates.find(t => t.id === rule.template_id);
                
                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      rule.is_active 
                        ? "bg-card border-border hover:border-secondary/50" 
                        : "bg-muted/50 border-border/50 opacity-60"
                    }`}
                    onClick={() => openEditDialog(rule)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${rule.is_active ? "bg-secondary/10" : "bg-muted"}`}>
                          <Clock className={`w-5 h-5 ${rule.is_active ? "text-secondary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Após {rule.days_without_contact} dias sem contato via{" "}
                            <span className="inline-flex items-center gap-1">
                              <ChannelIcon className="w-3 h-3" />
                              {rule.channel === "whatsapp" ? "WhatsApp" : "Email"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {template && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {template.name}
                          </span>
                        )}
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => toggleRuleActive(rule)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingRule(rule);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingRule ? "Editar Regra" : "Nova Regra de Follow-up"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-foreground">Nome da Regra</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Follow-up 3 dias"
                className="bg-card border-border mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground">Descrição (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da regra..."
                className="bg-card border-border mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground">Dias sem contato</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={daysWithoutContact}
                onChange={(e) => setDaysWithoutContact(parseInt(e.target.value) || 3)}
                className="bg-card border-border mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground">Canal</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="bg-card border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </span>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-foreground">Template (opcional)</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="bg-card border-border mt-1">
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-foreground">Ativar regra</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-card border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingRule ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Regra</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a regra "{deletingRule?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
