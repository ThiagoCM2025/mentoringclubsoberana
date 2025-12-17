import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Trash2,
  Edit,
  FileText,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
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
import { TemplateFormDialog } from "./TemplateFormDialog";

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  category: string | null;
  is_default: boolean;
  created_at: string;
}

const typeConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  info: { label: "Informação", variant: "secondary", icon: <Info className="h-3 w-3" /> },
  success: { label: "Sucesso", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  warning: { label: "Aviso", variant: "outline", icon: <AlertTriangle className="h-3 w-3" /> },
  alert: { label: "Alerta", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

export function NotificationTemplatesTab() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<NotificationTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(template: NotificationTemplate) {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", template.id);

      if (error) throw error;

      toast.success("Template excluído com sucesso!");
      setDeleteConfirm(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Erro ao excluir template");
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(template: NotificationTemplate) {
    setEditingTemplate(template);
    setShowFormDialog(true);
  }

  function handleFormClose() {
    setShowFormDialog(false);
    setEditingTemplate(null);
  }

  function handleFormSuccess() {
    handleFormClose();
    fetchTemplates();
  }

  const getTypeBadge = (type: string) => {
    const config = typeConfig[type] || typeConfig.info;
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="admin-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-cream">
            <FileText className="w-5 h-5" />
            Templates de Notificações
          </CardTitle>
          <CardDescription className="text-cream/60">
            Crie e gerencie templates pré-configurados para envio rápido de notificações
          </CardDescription>
        </div>
        <Button onClick={() => setShowFormDialog(true)} className="bg-secondary hover:bg-secondary/90 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-center text-cream/60 py-8">
            Nenhum template cadastrado
          </p>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-secondary/20 rounded-lg p-4 space-y-3 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-cream">{template.name}</h4>
                      {template.is_default && (
                        <Badge variant="outline" className="text-xs border-secondary/40 text-cream/70">
                          Padrão
                        </Badge>
                      )}
                      {getTypeBadge(template.type)}
                    </div>
                    <p className="text-sm font-medium text-cream/70 mt-1">
                      "{template.title}"
                    </p>
                    <p className="text-sm text-cream/60 mt-2 line-clamp-2">
                      {template.message}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-zinc-800 border border-secondary/40 text-cream hover:bg-secondary/20 hover:border-secondary"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(template)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <TemplateFormDialog
        open={showFormDialog}
        onOpenChange={handleFormClose}
        template={editingTemplate}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "{deleteConfirm?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}