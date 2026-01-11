import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image, X, FileText, Settings, Sparkles, Package, AlertCircle, CheckCircle2, Crosshair, RotateCcw } from "lucide-react";
import { programsList, Program } from "@/data/programs";
import { cn } from "@/lib/utils";
import WelcomeVideoSection from "./WelcomeVideoSection";

const courseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo (máx. 200 caracteres)"),
  description: z.string().optional().nullable(),
  thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")).nullable(),
  thumbnail_position: z.string().optional().nullable(),
  price: z.number().min(0, "Preço não pode ser negativo").optional().nullable(),
  is_published: z.boolean(),
  is_subscription: z.boolean(),
  welcome_video_url: z.string().optional().nullable(),
  welcome_video_duration: z.number().optional().nullable(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id?: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  thumbnail_position: string | null;
  price: number | null;
  is_published: boolean;
  is_subscription: boolean;
  welcome_video_url: string | null;
  welcome_video_duration: number | null;
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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title || "",
      description: course.description || "",
      thumbnail_url: course.thumbnail_url || "",
      thumbnail_position: course.thumbnail_position || "50% 50%",
      price: course.price ?? undefined,
      is_published: course.is_published || false,
      is_subscription: course.is_subscription || false,
      welcome_video_url: course.welcome_video_url || "",
      welcome_video_duration: course.welcome_video_duration ?? undefined,
    },
    mode: "onBlur",
  });

  // Watch all values to sync with parent
  const watchedValues = watch();

  // Sync form values with parent onChange
  useEffect(() => {
    onChange({
      ...course,
      title: watchedValues.title,
      description: watchedValues.description || null,
      thumbnail_url: watchedValues.thumbnail_url || null,
      thumbnail_position: watchedValues.thumbnail_position || "50% 50%",
      price: watchedValues.price ?? null,
      is_published: watchedValues.is_published,
      is_subscription: watchedValues.is_subscription,
      welcome_video_url: watchedValues.welcome_video_url || null,
      welcome_video_duration: watchedValues.welcome_video_duration ?? null,
    });
  }, [watchedValues.title, watchedValues.description, watchedValues.thumbnail_url, watchedValues.thumbnail_position, watchedValues.price, watchedValues.is_published, watchedValues.is_subscription, watchedValues.welcome_video_url, watchedValues.welcome_video_duration]);

  // Update form when course prop changes (e.g., from program selection)
  useEffect(() => {
    setValue("title", course.title || "");
    setValue("description", course.description || "");
    setValue("thumbnail_url", course.thumbnail_url || "");
    setValue("thumbnail_position", (course.thumbnail_position as "top" | "center" | "bottom") || "center");
    setValue("price", course.price ?? undefined);
    setValue("is_published", course.is_published || false);
    setValue("is_subscription", course.is_subscription || false);
    setValue("welcome_video_url", course.welcome_video_url || "");
    setValue("welcome_video_duration", course.welcome_video_duration ?? undefined);
  }, [course.title, course.description, course.thumbnail_url, course.thumbnail_position, course.price, course.is_published, course.is_subscription, course.welcome_video_url, course.welcome_video_duration, setValue]);

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    trigger(fieldName as keyof CourseFormData);
  };

  const fillFromProgram = (program: Program) => {
    let priceValue: number | null = null;
    if (program.price) {
      const numericPrice = program.price.replace(/[^\d,]/g, '').replace(',', '.');
      priceValue = numericPrice ? parseFloat(numericPrice) : null;
    }

    setValue("title", program.subtitle);
    setValue("description", program.fullDescription);
    setValue("thumbnail_url", program.image || "");
    setValue("price", priceValue ?? undefined);
    
    setSelectedProgram(program.slug);
    setTouchedFields(new Set()); // Reset touched fields

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

      setValue("thumbnail_url", publicUrl);
      toast({ title: "Thumbnail enviada!" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const removeThumbnail = () => {
    setValue("thumbnail_url", "");
  };

  const selectedProgramData = selectedProgram ? programsList.find(p => p.slug === selectedProgram) : null;
  
  const getFieldState = (fieldName: keyof CourseFormData) => {
    const hasError = !!errors[fieldName];
    const isTouched = touchedFields.has(fieldName);
    const value = watchedValues[fieldName];
    const isValid = isTouched && !hasError && value;
    return { hasError, isValid, isTouched };
  };

  const titleState = getFieldState("title");
  const thumbnailUrlState = getFieldState("thumbnail_url");
  const priceState = getFieldState("price");

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
            {/* Title Field with Validation */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-medium text-sm flex items-center gap-1">
                Título do Curso <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  {...register("title")}
                  onBlur={() => handleBlur("title")}
                  placeholder="Ex: Mentoria Soberana Completa"
                  className={cn(
                    "bg-background border-border text-foreground placeholder:text-muted-foreground h-11 pr-10 transition-colors",
                    titleState.hasError && "border-destructive focus-visible:ring-destructive/50",
                    titleState.isValid && "border-emerald-500 focus-visible:ring-emerald-500/50"
                  )}
                />
                {(titleState.hasError || titleState.isValid) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {titleState.hasError ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium text-sm">
                Descrição
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descreva o curso, seus benefícios e o que o aluno vai aprender..."
                rows={6}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-secondary/20 resize-none"
              />
            </div>

            {/* Price Field with Validation */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground font-medium text-sm">
                Preço (R$)
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  onBlur={() => handleBlur("price")}
                  placeholder="0.00"
                  className={cn(
                    "bg-background border-border text-foreground placeholder:text-muted-foreground h-11 pr-10 transition-colors",
                    priceState.hasError && "border-destructive focus-visible:ring-destructive/50",
                    priceState.isValid && "border-emerald-500 focus-visible:ring-emerald-500/50"
                  )}
                />
                {priceState.hasError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                )}
              </div>
              {errors.price ? (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.price.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para curso gratuito
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Thumbnail */}
          <div>
            <Label className="text-foreground font-medium text-sm mb-2 block">
              Thumbnail do Curso
            </Label>
            <div className="space-y-3">
              {watchedValues.thumbnail_url ? (
                <div className="space-y-4">
                  {/* Focal Point Selector */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Full Image with Click-to-Select Focal Point */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5" />
                          Clique para definir o ponto focal
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setValue("thumbnail_position", "50% 50%")}
                          className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Resetar
                        </Button>
                      </div>
                      <div 
                        className="relative cursor-crosshair rounded-xl overflow-hidden border-2 border-border hover:border-secondary/50 transition-colors"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                          setValue("thumbnail_position", `${x}% ${y}%`);
                        }}
                      >
                        <img
                          src={watchedValues.thumbnail_url}
                          alt="Clique para definir ponto focal"
                          className="w-full h-auto"
                          draggable={false}
                        />
                        {/* Focal Point Marker */}
                        {watchedValues.thumbnail_position && (
                          <div 
                            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{
                              left: watchedValues.thumbnail_position.split(' ')[0] || '50%',
                              top: watchedValues.thumbnail_position.split(' ')[1] || '50%',
                            }}
                          >
                            <div className="absolute inset-0 rounded-full bg-secondary/30 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-2 border-secondary bg-secondary/20" />
                            <div className="absolute inset-[6px] rounded-full bg-secondary" />
                          </div>
                        )}
                        {/* Crosshair Guides */}
                        {watchedValues.thumbnail_position && (
                          <>
                            <div 
                              className="absolute top-0 bottom-0 w-px bg-secondary/40 pointer-events-none"
                              style={{ left: watchedValues.thumbnail_position.split(' ')[0] || '50%' }}
                            />
                            <div 
                              className="absolute left-0 right-0 h-px bg-secondary/40 pointer-events-none"
                              style={{ top: watchedValues.thumbnail_position.split(' ')[1] || '50%' }}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preview in 16:9 aspect ratio */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">
                        Preview (como vai aparecer)
                      </span>
                      <div className="relative group">
                        <img
                          src={watchedValues.thumbnail_url}
                          alt="Preview"
                          className={cn(
                            "w-full aspect-video object-cover rounded-xl border-2",
                            thumbnailUrlState.hasError ? "border-destructive" : "border-border"
                          )}
                          style={{ 
                            objectPosition: watchedValues.thumbnail_position || '50% 50%' 
                          }}
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
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg py-2">
                        <span>Ponto focal:</span>
                        <code className="bg-background px-2 py-0.5 rounded font-mono text-foreground">
                          {watchedValues.thumbnail_position || '50% 50%'}
                        </code>
                      </div>
                    </div>
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

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Ou cole uma URL direta:
                </p>
                <div className="relative">
                  <Input
                    {...register("thumbnail_url")}
                    onBlur={() => handleBlur("thumbnail_url")}
                    placeholder="https://..."
                    className={cn(
                      "bg-background border-border text-foreground placeholder:text-muted-foreground h-10 text-sm pr-10 transition-colors",
                      thumbnailUrlState.hasError && "border-destructive focus-visible:ring-destructive/50"
                    )}
                  />
                  {thumbnailUrlState.hasError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                  )}
                </div>
                {errors.thumbnail_url && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.thumbnail_url.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Welcome Video */}
      <WelcomeVideoSection
        value={watchedValues.welcome_video_url || ""}
        duration={watchedValues.welcome_video_duration ?? null}
        onChange={(url) => setValue("welcome_video_url", url)}
        onDurationChange={(mins) => setValue("welcome_video_duration", mins ?? undefined)}
      />

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
              checked={watchedValues.is_subscription || false}
              onCheckedChange={(checked) => setValue("is_subscription", checked)}
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
              checked={watchedValues.is_published || false}
              onCheckedChange={(checked) => setValue("is_published", checked)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseBasicInfoTab;