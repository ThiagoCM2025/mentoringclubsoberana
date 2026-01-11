import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Video, Loader2, Save, Play, Sparkles, RefreshCw } from "lucide-react";

export function PlatformWelcomeVideoSection() {
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingThumb, setGeneratingThumb] = useState(false);
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailRefreshKey, setThumbnailRefreshKey] = useState(Date.now());

  // Convert total seconds to minutes and seconds
  const setDurationFromTotalSeconds = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setDurationMinutes(minutes);
    setDurationSeconds(seconds);
  };

  // Get total seconds from minutes and seconds
  const getTotalSeconds = () => durationMinutes * 60 + durationSeconds;

  useEffect(() => {
    fetchSettings();
  }, []);

  // Reset thumbnail error when URL changes
  useEffect(() => {
    setThumbnailError(false);
    setShowPreview(false);
  }, [videoUrl, customThumbnail]);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["welcome_video_url", "welcome_video_duration", "welcome_video_thumbnail"]);

      if (error) throw error;

      const urlSetting = data?.find(s => s.key === "welcome_video_url");
      const durationSetting = data?.find(s => s.key === "welcome_video_duration");
      const thumbSetting = data?.find(s => s.key === "welcome_video_thumbnail");

      if (urlSetting?.value) setVideoUrl(urlSetting.value);
      if (durationSetting?.value) {
        const totalSeconds = parseInt(durationSetting.value);
        setDurationFromTotalSeconds(totalSeconds);
      }
      if (thumbSetting?.value) setCustomThumbnail(thumbSetting.value);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Usar upsert para garantir que as configurações sejam salvas mesmo se não existirem
      const { error: urlError } = await supabase
        .from("platform_settings")
        .upsert(
          { key: "welcome_video_url", value: videoUrl || null },
          { onConflict: "key" }
        );

      if (urlError) throw urlError;

      // Update duration (stored as total seconds)
      const totalSeconds = getTotalSeconds();
      const { error: durationError } = await supabase
        .from("platform_settings")
        .upsert(
          { key: "welcome_video_duration", value: totalSeconds > 0 ? totalSeconds.toString() : null },
          { onConflict: "key" }
        );

      if (durationError) throw durationError;

      // Update custom thumbnail
      const { error: thumbError } = await supabase
        .from("platform_settings")
        .upsert(
          { key: "welcome_video_thumbnail", value: customThumbnail || null },
          { onConflict: "key" }
        );

      if (thumbError) throw thumbError;

      // Re-fetch para garantir sincronização
      await fetchSettings();
      toast.success("Vídeo de boas-vindas atualizado!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  async function detectDuration() {
    if (!videoUrl) return;

    setDetectingDuration(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-video-info", {
        body: { videoUrl: videoUrl }
      });

      if (error) throw error;
      if (data?.durationMinutes) {
        // Convert minutes to total seconds (API returns minutes, we store seconds)
        const totalSeconds = data.durationMinutes * 60;
        setDurationFromTotalSeconds(totalSeconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        toast.success(`Duração detectada: ${mins}min ${secs > 0 ? secs + 's' : ''}`);
      } else {
        toast.info("Não foi possível detectar automaticamente. Insira manualmente abaixo.");
      }
    } catch (error) {
      console.error("Error detecting duration:", error);
      toast.error("Erro na detecção. Insira a duração manualmente.");
    } finally {
      setDetectingDuration(false);
    }
  }

  async function generateAIThumbnail() {
    if (!videoUrl) return;

    setGeneratingThumb(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video-thumbnail", {
        body: { 
          videoTitle: "Vídeo de Boas-Vindas - Soberana Academy",
          style: "professional, welcoming, empowering, premium education"
        }
      });

      if (error) throw error;
      if (data?.thumbnailUrl) {
        setCustomThumbnail(data.thumbnailUrl);
        
        // Auto-save thumbnail to database usando upsert
        const { error: saveError } = await supabase
          .from("platform_settings")
          .upsert(
            { key: "welcome_video_thumbnail", value: data.thumbnailUrl },
            { onConflict: "key" }
          );
        
        if (saveError) {
          console.error("Error auto-saving thumbnail:", saveError);
          toast.success("Thumbnail gerada! Clique em 'Salvar' para persistir.");
        } else {
          toast.success("Thumbnail gerada e salva automaticamente!");
        }
      }
    } catch (error: any) {
      console.error("Error generating thumbnail:", error);
      if (error.message?.includes("429")) {
        toast.error("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else if (error.message?.includes("402")) {
        toast.error("Créditos insuficientes. Adicione créditos ao workspace.");
      } else {
        toast.error("Erro ao gerar thumbnail com IA");
      }
    } finally {
      setGeneratingThumb(false);
    }
  }

  const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    // Usar hqdefault como fallback (mais confiável que maxresdefault)
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg?t=${thumbnailRefreshKey}` : null;
  };

  const [refreshingYouTube, setRefreshingYouTube] = useState(false);

  const refreshYouTubeThumbnail = async () => {
    if (!videoUrl) return;

    setRefreshingYouTube(true);
    try {
      // Usar a edge function que já busca a melhor thumbnail disponível
      const { data, error: fetchError } = await supabase.functions.invoke("youtube-video-info", {
        body: { videoUrl }
      });

      if (fetchError) throw fetchError;

      if (!data?.thumbnailUrl) {
        toast.error("Não foi possível obter a thumbnail do YouTube");
        return;
      }

      // Adicionar cache-buster para forçar atualização
      const newThumbnailUrl = `${data.thumbnailUrl}?t=${Date.now()}`;
      
      // Salvar no banco usando upsert para garantir persistência
      const { error: saveError } = await supabase
        .from("platform_settings")
        .upsert(
          { key: "welcome_video_thumbnail", value: newThumbnailUrl },
          { onConflict: "key" }
        );

      if (saveError) throw saveError;

      setCustomThumbnail(newThumbnailUrl);
      setThumbnailRefreshKey(Date.now());
      setThumbnailError(false);
      setShowPreview(false);
      toast.success("Thumbnail do YouTube atualizada e salva!");
    } catch (error) {
      console.error("Error refreshing YouTube thumbnail:", error);
      toast.error("Erro ao atualizar thumbnail do YouTube");
    } finally {
      setRefreshingYouTube(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const youtubeThumbnail = videoUrl ? getYouTubeThumbnail(videoUrl) : null;
  const displayThumbnail = customThumbnail || youtubeThumbnail;
  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  if (loading) {
    return (
      <Card className="admin-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-card">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-foreground">
          <Video className="w-4 h-4 text-secondary" />
          Vídeo de Boas-Vindas da Plataforma
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Este vídeo aparecerá no card "BEM VINDA À PLATAFORMA" na página inicial das alunas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Form Side */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcome-video-url" className="text-sm text-foreground">
                URL do YouTube
              </Label>
              <div className="flex gap-2">
                <Input
                  id="welcome-video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1"
                />
                {videoUrl && (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                    YouTube
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">
                Duração
              </Label>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-1">
                  <Input
                    id="welcome-video-duration-min"
                    type="number"
                    placeholder="0"
                    value={durationMinutes || ""}
                    onChange={(e) => setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center"
                    min={0}
                  />
                  <span className="text-muted-foreground text-sm">min</span>
                </div>
                <span className="text-muted-foreground font-bold">:</span>
                <div className="flex items-center gap-1">
                  <Input
                    id="welcome-video-duration-sec"
                    type="number"
                    placeholder="0"
                    value={durationSeconds || ""}
                    onChange={(e) => setDurationSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 text-center"
                    min={0}
                    max={59}
                  />
                  <span className="text-muted-foreground text-sm">seg</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectDuration}
                  disabled={!videoUrl || detectingDuration}
                  className="gap-2"
                >
                  {detectingDuration ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Auto-detectar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIThumbnail}
                disabled={!videoUrl || generatingThumb}
                className="gap-2"
              >
                {generatingThumb ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Gerar Thumb IA
              </Button>
              {videoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={refreshYouTubeThumbnail}
                  disabled={refreshingYouTube}
                  className="gap-2"
                >
                  {refreshingYouTube ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Atualizar Thumb YouTube
                </Button>
              )}
            </div>

            {customThumbnail && (
              <div className="flex items-center gap-2">
                {customThumbnail.includes('supabase') ? (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Thumb IA Ativa
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                    Thumb YouTube Salva
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setCustomThumbnail(null);
                    await supabase
                      .from("platform_settings")
                      .update({ value: null })
                      .eq("key", "welcome_video_thumbnail");
                    toast.info("Thumbnail removida");
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-secondary hover:bg-secondary/90 text-black"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>

          {/* Preview Side */}
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Preview</Label>
            {videoUrl && displayThumbnail && !thumbnailError ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                {showPreview && embedUrl ? (
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-video relative cursor-pointer group"
                    onClick={() => setShowPreview(true)}
                  >
                    <img 
                      src={displayThumbnail} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover"
                      onError={() => setThumbnailError(true)}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-secondary/90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-black fill-black ml-1" />
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
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/50">
                <p className="text-sm text-muted-foreground">Cole uma URL do YouTube para ver o preview</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
