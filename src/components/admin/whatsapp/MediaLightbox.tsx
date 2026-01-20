import { useState } from "react";
import { X, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaLightboxProps {
  open: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "image" | "video";
}

export function MediaLightbox({ open, onClose, mediaUrl, mediaType }: MediaLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatsapp-media-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none overflow-hidden"
        onInteractOutside={onClose}
      >
        <DialogTitle className="sr-only">Visualizar mídia</DialogTitle>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {mediaType === "image" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetTransforms();
              onClose();
            }}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Media content */}
        <div 
          className="flex items-center justify-center w-full h-[90vh] overflow-auto"
          onClick={onClose}
        >
          {mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt="Visualização"
              className={cn(
                "max-w-full max-h-full object-contain transition-transform duration-200",
              )}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              Seu navegador não suporta vídeo.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
