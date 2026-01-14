import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface AgentThumbnailUploadProps {
  value: string;
  onChange: (url: string) => void;
  agentSlug?: string;
}

export function AgentThumbnailUpload({
  value,
  onChange,
  agentSlug,
}: AgentThumbnailUploadProps) {
  const [uploading, setUploading] = useState(false);
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
              disabled={uploading}
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
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
              <span className="ml-2">Remover</span>
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-sm aspect-video rounded-lg border-2 border-dashed border-border hover:border-secondary/50 bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Enviando...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">Clique para fazer upload</span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG ou WEBP (máx. 2MB)
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
