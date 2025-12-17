import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, X } from "lucide-react";

interface Course {
  id?: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
  is_published: boolean;
  is_subscription: boolean;
}

interface CourseBasicInfoTabProps {
  course: Partial<Course>;
  onChange: (course: Partial<Course>) => void;
}

const CourseBasicInfoTab = ({ course, onChange }: CourseBasicInfoTabProps) => {
  const { toast } = useToast();
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }

    setUploadingThumbnail(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(fileName);

      onChange({ ...course, thumbnail_url: publicUrl });
      toast({ title: "Thumbnail enviada!" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const removeThumbnail = () => {
    onChange({ ...course, thumbnail_url: null });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Curso *</Label>
            <Input
              id="title"
              value={course.title || ""}
              onChange={(e) => onChange({ ...course, title: e.target.value })}
              placeholder="Ex: Mentoria Soberana Completa"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={course.description || ""}
              onChange={(e) => onChange({ ...course, description: e.target.value })}
              placeholder="Descreva o curso, seus benefícios e o que o aluno vai aprender..."
              rows={6}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={course.price || ""}
              onChange={(e) => onChange({ 
                ...course, 
                price: e.target.value ? parseFloat(e.target.value) : null 
              })}
              placeholder="0.00 (deixe vazio para gratuito)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deixe em branco para curso gratuito
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <div>
            <Label>Thumbnail do Curso</Label>
            <div className="mt-1">
              {course.thumbnail_url ? (
                <div className="relative group">
                  <img
                    src={course.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full aspect-video object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeThumbnail}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-secondary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                  />
                  {uploadingThumbnail ? (
                    <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Image className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique para enviar thumbnail
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recomendado: 1280x720px
                      </p>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ou cole uma URL direta:
            </p>
            <Input
              value={course.thumbnail_url || ""}
              onChange={(e) => onChange({ ...course, thumbnail_url: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          {/* Switches */}
          <div className="card-elegant p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Assinatura</Label>
                <p className="text-xs text-muted-foreground">
                  Acesso por período determinado
                </p>
              </div>
              <Switch
                checked={course.is_subscription || false}
                onCheckedChange={(checked) => onChange({ ...course, is_subscription: checked })}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Publicado</Label>
                <p className="text-xs text-muted-foreground">
                  Visível para alunos
                </p>
              </div>
              <Switch
                checked={course.is_published || false}
                onCheckedChange={(checked) => onChange({ ...course, is_published: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfoTab;
