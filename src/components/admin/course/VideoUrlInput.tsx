import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Video, ExternalLink, AlertCircle, Sparkles, Loader2, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface VideoUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onDurationDetected?: (minutes: number) => void;
  lessonTitle?: string;
  customThumbnail?: string | null;
  onThumbnailChange?: (url: string | null) => void;
}

type VideoType = "youtube" | "vimeo" | "direct" | "calendar" | "unknown";

interface VideoInfo {
  type: VideoType;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

const VideoUrlInput = ({ 
  value, 
  onChange, 
  onDurationDetected,
  lessonTitle,
  customThumbnail,
  onThumbnailChange
}: VideoUrlInputProps) => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingThumb, setGeneratingThumb] = useState(false);

  useEffect(() => {
    if (value) {
      const info = detectVideoType(value);
      setVideoInfo(info);
    } else {
      setVideoInfo(null);
    }
  }, [value]);

  const detectVideoType = (url: string): VideoInfo => {
    // Calendar detection (Google Calendar, Calendly, Cal.com, etc.)
    if (url.includes("calendar.google.com") || 
        url.includes("calendly.com") || 
        url.includes("cal.com") ||
        url.includes("acuityscheduling.com")) {
      return {
        type: "calendar",
        embedUrl: null,
        thumbnailUrl: null
      };
    }

    // YouTube detection (includes live and shorts)
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      };
    }

    // Vimeo detection
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return {
        type: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        thumbnailUrl: null
      };
    }

    // Direct video URL
    if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return {
        type: "direct",
        embedUrl: url,
        thumbnailUrl: null
      };
    }

    return {
      type: "unknown",
      embedUrl: null,
      thumbnailUrl: null
    };
  };

  const generateAIThumbnail = async () => {
    if (!value || !onThumbnailChange) return;

    setGeneratingThumb(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video-thumbnail", {
        body: { 
          videoTitle: lessonTitle || "Aula",
          style: "professional, educational, premium, empowering"
        }
      });

      if (error) throw error;
      if (data?.thumbnailUrl) {
        onThumbnailChange(data.thumbnailUrl);
        toast.success("Thumbnail gerada com IA!");
      }
    } catch (error: any) {
      console.error("Error generating thumbnail:", error);
      if (error.message?.includes("429")) {
        toast.error("Limite atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos insuficientes.");
      } else {
        toast.error("Erro ao gerar thumbnail");
      }
    } finally {
      setGeneratingThumb(false);
    }
  };

  const getTypeLabel = (type: VideoType) => {
    switch (type) {
      case "youtube":
        return { label: "YouTube", icon: Youtube, color: "bg-red-500/10 text-red-500" };
      case "vimeo":
        return { label: "Vimeo", icon: Video, color: "bg-blue-500/10 text-blue-500" };
      case "direct":
        return { label: "URL Direta", icon: ExternalLink, color: "bg-green-500/10 text-green-500" };
      case "calendar":
        return { label: "Calendário", icon: Calendar, color: "bg-secondary/10 text-secondary" };
      default:
        return { label: "Desconhecido", icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-500" };
    }
  };

  const typeInfo = videoInfo ? getTypeLabel(videoInfo.type) : null;
  const displayThumbnail = customThumbnail || videoInfo?.thumbnailUrl;

  return (
    <div className="space-y-3">
      <Label>URL do Vídeo</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole o link do YouTube, Vimeo ou URL direta do vídeo"
          className="pr-24"
        />
        {videoInfo && (
          <Badge 
            variant="secondary" 
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${typeInfo?.color}`}
          >
            {typeInfo && <typeInfo.icon className="w-3 h-3 mr-1" />}
            {typeInfo?.label}
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Suportado: YouTube (não listado), Vimeo, ou URL direta (.mp4, .webm)
      </p>

      {/* Warning for calendar links */}
      {videoInfo?.type === 'calendar' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-600">Link de Calendário Detectado</p>
            <p className="text-muted-foreground text-xs mt-1">
              Para links de agendamento, altere o "Tipo de Conteúdo" para "Agendamento" acima e cole o link no campo apropriado.
            </p>
          </div>
        </div>
      )}

      {/* AI Thumbnail Generation */}
      {value && onThumbnailChange && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAIThumbnail}
            disabled={generatingThumb}
            className="gap-2"
          >
            {generatingThumb ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Gerar Thumb IA
          </Button>
          {customThumbnail && (
            <>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onThumbnailChange(null)}
                className="h-7 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                YouTube
              </Button>
            </>
          )}
        </div>
      )}

      {/* Preview */}
      {videoInfo && videoInfo.embedUrl && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-secondary hover:underline"
          >
            {showPreview ? "Ocultar preview" : "Ver preview"}
          </button>
          
          {showPreview && (
            <div className="mt-2 rounded-lg overflow-hidden border border-border">
              {videoInfo.type === "youtube" || videoInfo.type === "vimeo" ? (
                <iframe
                  src={videoInfo.embedUrl}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoInfo.type === "direct" ? (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  className="w-full aspect-video"
                />
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Thumbnail preview */}
      {displayThumbnail && !showPreview && (
        <div 
          className="relative w-32 h-20 rounded-lg overflow-hidden border border-border cursor-pointer group"
          onClick={() => setShowPreview(true)}
        >
          <img 
            src={displayThumbnail} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Video className="w-6 h-6 text-white" />
          </div>
          {customThumbnail && (
            <div className="absolute top-1 left-1">
              <Badge className="bg-purple-500/90 text-white text-[10px] px-1 py-0">
                IA
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUrlInput;
