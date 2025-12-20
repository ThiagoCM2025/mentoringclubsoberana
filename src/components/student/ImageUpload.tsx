import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string | null;
  onRemove?: () => void;
  className?: string;
}

export const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  onRemove,
  className 
}: ImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from("community-images")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("community-images")
        .getPublicUrl(fileName);

      onImageUpload(publicUrl);
      
      toast({
        title: "Imagem enviada!",
        description: "A imagem foi adicionada à sua publicação.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setPreview(null);
      toast({
        title: "Erro ao enviar imagem",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-lg overflow-hidden"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-secondary/30 rounded-lg hover:border-secondary/50 hover:bg-secondary/5 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                <span className="text-cream/60 text-sm">Enviando...</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-5 h-5 text-secondary" />
                <span className="text-cream/60 text-sm">Adicionar imagem (opcional)</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;