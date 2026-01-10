import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
}

export function WelcomeVideoModal({ open, onOpenChange, videoUrl }: WelcomeVideoModalProps) {
  if (!videoUrl) return null;

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-secondary/20 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 text-white hover:bg-white/20 rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="aspect-video w-full">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Vídeo de Boas-Vindas"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Não foi possível carregar o vídeo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
