import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Video, Calendar, FileText, ExternalLink, Play, Lock } from "lucide-react";
import { toast } from "sonner";

interface JornadaSession {
  id: string;
  jornada_slug: string;
  session_day: number;
  session_month: string;
  title: string;
  description: string | null;
  youtube_id: string | null;
  is_unlocked: boolean;
  materials_url: string | null;
  order_index: number;
}

export const JornadaSessionsManager = () => {
  const [sessions, setSessions] = useState<JornadaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jornada_sessions")
      .select("*")
      .eq("jornada_slug", "imobiliaria-2026")
      .order("order_index");

    if (error) {
      toast.error("Erro ao carregar sessões");
      console.error(error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const extractYouTubeId = (input: string): string => {
    if (!input) return "";
    
    // Se já é um ID (11 caracteres alfanuméricos)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
      return input.trim();
    }
    
    // Extrai de URLs do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    
    return input.trim();
  };

  const handleUpdateSession = async (session: JornadaSession, field: string, value: string | boolean) => {
    let processedValue = value;
    
    // Se for youtube_id, extrair o ID da URL se necessário
    if (field === "youtube_id" && typeof value === "string") {
      processedValue = extractYouTubeId(value);
    }

    setSessions(prev => 
      prev.map(s => s.id === session.id ? { ...s, [field]: processedValue } : s)
    );
  };

  const handleSaveSession = async (session: JornadaSession) => {
    setSaving(session.id);
    
    const { error } = await supabase
      .from("jornada_sessions")
      .update({
        youtube_id: session.youtube_id || null,
        is_unlocked: session.is_unlocked,
        materials_url: session.materials_url || null,
        description: session.description || null,
      })
      .eq("id", session.id);

    if (error) {
      toast.error("Erro ao salvar sessão");
      console.error(error);
    } else {
      toast.success(`Sessão do dia ${session.session_day} salva!`);
    }
    
    setSaving(null);
  };

  const getYouTubeThumbnail = (youtubeId: string | null) => {
    if (!youtubeId) return null;
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Jornada Imobiliária 2026
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure os vídeos e materiais de cada sessão da jornada
          </p>
        </div>
        <Badge variant="outline" className="text-secondary border-secondary">
          {sessions.filter(s => s.is_unlocked).length} de {sessions.length} liberadas
        </Badge>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className={`transition-all ${session.is_unlocked ? 'border-secondary/30' : 'border-muted'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${session.is_unlocked ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                    <span className="text-lg font-bold leading-none">{session.session_day}</span>
                    <span className="text-[10px] uppercase">{session.session_month}</span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium leading-tight">
                      {session.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {session.is_unlocked ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Liberada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Bloqueada
                        </Badge>
                      )}
                      {session.youtube_id && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          Vídeo
                        </Badge>
                      )}
                      {session.materials_url && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Material
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`unlock-${session.id}`} className="text-sm text-muted-foreground">
                    Desbloqueada
                  </Label>
                  <Switch
                    id={`unlock-${session.id}`}
                    checked={session.is_unlocked}
                    onCheckedChange={(checked) => handleUpdateSession(session, "is_unlocked", checked)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Preview do vídeo */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    YouTube ID ou URL
                  </Label>
                  <Input
                    placeholder="Cole a URL ou ID do YouTube"
                    value={session.youtube_id || ""}
                    onChange={(e) => handleUpdateSession(session, "youtube_id", e.target.value)}
                    className="font-mono text-sm"
                  />
                  {session.youtube_id && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                      <img
                        src={getYouTubeThumbnail(session.youtube_id) || ""}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <a
                        href={`https://www.youtube.com/watch?v=${session.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-8 h-8 text-white" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Material */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    URL do Material (PDF, etc.)
                  </Label>
                  <Input
                    placeholder="https://exemplo.com/material.pdf"
                    value={session.materials_url || ""}
                    onChange={(e) => handleUpdateSession(session, "materials_url", e.target.value)}
                  />
                  {session.materials_url && (
                    <a
                      href={session.materials_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-secondary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir material
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSaveSession(session)}
                  disabled={saving === session.id}
                  size="sm"
                >
                  {saving === session.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
