import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Video, Calendar, FileText, ExternalLink, Play, Lock, Mail, Send, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [sendingReminders, setSendingReminders] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  const [pendingReminders, setPendingReminders] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchSessions();
    fetchLeadsCount();
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
      // Fetch pending reminders for each unlocked session
      if (data) {
        fetchPendingReminders(data);
      }
    }
    setLoading(false);
  };

  const fetchLeadsCount = async () => {
    const { count } = await supabase
      .from("jornada_access")
      .select("*", { count: "exact", head: true })
      .eq("jornada_slug", "jornada-imobiliaria-2026");
    
    setLeadsCount(count || 0);
  };

  const fetchPendingReminders = async (sessionsList: JornadaSession[]) => {
    const pending: Record<string, number> = {};
    
    for (const session of sessionsList) {
      if (session.is_unlocked) {
        // Get total leads
        const { count: totalLeads } = await supabase
          .from("jornada_access")
          .select("*", { count: "exact", head: true })
          .eq("jornada_slug", "jornada-imobiliaria-2026");
        
        // Get already sent
        const { count: alreadySent } = await supabase
          .from("jornada_reminders")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id);
        
        pending[session.id] = (totalLeads || 0) - (alreadySent || 0);
      }
    }
    
    setPendingReminders(pending);
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
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
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
      // Refresh pending reminders after save
      fetchPendingReminders(sessions);
    }
    
    setSaving(null);
  };

  const handleSendReminders = async (sessionId?: string) => {
    setSendingReminders(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-jornada-reminder", {
        body: sessionId ? { session_id: sessionId } : {},
      });
      
      if (error) throw error;
      
      toast.success(`✉️ ${data.totalSent} lembretes enviados com sucesso!`);
      
      // Refresh pending reminders
      fetchPendingReminders(sessions);
    } catch (error: any) {
      console.error("Error sending reminders:", error);
      toast.error("Erro ao enviar lembretes");
    } finally {
      setSendingReminders(false);
    }
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Jornada Imobiliária 2026
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure os vídeos e materiais de cada sessão da jornada
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-muted-foreground">
            <Users className="w-3 h-3 mr-1" />
            {leadsCount} leads cadastrados
          </Badge>
          <Badge variant="outline" className="text-secondary border-secondary">
            {sessions.filter(s => s.is_unlocked).length} de {sessions.length} liberadas
          </Badge>
        </div>
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
            
            <CardContent className="space-y-4 min-w-0">
              <div className="grid lg:grid-cols-2 gap-4 min-w-0">
                {/* Preview do vídeo */}
                <div className="space-y-2 min-w-0">
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
                <div className="space-y-2 min-w-0">
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

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                {session.is_unlocked && pendingReminders[session.id] > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-secondary/30 text-secondary hover:bg-secondary/10 w-full sm:w-auto"
                        disabled={sendingReminders}
                      >
                        {sendingReminders ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4 mr-2" />
                        )}
                        Enviar Lembretes
                        <Badge className="ml-2 bg-secondary/20 text-secondary text-xs">
                          {pendingReminders[session.id]}
                        </Badge>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Enviar Lembretes</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você irá enviar lembretes por email para <strong>{pendingReminders[session.id]} leads</strong> que 
                          ainda não foram notificados sobre a aula "{session.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleSendReminders(session.id)}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Agora
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  onClick={() => handleSaveSession(session)}
                  disabled={saving === session.id}
                  size="sm"
                  className="w-full sm:w-auto"
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
