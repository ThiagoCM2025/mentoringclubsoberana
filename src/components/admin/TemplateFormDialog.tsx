import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import type { NotificationTemplate } from "./NotificationTemplatesTab";

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: NotificationTemplate | null;
  onSuccess: () => void;
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: TemplateFormDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    message: "",
    type: "info",
    category: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        title: template.title,
        message: template.message,
        type: template.type,
        category: template.category || "",
      });
    } else {
      setFormData({
        name: "",
        title: "",
        message: "",
        type: "info",
        category: "",
      });
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from("notification_templates")
          .update({
            name: formData.name,
            title: formData.title,
            message: formData.message,
            type: formData.type,
            category: formData.category || null,
          })
          .eq("id", template.id);

        if (error) throw error;
        toast.success("Template atualizado com sucesso!");
      } else {
        // Create new template
        const { error } = await supabase
          .from("notification_templates")
          .insert({
            name: formData.name,
            title: formData.title,
            message: formData.message,
            type: formData.type,
            category: formData.category || null,
            is_default: false,
          });

        if (error) throw error;
        toast.success("Template criado com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error(template ? "Erro ao atualizar template" : "Erro ao criar template");
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Editar Template" : "Novo Template"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? "Atualize as informações do template de notificação"
              : "Crie um novo template para envio rápido de notificações"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template *</Label>
            <Input
              id="name"
              placeholder="Ex: Boas-vindas, Lembrete de aula..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da Notificação *</Label>
            <Input
              id="title"
              placeholder="Ex: 🎉 Bem-vinda à Soberana!"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              placeholder="Escreva o conteúdo da mensagem..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("info")}
                      <span>Informação</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("success")}
                      <span>Sucesso</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("warning")}
                      <span>Aviso</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alert">
                    <div className="flex items-center gap-2">
                      {getTypeIcon("alert")}
                      <span>Alerta</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                placeholder="Ex: welcome, reminder..."
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {template ? "Atualizar" : "Criar Template"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}