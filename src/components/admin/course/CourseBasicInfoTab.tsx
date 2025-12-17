import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image, X, FileText, Settings, Sparkles, Package } from "lucide-react";
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
  onProgramSelected?: (program: Program) => void;
}

const tierConfig = {
  entry: { label: "Entry", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  mid: { label: "Premium", color: "bg-secondary/20 text-secondary border-secondary/30" },
  elite: { label: "Elite", color: "bg-primary/20 text-primary border-primary/30" },
};

const CourseBasicInfoTab = ({ course, onChange, onProgramSelected }: CourseBasicInfoTabProps) => {
  const { toast } = useToast();
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const fillFromProgram = (program: Program) => {
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

    if (onProgramSelected) {
      onProgramSelected(program);
    }

    toast({
      title: `Dados do "${program.subtitle}" carregados!`,
      description: program.modules 
        ? `${program.modules.length} módulos serão criados automaticamente ao salvar.`
        : "Você pode editar os campos conforme necessário.",
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

  const selectedProgramData = selectedProgram ? programsList.find(p => p.slug === selectedProgram) : null;

  return (
    <div className="space-y-8">
      {/* Section: Program Selector */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-secondary/20">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Jornada Soberana</h3>
            <p className="text-sm text-muted-foreground">
              Selecione um programa para pré-preencher automaticamente
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {programsList.map((program) => {
            const IconComponent = program.icon;
            const tier = tierConfig[program.tier];
            const isSelected = selectedProgram === program.slug;
            
            return (
              <button
                key={program.slug}
                type="button"
                onClick={() => fillFromProgram(program)}
                className={`p-4 rounded-xl border-2 transition-all text-left group relative overflow-hidden ${
                  isSelected 
                    ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20" 
                    : "border-border hover:border-muted-foreground bg-card hover:bg-muted"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary animate-pulse" />
                )}
                <IconComponent className={`w-7 h-7 mb-3 ${isSelected ? "text-secondary" : "text-muted-foreground group-hover:text-secondary"} transition-colors`} />
                <p className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
                  {program.subtitle}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full border ${tier.color}`}>
                  {tier.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pending Modules Preview */}
        {selectedProgramData?.modules && selectedProgramData.modules.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/10 border border-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                {selectedProgramData.modules.length} módulos serão criados automaticamente:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedProgramData.modules.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="truncate">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section: Basic Info */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/20">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Dados Básicos</h3>
            <p className="text-sm text-muted-foreground">Informações principais do curso</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <Label htmlFor="title" className="text-foreground font-medium text-sm mb-2 block">
                Título do Curso <span className="text-primary">*</span>
              </Label>
              <Input
                id="title"
                value={course.title || ""}
                onChange={(e) => onChange({ ...course, title: e.target.value })}
                placeholder="Ex: Mentoria Soberana Completa"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-secondary/20 h-11"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground font-medium text-sm mb-2 block">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={course.description || ""}
                onChange={(e) => onChange({ ...course, description: e.target.value })}
                placeholder="Descreva o curso, seus benefícios e o que o aluno vai aprender..."
                rows={6}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-secondary/20 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="price" className="text-foreground font-medium text-sm mb-2 block">
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={course.price || ""}
                onChange={(e) => onChange({ 
                  ...course, 
                  price: e.target.value ? parseFloat(e.target.value) : null 
                })}
                placeholder="0.00"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-secondary/20 h-11"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Deixe em branco para curso gratuito
              </p>
            </div>
          </div>

          {/* Right Column: Thumbnail */}
          <div>
            <Label className="text-foreground font-medium text-sm mb-2 block">
              Thumbnail do Curso
            </Label>
            <div className="space-y-3">
              {course.thumbnail_url ? (
                <div className="relative group">
                  <img
                    src={course.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full aspect-video object-cover rounded-xl border-2 border-border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeThumbnail}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-secondary/50 bg-muted/50 transition-all hover:bg-muted group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                  />
                  {uploadingThumbnail ? (
                    <div className="animate-spin w-10 h-10 border-3 border-secondary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-muted group-hover:bg-secondary/20 transition-colors mb-3">
                        <Image className="w-8 h-8 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Clique para enviar thumbnail
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recomendado: 1280x720px
                      </p>
                    </>
                  )}
                </label>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Ou cole uma URL direta:
                </p>
                <Input
                  value={course.thumbnail_url || ""}
                  onChange={(e) => onChange({ ...course, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-secondary/20 h-10 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Settings */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Configurações</h3>
            <p className="text-sm text-muted-foreground">Opções de acesso e visibilidade</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div>
              <Label className="text-foreground font-medium">Assinatura</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Acesso por período determinado
              </p>
            </div>
            <Switch
              checked={course.is_subscription || false}
              onCheckedChange={(checked) => onChange({ ...course, is_subscription: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div>
              <Label className="text-foreground font-medium">Publicado</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Visível para alunos
              </p>
            </div>
            <Switch
              checked={course.is_published || false}
              onCheckedChange={(checked) => onChange({ ...course, is_published: checked })}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseBasicInfoTab;
