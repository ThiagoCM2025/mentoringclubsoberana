import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Loader2, Users, Target } from "lucide-react";
import { TemplateFormDialog } from "./TemplateFormDialog";
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

export function TemplatesManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [audienceTab, setAudienceTab] = useState<"student" | "lead">("student");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .order("target_audience")
        .order("display_order");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(template: Template) {
    try {
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: "Template excluído",
        description: `"${template.name}" foi removido`,
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingTemplate(null);
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchTemplates();
  };

  const studentTemplates = templates.filter(t => t.target_audience === "student");
  const leadTemplates = templates.filter(t => t.target_audience === "lead");

  const renderTemplateList = (templateList: Template[]) => {
    if (templateList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum template encontrado. Crie o primeiro!
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {templateList.map((template) => (
          <Card key={template.id} className="relative bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon || "📧"}</span>
                  <div>
                    <CardTitle className="text-base text-foreground">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="text-xs mt-1 text-muted-foreground">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Badge variant={template.is_active ? "default" : "secondary"} className={template.is_active ? "bg-secondary text-black" : ""}>
                  {template.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.email_subject && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <p className="truncate font-medium text-foreground">{template.email_subject}</p>
                </div>
              )}
              {template.whatsapp_message && (
                <div className="text-sm">
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <p className="truncate text-muted-foreground">
                    {template.whatsapp_message.slice(0, 60)}...
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="premium"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="flex-1"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="premium"
                  size="sm"
                  onClick={() => setDeletingTemplate(template)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="admin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">Templates de Mensagem</CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie os modelos de mensagem para cada cenário
              </CardDescription>
            </div>
            <Button variant="gold" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={audienceTab} onValueChange={(v) => setAudienceTab(v as "student" | "lead")}>
              <TabsList className="mb-4 bg-muted border border-border">
                <TabsTrigger value="student" className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <Users className="h-4 w-4" />
                  Alunos ({studentTemplates.length})
                </TabsTrigger>
                <TabsTrigger value="lead" className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <Target className="h-4 w-4" />
                  Leads ({leadTemplates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                {renderTemplateList(studentTemplates)}
              </TabsContent>

              <TabsContent value="lead">
                {renderTemplateList(leadTemplates)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <TemplateFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        template={editingTemplate}
      />

      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingTemplate?.name}"? Esta ação não pode ser desfeita.
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
    </>
  );
}
