import { useState, useRef } from "react";
import { Paperclip, Image, FileAudio, FileText, Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaUploadButtonProps {
  conversationId: string;
  phone: string;
  onMediaSent: () => void;
  disabled?: boolean;
  onOpenTemplates?: () => void;
}

type MediaType = "image" | "audio" | "document";

const ACCEPTED_TYPES: Record<MediaType, string> = {
  image: "image/jpeg,image/png,image/gif,image/webp",
  audio: "audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/m4a",
  document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt",
};

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export function MediaUploadButton({ 
  conversationId, 
  phone, 
  onMediaSent,
  disabled,
  onOpenTemplates,
}: MediaUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectType = (type: MediaType) => {
    setSelectedType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = ACCEPTED_TYPES[type];
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    // Reset input for next selection
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande", {
        description: "O tamanho máximo é 16MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `${conversationId}/${timestamp}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("whatsapp-media")
        .upload(filename, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("whatsapp-media")
        .getPublicUrl(filename);

      const mediaUrl = urlData.publicUrl;

      // Send media via edge function
      const { error: sendError } = await supabase.functions.invoke("send-whatsapp-media", {
        body: {
          phone,
          mediaUrl,
          mediaType: selectedType,
          filename: file.name,
          conversationId,
          mimetype: file.type,
          fileSize: file.size,
        },
      });

      if (sendError) throw sendError;

      toast.success("Mídia enviada com sucesso");
      onMediaSent();
    } catch (error) {
      console.error("Error sending media:", error);
      toast.error("Erro ao enviar mídia", {
        description: "Tente novamente",
      });
    } finally {
      setUploading(false);
      setSelectedType(null);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full flex-shrink-0 text-muted-foreground touch-target",
                  "hover:text-primary hover:bg-primary/10 transition-colors"
                )}
                disabled={disabled || uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs hidden sm:block">
            Anexar
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="start" side="top" className="w-48">
          <DropdownMenuItem onClick={() => handleSelectType("image")} className="py-2.5">
            <Image className="h-4 w-4 mr-3 text-blue-500" />
            Imagem
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectType("audio")} className="py-2.5">
            <FileAudio className="h-4 w-4 mr-3 text-purple-500" />
            Áudio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectType("document")} className="py-2.5">
            <FileText className="h-4 w-4 mr-3 text-orange-500" />
            Documento
          </DropdownMenuItem>
          
          {onOpenTemplates && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenTemplates} className="py-2.5">
                <MessageSquareText className="h-4 w-4 mr-3 text-emerald-500" />
                Templates
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
