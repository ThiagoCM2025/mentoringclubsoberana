import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Users, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StudentAvatarFormViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  userId: string;
  studentName?: string;
}

interface AvatarFormData {
  id: string;
  nicho: string | null;
  subnicho: string | null;
  roma: string | null;
  avatar_idade: string | null;
  avatar_sexo: string | null;
  avatar_salario: string | null;
  avatar_profissao: string | null;
  avatar_religiao: string | null;
  avatar_orientacao_politica: string | null;
  avatar_momento_vida: string | null;
  resumo_avatar: string | null;
  dores_pessoais: string[] | null;
  dores_profissionais: string[] | null;
  dores_emocionais: string[] | null;
  dores_relacionamento: string[] | null;
  desejos_pessoais: string[] | null;
  desejos_profissionais: string[] | null;
  desejos_financeiros: string[] | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function StudentAvatarFormViewer({
  open,
  onOpenChange,
  lessonId,
  userId,
  studentName,
}: StudentAvatarFormViewerProps) {
  const [formData, setFormData] = useState<AvatarFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && lessonId && userId) {
      loadFormData();
    }
  }, [open, lessonId, userId]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_avatar_forms")
        .select("*")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItems = (items: string[] | null, emptyText: string) => {
    const filtered = items?.filter(Boolean) || [];
    if (filtered.length === 0) {
      return <p className="text-sm text-muted-foreground italic">{emptyText}</p>;
    }
    return (
      <ul className="space-y-1">
        {filtered.map((item, i) => (
          <li key={i} className="text-sm flex gap-2">
            <span className="text-primary">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Mapa do Avatar {studentName && `- ${studentName}`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !formData ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Formulário não encontrado ou não preenchido.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {formData.is_completed ? (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Formulário Completo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Em Progresso</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Última atualização: {new Date(formData.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Nicho Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Nicho e Promessa
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Nicho</p>
                    <p className="font-medium">{formData.nicho || "Não preenchido"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Subnicho</p>
                    <p className="font-medium">{formData.subnicho || "Não preenchido"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase mb-1">ROMA</p>
                    <p className="text-sm">{formData.roma || "Não preenchido"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Characteristics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Características do Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Idade</p>
                    <p className="font-medium">{formData.avatar_idade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Gênero</p>
                    <p className="font-medium capitalize">{formData.avatar_sexo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Faixa Salarial</p>
                    <p className="font-medium">{formData.avatar_salario || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Profissão</p>
                    <p className="font-medium">{formData.avatar_profissao || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Religião</p>
                    <p className="font-medium">{formData.avatar_religiao || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Orientação Política</p>
                    <p className="font-medium">{formData.avatar_orientacao_politica || "-"}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Momento de Vida</p>
                    <p className="text-sm">{formData.avatar_momento_vida || "Não preenchido"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Dores */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-destructive" />
                    Dores do Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Dores Pessoais</p>
                    {renderItems(formData.dores_pessoais, "Nenhuma dor pessoal registrada")}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Dores Profissionais</p>
                    {renderItems(formData.dores_profissionais, "Nenhuma dor profissional registrada")}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Dores Emocionais</p>
                    {renderItems(formData.dores_emocionais, "Nenhuma dor emocional registrada")}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Dores de Relacionamento</p>
                    {renderItems(formData.dores_relacionamento, "Nenhuma dor de relacionamento registrada")}
                  </div>
                </CardContent>
              </Card>

              {/* Desejos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    Desejos do Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Desejos Pessoais</p>
                    {renderItems(formData.desejos_pessoais, "Nenhum desejo pessoal registrado")}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Desejos Profissionais</p>
                    {renderItems(formData.desejos_profissionais, "Nenhum desejo profissional registrado")}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Desejos Financeiros</p>
                    {renderItems(formData.desejos_financeiros, "Nenhum desejo financeiro registrado")}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo */}
              {formData.resumo_avatar && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Resumo do Avatar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">"{formData.resumo_avatar}"</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
