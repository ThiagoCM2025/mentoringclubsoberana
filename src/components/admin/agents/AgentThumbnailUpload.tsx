import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, ImageIcon, Sparkles } from "lucide-react";

interface AgentThumbnailUploadProps {
  value: string;
  onChange: (url: string) => void;
  agentSlug?: string;
  agentTitle?: string;
  categoryName?: string;
  categoryColor?: string;
}

export function AgentThumbnailUpload({
  value,
  onChange,
  agentSlug,
  agentTitle,
  categoryName,
  categoryColor,
}: AgentThumbnailUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Use imagens JPG, PNG ou WEBP.",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 2MB.",
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Generate file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${agentSlug || "agent"}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("agent-thumbnails")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("agent-thumbnails").getPublicUrl(fileName);

      onChange(publicUrl);

      toast({
        title: "Upload concluído",
        description: "A imagem foi enviada com sucesso.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem.",
      });
      setPreview(value);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!agentTitle) {
      toast({
        variant: "destructive",
        title: "Título obrigatório",
        description: "Preencha o título do agente antes de gerar a imagem.",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-agent-thumbnail", {
        body: {
          agentTitle,
          categoryName: categoryName || "Assistente IA",
          categoryColor: categoryColor || "purple",
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.thumbnail_url) {
        setPreview(data.thumbnail_url);
        onChange(data.thumbnail_url);
        toast({
          title: "Imagem gerada!",
          description: "A thumbnail foi criada com IA e salva automaticamente.",
        });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        variant: "destructive",
        title: "Erro na geração",
        description: error instanceof Error ? error.message : "Não foi possível gerar a imagem com IA.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview || value ? (
        <div className="relative group">
          <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={preview || value}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || generating}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="ml-2">Trocar</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGenerateWithAI}
              disabled={uploading || generating}
              className="bg-secondary/20 border-secondary/50 hover:bg-secondary/30"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="ml-2">Regenerar</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading || generating}
            >
              <X className="w-4 h-4" />
              <span className="ml-2">Remover</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || generating}
              className="flex-1 aspect-video max-w-[200px] rounded-lg border-2 border-dashed border-border hover:border-secondary/50 bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Enviando...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs">Upload manual</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={uploading || generating}
              className="flex-1 aspect-video max-w-[200px] rounded-lg border-2 border-dashed border-secondary/30 hover:border-secondary/60 bg-secondary/5 hover:bg-secondary/10 transition-colors flex flex-col items-center justify-center gap-2 text-secondary hover:text-secondary"
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Gerando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span className="text-xs font-medium">✨ Gerar com IA</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WEBP (máx. 2MB) ou gere automaticamente com IA
          </p>
        </div>
      )}
    </div>
  );
}
