import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Video, ExternalLink, AlertCircle, Loader2, Play, X, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WelcomeVideoSectionProps {
  value: string;
  duration: number | null;
  customThumbnail?: string | null;
  courseTitle?: string;
  onChange: (url: string) => void;
  onDurationChange: (minutes: number | null) => void;
  onThumbnailChange?: (url: string | null) => void;
}

type VideoType = "youtube" | "vimeo" | "direct" | "unknown";

interface VideoInfo {
  type: VideoType;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

const WelcomeVideoSection = ({ 
  value, 
  duration,
  customThumbnail,
  courseTitle,
  onChange, 
  onDurationChange,
  onThumbnailChange
}: WelcomeVideoSectionProps) => {
  const { toast } = useToast();
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fetchingDuration, setFetchingDuration] = useState(false);
  const [generatingThumb, setGeneratingThumb] = useState(false);

  useEffect(() => {
    if (value) {
      const info = detectVideoType(value);
      setVideoInfo(info);
      
      // Auto-fetch duration for YouTube
      if (info.type === "youtube" && !duration) {
        fetchYouTubeDuration(value);
      }
    } else {
      setVideoInfo(null);
    }
  }, [value]);

  const fetchYouTubeDuration = async (url: string) => {
    setFetchingDuration(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-video-info', {
        body: { videoUrl: url }
      });

      if (error) throw error;

      if (data?.durationMinutes) {
        onDurationChange(data.durationMinutes);
        toast({
          title: "Duração detectada!",
          description: `${data.durationMinutes} minutos (${data.title})`,
        });
      }
    } catch (error) {
      console.error("Error fetching YouTube duration:", error);
    } finally {
      setFetchingDuration(false);
    }
  };

  const generateAIThumbnail = async () => {
    if (!value || !onThumbnailChange) return;

    setGeneratingThumb(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video-thumbnail", {
        body: { 
          videoTitle: courseTitle || "Vídeo de Boas-Vindas",
          style: "professional, welcoming, empowering, premium education"
        }
      });

      if (error) throw error;
      if (data?.thumbnailUrl) {
        onThumbnailChange(data.thumbnailUrl);
        toast({
          title: "Thumbnail gerada!",
          description: "Thumbnail personalizada criada com IA",
        });
      }
    } catch (error: any) {
      console.error("Error generating thumbnail:", error);
      if (error.message?.includes("429")) {
        toast({
          title: "Limite atingido",
          description: "Tente novamente em alguns minutos",
          variant: "destructive"
        });
      } else if (error.message?.includes("402")) {
        toast({
          title: "Créditos insuficientes",
          description: "Adicione créditos ao workspace",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível gerar thumbnail",
          variant: "destructive"
        });
      }
    } finally {
      setGeneratingThumb(false);
    }
  };

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
  const displayThumbnail = customThumbnail || videoInfo?.thumbnailUrl;

  const clearVideo = () => {
    onChange("");
    onDurationChange(null);
    if (onThumbnailChange) onThumbnailChange(null);
    setVideoInfo(null);
    setShowPreview(false);
  };

  return (
    <section className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-secondary/20">
          <Play className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Vídeo de Boas-Vindas</h3>
          <p className="text-sm text-muted-foreground">
            Vídeo que será exibido no onboarding do curso
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: URL Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Vídeo de Boas-Vindas</Label>
            <div className="relative">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Cole o link do YouTube, Vimeo ou URL direta do vídeo"
                className="pr-28"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Duração (minutos)
                {fetchingDuration && <Loader2 className="w-3 h-3 animate-spin text-secondary" />}
              </Label>
              <Input
                type="number"
                value={duration || ""}
                onChange={(e) => onDurationChange(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Auto-detectado"
              />
            </div>
            
            {value && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearVideo}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Remover
                </Button>
              </div>
            )}
          </div>

          {/* AI Thumbnail Generation */}
          {value && onThumbnailChange && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onThumbnailChange(null)}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Usar YouTube
                  </Button>
                )}
              </div>
              {customThumbnail && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Thumb IA Ativa
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div>
          {videoInfo && videoInfo.embedUrl ? (
            <div className="space-y-3">
              {showPreview ? (
                <div className="rounded-xl overflow-hidden border border-border">
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
              ) : displayThumbnail ? (
                <div 
                  className="relative rounded-xl overflow-hidden border border-border cursor-pointer group"
                  onClick={() => setShowPreview(true)}
                >
                  <img 
                    src={displayThumbnail} 
                    alt="Video thumbnail" 
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-secondary/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-secondary-foreground ml-1" />
                    </div>
                  </div>
                  {customThumbnail && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-purple-500/90 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        IA
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:border-secondary/50 transition-colors"
                  onClick={() => setShowPreview(true)}
                >
                  <div className="text-center">
                    <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para ver preview</p>
                  </div>
                </div>
              )}
              
              {showPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="text-muted-foreground"
                >
                  Ocultar preview
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50">
              <div className="text-center">
                <Video className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cole a URL do vídeo para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WelcomeVideoSection;
