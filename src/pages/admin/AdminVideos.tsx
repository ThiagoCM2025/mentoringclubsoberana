import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Video,
  Youtube,
  ExternalLink,
  Eye,
  Clock,
  Loader2
} from "lucide-react";

interface VideoLibraryItem {
  id: string;
  title: string;
  video_url: string;
  video_type: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  tags: string[] | null;
  views_count: number;
  created_at: string;
}

const AdminVideos = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<VideoLibraryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("video_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setVideos(data);
    setLoading(false);
  };

  const detectVideoType = (url: string): string => {
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo")) return "vimeo";
    if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) return "direct";
    return "unknown";
  };

  const getVideoTypeIcon = (type: string | null) => {
    switch (type) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-500" />;
      case "vimeo":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "direct":
        return <ExternalLink className="w-4 h-4 text-green-500" />;
      default:
        return <Video className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const fetchVideoInfo = async (url: string) => {
    const type = detectVideoType(url);
    setEditingVideo(prev => ({ ...prev, video_type: type }));
    
    if (type === "youtube") {
      setFetchingInfo(true);
      try {
        const { data, error } = await supabase.functions.invoke('youtube-video-info', {
          body: { videoUrl: url }
        });

        if (data) {
          setEditingVideo(prev => ({
            ...prev,
            title: prev?.title || data.title,
            duration_minutes: data.durationMinutes || prev?.duration_minutes,
            thumbnail_url: data.thumbnailUrl || prev?.thumbnail_url,
          }));
          toast({ title: "Informações do vídeo carregadas!" });
        }
      } catch (error) {
        console.error("Error fetching video info:", error);
      } finally {
        setFetchingInfo(false);
      }
    }
  };

  const saveVideo = async () => {
    if (!editingVideo?.title || !editingVideo?.video_url) {
      toast({ title: "Título e URL são obrigatórios", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const videoData = {
        title: editingVideo.title,
        video_url: editingVideo.video_url,
        video_type: editingVideo.video_type || detectVideoType(editingVideo.video_url),
        thumbnail_url: editingVideo.thumbnail_url,
        duration_minutes: editingVideo.duration_minutes,
        tags: editingVideo.tags,
      };

      if (editingVideo.id) {
        await supabase
          .from("video_library")
          .update(videoData)
          .eq("id", editingVideo.id);
      } else {
        await supabase.from("video_library").insert(videoData);
      }

      setDialogOpen(false);
      setEditingVideo(null);
      fetchVideos();
      toast({ title: "Vídeo salvo!" });
    } catch (error) {
      toast({ title: "Erro ao salvar vídeo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Excluir este vídeo da biblioteca?")) return;

    await supabase.from("video_library").delete().eq("id", id);
    fetchVideos();
    toast({ title: "Vídeo excluído" });
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-3 lg:p-6 admin-area">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
        >
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground title-premium mb-1">
              Biblioteca de Vídeos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todos os vídeos da plataforma
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingVideo({ title: "", video_url: "", tags: [] });
              setDialogOpen(true);
            }}
            className="h-8 text-sm gap-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground btn-glow-gold"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Vídeo
          </Button>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vídeo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Adicionado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredVideos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <Video className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum vídeo encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-9 bg-muted rounded flex items-center justify-center">
                            <Video className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-foreground">{video.title}</p>
                          {video.tags && video.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {video.tags.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getVideoTypeIcon(video.video_type)}
                        <span className="text-sm text-muted-foreground capitalize">
                          {video.video_type || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">
                          {video.duration_minutes ? `${video.duration_minutes} min` : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-sm">{video.views_count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(video.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingVideo(video);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteVideo(video.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingVideo?.id ? "Editar Vídeo" : "Adicionar Vídeo"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>URL do Vídeo *</Label>
                <div className="relative">
                  <Input
                    value={editingVideo?.video_url || ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      setEditingVideo({ ...editingVideo, video_url: url });
                      if (url.length > 10) {
                        fetchVideoInfo(url);
                      }
                    }}
                    placeholder="Cole o link do YouTube, Vimeo ou URL direta"
                    className="pr-10"
                  />
                  {fetchingInfo && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-secondary" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editingVideo?.title || ""}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="Nome do vídeo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={editingVideo?.duration_minutes || ""}
                    onChange={(e) => setEditingVideo({ 
                      ...editingVideo, 
                      duration_minutes: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="Auto-detectado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    value={editingVideo?.video_type || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={editingVideo?.tags?.join(", ") || ""}
                  onChange={(e) => setEditingVideo({ 
                    ...editingVideo, 
                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="Ex: marketing, vendas, instagram"
                />
              </div>

              {editingVideo?.thumbnail_url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <img 
                    src={editingVideo.thumbnail_url} 
                    alt="Thumbnail" 
                    className="w-full aspect-video object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={saveVideo} 
                  disabled={saving}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminVideos;
