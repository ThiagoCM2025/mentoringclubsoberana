import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Mail, 
  MessageCircle, 
  Plus, 
  Trash2,
  Edit,
  AlertCircle
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
import { TemplateFormDialog } from "@/components/admin/messaging/TemplateFormDialog";

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
  display_order: number | null;
}

export const LeadTemplatesTab = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .eq("target_audience", "leads")
      .order("display_order");

    if (data) setTemplates(data);
    if (error) console.error("Error fetching templates:", error);
    setLoading(false);
  };

  const handleDelete = async (template: Template) => {
    const { error } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", template.id);

    if (error) {
      toast({ title: "Erro ao excluir template", variant: "destructive" });
    } else {
      toast({ title: "Template excluído!" });
      fetchTemplates();
    }
    setDeletingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchTemplates();
  };

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case "mail": return <Mail className="w-4 h-4" />;
      case "message-circle": return <MessageCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Templates para Leads</h3>
          <p className="text-sm text-muted-foreground">
            Modelos de mensagens para comunicação com leads
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">Nenhum template criado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie templates para facilitar a comunicação com seus leads
            </p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className={`transition-all ${!template.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getIcon(template.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      {!template.is_active && (
                        <Badge variant="outline" className="text-xs mt-1">Inativo</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {template.description && (
                  <CardDescription className="text-xs mt-2 line-clamp-2">
                    {template.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  {template.email_subject && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{template.email_subject}</span>
                    </div>
                  )}
                  {template.whatsapp_message && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span className="truncate">WhatsApp configurado</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingTemplate(template)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Dicas para templates:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use {"{{nome}}"} para inserir o nome do lead automaticamente</li>
                <li>Templates de email devem ter assunto e corpo</li>
                <li>Templates de WhatsApp abrem o app com a mensagem pronta</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Form Dialog */}
      <TemplateFormDialog
        isOpen={showForm}
        onClose={handleFormClose}
        template={editingTemplate}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template "{deletingTemplate?.name}" será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingTemplate && handleDelete(deletingTemplate)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
