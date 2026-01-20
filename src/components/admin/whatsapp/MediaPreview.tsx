import { useState } from "react";
import { FileText, Download, Play, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaLightbox } from "./MediaLightbox";

interface MediaPreviewProps {
  mediaUrl: string;
  mediaType: string;
  mediaFilename?: string | null;
  mediaMimetype?: string | null;
  isOutgoing: boolean;
}

export function MediaPreview({
  mediaUrl,
  mediaType,
  mediaFilename,
  mediaMimetype,
  isOutgoing,
}: MediaPreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getFileIcon = () => {
    if (mediaMimetype?.includes("pdf")) return "📄";
    if (mediaMimetype?.includes("word") || mediaMimetype?.includes("document")) return "📝";
    if (mediaMimetype?.includes("excel") || mediaMimetype?.includes("spreadsheet")) return "📊";
    if (mediaMimetype?.includes("powerpoint") || mediaMimetype?.includes("presentation")) return "📽️";
    return "📎";
  };

  const formatFilename = (name: string) => {
    if (name.length > 25) {
      const ext = name.split(".").pop();
      return name.substring(0, 20) + "..." + (ext ? `.${ext}` : "");
    }
    return name;
  };

  if (mediaType === "image") {
    return (
      <>
        <div 
          className="relative cursor-pointer group max-w-[280px] rounded-lg overflow-hidden"
          onClick={() => setLightboxOpen(true)}
        >
          {imageError ? (
            <div className="flex items-center justify-center w-full h-32 bg-muted/50 rounded-lg">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt="Imagem"
              className="w-full h-auto rounded-lg shadow-sm transition-transform group-hover:scale-[1.02]"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
        </div>
        
        <MediaLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          mediaUrl={mediaUrl}
          mediaType="image"
        />
      </>
    );
  }

  if (mediaType === "audio") {
    return (
      <div className="max-w-[280px]">
        <audio 
          controls 
          className="w-full h-10"
          preload="metadata"
        >
          <source src={mediaUrl} type={mediaMimetype || "audio/mpeg"} />
          Seu navegador não suporta áudio.
        </audio>
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <>
        <div 
          className="relative cursor-pointer group max-w-[280px] rounded-lg overflow-hidden"
          onClick={() => setLightboxOpen(true)}
        >
          <video
            src={mediaUrl}
            className="w-full h-auto rounded-lg shadow-sm"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-6 w-6 text-gray-800 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
        
        <MediaLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          mediaUrl={mediaUrl}
          mediaType="video"
        />
      </>
    );
  }

  // Document type
  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg max-w-[280px] transition-colors",
        isOutgoing 
          ? "bg-[#c7f8ba] dark:bg-[#004438] hover:bg-[#b8f0a8] dark:hover:bg-[#003830]"
          : "bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600"
      )}
    >
      <div className="flex-shrink-0 text-2xl">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {mediaFilename ? formatFilename(mediaFilename) : "Documento"}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase">
          {mediaMimetype?.split("/")[1] || "arquivo"}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </a>
  );
}
