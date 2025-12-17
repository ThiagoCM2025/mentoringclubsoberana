import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image, X } from "lucide-react";
import { programsList, Program } from "@/data/programs";

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

const tierConfig = {
  entry: { label: "Entry", color: "text-emerald-500" },
  mid: { label: "Premium", color: "text-secondary" },
  elite: { label: "Elite", color: "text-primary" },
};

const CourseBasicInfoTab = ({ course, onChange }: CourseBasicInfoTabProps) => {
  const { toast } = useToast();
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const fillFromProgram = (program: Program) => {
    // Parse price if available (e.g., "R$ 299" -> 299)
    let priceValue: number | null = null;
    if (program.price) {
      const numericPrice = program.price.replace(/[^\d,]/g, '').replace(',', '.');
      priceValue = numericPrice ? parseFloat(numericPrice) : null;
    }

    onChange({
      ...course,
      title: program.subtitle,
      description: program.fullDescription,
      thumbnail_url: program.image || null,
      price: priceValue,
    });

    setSelectedProgram(program.slug);

    toast({
      title: `Dados do "${program.subtitle}" carregados!`,
      description: "Você pode editar os campos conforme necessário.",
    });
  };

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
      {/* Program Selector */}
      <div className="bg-zinc-900/50 border border-secondary/20 rounded-lg p-4">
        <Label className="text-cream">Selecionar Programa da Jornada Soberana</Label>
        <p className="text-xs text-cream/60 mb-3">
          Escolha um programa oficial para pré-preencher os dados automaticamente
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {programsList.map((program) => {
            const IconComponent = program.icon;
            const tier = tierConfig[program.tier];
            const isSelected = selectedProgram === program.slug;
            
            return (
              <button
                key={program.slug}
                type="button"
                onClick={() => fillFromProgram(program)}
                className={`p-3 rounded-lg border transition-all text-left group ${
                  isSelected 
                    ? "border-secondary bg-secondary/10" 
                    : "border-secondary/30 hover:border-secondary/60 bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                <IconComponent className={`w-6 h-6 mb-2 ${isSelected ? "text-secondary" : "text-cream/60 group-hover:text-secondary"}`} />
                <p className="text-sm font-medium text-cream line-clamp-2 mb-1">
                  {program.subtitle}
                </p>
                <span className={`text-xs ${tier.color}`}>
                  {tier.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-cream">Título do Curso *</Label>
            <Input
              id="title"
              value={course.title || ""}
              onChange={(e) => onChange({ ...course, title: e.target.value })}
              placeholder="Ex: Mentoria Soberana Completa"
              className="mt-1 bg-zinc-900 border-secondary/30 text-cream placeholder:text-cream/40"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-cream">Descrição</Label>
            <Textarea
              id="description"
              value={course.description || ""}
              onChange={(e) => onChange({ ...course, description: e.target.value })}
              placeholder="Descreva o curso, seus benefícios e o que o aluno vai aprender..."
              rows={6}
              className="mt-1 bg-zinc-900 border-secondary/30 text-cream placeholder:text-cream/40"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-cream">Preço (R$)</Label>
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
              className="mt-1 bg-zinc-900 border-secondary/30 text-cream placeholder:text-cream/40"
            />
            <p className="text-xs text-cream/60 mt-1">
              Deixe em branco para curso gratuito
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <div>
            <Label className="text-cream">Thumbnail do Curso</Label>
            <div className="mt-1">
              {course.thumbnail_url ? (
                <div className="relative group">
                  <img
                    src={course.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full aspect-video object-cover rounded-lg border border-secondary/30"
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
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-secondary/30 rounded-lg cursor-pointer hover:border-secondary/50 bg-zinc-900/50 transition-colors">
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
                      <Image className="w-12 h-12 text-cream/40 mb-2" />
                      <p className="text-sm text-cream/60">
                        Clique para enviar thumbnail
                      </p>
                      <p className="text-xs text-cream/40">
                        Recomendado: 1280x720px
                      </p>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-xs text-cream/60 mt-2">
              Ou cole uma URL direta:
            </p>
            <Input
              value={course.thumbnail_url || ""}
              onChange={(e) => onChange({ ...course, thumbnail_url: e.target.value })}
              placeholder="https://..."
              className="mt-1 bg-zinc-900 border-secondary/30 text-cream placeholder:text-cream/40"
            />
          </div>

          {/* Switches */}
          <div className="bg-zinc-900/50 border border-secondary/20 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-cream">Assinatura</Label>
                <p className="text-xs text-cream/60">
                  Acesso por período determinado
                </p>
              </div>
              <Switch
                checked={course.is_subscription || false}
                onCheckedChange={(checked) => onChange({ ...course, is_subscription: checked })}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary/20">
              <div>
                <Label className="text-cream">Publicado</Label>
                <p className="text-xs text-cream/60">
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
