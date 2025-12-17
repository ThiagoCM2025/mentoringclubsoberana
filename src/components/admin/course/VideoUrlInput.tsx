import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Youtube, Video, ExternalLink, AlertCircle } from "lucide-react";

interface VideoUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onDurationDetected?: (minutes: number) => void;
}

type VideoType = "youtube" | "vimeo" | "direct" | "unknown";

interface VideoInfo {
  type: VideoType;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

const VideoUrlInput = ({ value, onChange, onDurationDetected }: VideoUrlInputProps) => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (value) {
      const info = detectVideoType(value);
      setVideoInfo(info);
    } else {
      setVideoInfo(null);
    }
  }, [value]);

  const detectVideoType = (url: string): VideoInfo => {
    // YouTube detection
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
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

  const getTypeLabel = (type: VideoType) => {
    switch (type) {
      case "youtube":
        return { label: "YouTube", icon: Youtube, color: "bg-red-500/10 text-red-500" };
      case "vimeo":
        return { label: "Vimeo", icon: Video, color: "bg-blue-500/10 text-blue-500" };
      case "direct":
        return { label: "URL Direta", icon: ExternalLink, color: "bg-green-500/10 text-green-500" };
      default:
        return { label: "Desconhecido", icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-500" };
    }
  };

  const typeInfo = videoInfo ? getTypeLabel(videoInfo.type) : null;

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

      {/* Thumbnail preview for YouTube */}
      {videoInfo?.thumbnailUrl && !showPreview && (
        <div 
          className="relative w-32 h-20 rounded-lg overflow-hidden border border-border cursor-pointer group"
          onClick={() => setShowPreview(true)}
        >
          <img 
            src={videoInfo.thumbnailUrl} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Video className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUrlInput;
