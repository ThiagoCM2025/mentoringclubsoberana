import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  target_audience: string;
  email_subject: string | null;
  email_body: string | null;
  whatsapp_message: string | null;
  is_active: boolean;
  display_order: number;
}

interface TemplateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template: Template | null;
}

const ICONS = ["🎉", "📚", "🆕", "🏆", "🎓", "⏰", "💡", "🔥", "💪", "✨", "📧", "📱", "🏠", "💻", "👩‍💼", "🏢"];

export function TemplateFormDialog({
  isOpen,
  onClose,
  onSuccess,
  template,
}: TemplateFormDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📧",
    target_audience: "student",
    email_subject: "",
    email_body: "",
    whatsapp_message: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setFormData({
          name: template.name,
          description: template.description || "",
          icon: template.icon || "📧",
          target_audience: template.target_audience,
          email_subject: template.email_subject || "",
          email_body: template.email_body || "",
          whatsapp_message: template.whatsapp_message || "",
          is_active: template.is_active,
          display_order: template.display_order,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          icon: "📧",
          target_audience: "student",
          email_subject: "",
          email_body: "",
          whatsapp_message: "",
          is_active: true,
          display_order: 0,
        });
      }
    }
  }, [isOpen, template]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (template) {
        // Update
        const { error } = await supabase
          .from("message_templates")
          .update(formData)
          .eq("id", template.id);

        if (error) throw error;

        toast({
          title: "Template atualizado",
          description: `"${formData.name}" foi salvo`,
        });
      } else {
        // Insert
        const { error } = await supabase
          .from("message_templates")
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Template criado",
          description: `"${formData.name}" foi adicionado`,
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Editar Template" : "Novo Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Boas-vindas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <span className="text-xl">{icon}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descrição do cenário"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Público-alvo</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Alunos</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordem de exibição</Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Email Content */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              📧 Conteúdo do Email
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="email_subject">Assunto</Label>
              <Input
                id="email_subject"
                value={formData.email_subject}
                onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                placeholder="Assunto do email..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_body">Corpo do Email</Label>
              <Textarea
                id="email_body"
                value={formData.email_body}
                onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                placeholder="Corpo do email..."
                rows={5}
              />
            </div>
          </div>

          {/* WhatsApp Content */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              📱 Conteúdo do WhatsApp
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp_message">Mensagem</Label>
              <Textarea
                id="whatsapp_message"
                value={formData.whatsapp_message}
                onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
                placeholder="Mensagem do WhatsApp..."
                rows={4}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Variáveis disponíveis: <code>{"{nome}"}</code>, <code>{"{email}"}</code>, <code>{"{telefone}"}</code>
          </p>

          {/* Active Switch */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label htmlFor="is_active">Template ativo</Label>
              <p className="text-sm text-muted-foreground">
                Templates inativos não aparecem na lista de cenários
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {template ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
