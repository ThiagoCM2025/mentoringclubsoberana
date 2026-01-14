import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  MessageSquare,
  Trophy,
  Filter,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StudentAvatarFormViewer } from "@/components/admin/StudentAvatarFormViewer";

interface MissionSubmission {
  id: string;
  user_id: string;
  mission_id: string;
  proof_content: string;
  proof_links: string[] | null;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  admin_feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  mission: {
    title: string;
    week_number: number;
    xp_reward: number;
    gamification_emoji: string;
    course: {
      title: string;
    };
  };
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

const AdminMissionReviews = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("submitted");
  const [selectedSubmission, setSelectedSubmission] = useState<MissionSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);
  const [avatarFormViewer, setAvatarFormViewer] = useState<{
    lessonId: string;
    userId: string;
    studentName: string;
  } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);

    let query = supabase
      .from("user_mission_completions")
      .select(`
        *,
        mission:weekly_missions (
          title, week_number, xp_reward, gamification_emoji,
          course:courses (title)
        )
      `)
      .order("submitted_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as "pending" | "submitted" | "approved" | "rejected");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching submissions:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles for each submission
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const enrichedData = data.map(s => ({
        ...s,
        profile: profileMap.get(s.user_id) || { full_name: "Aluna", avatar_url: null }
      }));

      setSubmissions(enrichedData as MissionSubmission[]);
    } else {
      setSubmissions([]);
    }

    setLoading(false);
  };

  const handleReview = async (approved: boolean) => {
    if (!selectedSubmission || !user) return;

    setProcessing(true);

    try {
      const newStatus = approved ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from("user_mission_completions")
        .update({
          status: newStatus,
          admin_feedback: feedback || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast.success(approved ? "Missão aprovada! XP concedido." : "Missão rejeitada.");
      setSelectedSubmission(null);
      setFeedback("");
      fetchSubmissions();
    } catch (error) {
      console.error("Error reviewing submission:", error);
      toast.error("Erro ao processar revisão");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Aprovada</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejeitada</Badge>;
      case 'submitted':
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'submitted' || s.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              Revisão de Missões
              {pendingCount > 0 && (
                <Badge className="bg-amber-500 text-white ml-2">
                  {pendingCount} pendentes
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Aprove ou rejeite as entregas das alunas
            </p>
          </div>
        </div>

        {/* Filter */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="submitted">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovadas</SelectItem>
                <SelectItem value="rejected">Rejeitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center text-muted-foreground bg-card border-border">
              Carregando...
            </Card>
          ) : submissions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground bg-card border-border">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrega encontrada</p>
            </Card>
          ) : (
            <AnimatePresence>
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="p-5 bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={submission.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {submission.profile.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {submission.mission?.gamification_emoji} Semana {submission.mission?.week_number}: {submission.mission?.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {submission.mission?.course?.title}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            {getStatusBadge(submission.status)}
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(submission.submitted_at), "dd MMM, HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {submission.proof_content}
                        </p>

                        {submission.proof_links && submission.proof_links.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <LinkIcon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {submission.proof_links.length} link(s) anexado(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedSubmission && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span>{selectedSubmission.mission?.gamification_emoji}</span>
                    Revisar Entrega
                  </DialogTitle>
                  <DialogDescription>
                    Semana {selectedSubmission.mission?.week_number}: {selectedSubmission.mission?.title}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Student info */}
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedSubmission.profile.avatar_url || undefined} />
                      <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedSubmission.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Enviado em {format(new Date(selectedSubmission.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className="ml-auto bg-amber-500/20 text-amber-600">
                      <Trophy className="w-3 h-3 mr-1" />
                      {selectedSubmission.mission?.xp_reward} XP
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      Descrição da Entrega
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">
                      {selectedSubmission.proof_content}
                    </div>
                  </div>

                  {/* Links */}
                  {selectedSubmission.proof_links && selectedSubmission.proof_links.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <LinkIcon className="w-4 h-4" />
                        Links de Prova
                      </div>
                      <div className="space-y-2">
                        {selectedSubmission.proof_links.map((link, i) => {
                          // Detectar se é um link interno de avatar-form
                          const avatarFormMatch = link.match(/^avatar-form:(.+):(.+)$/) || 
                                                  link.match(/\/student\/avatar-form\/(.+)/);
                          
                          if (avatarFormMatch) {
                            const lessonId = avatarFormMatch[1];
                            return (
                              <button
                                key={i}
                                onClick={() => setAvatarFormViewer({
                                  lessonId,
                                  userId: selectedSubmission.user_id,
                                  studentName: selectedSubmission.profile.full_name
                                })}
                                className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors text-sm text-secondary w-full text-left"
                              >
                                <Eye className="w-4 h-4" />
                                Ver Mapa do Avatar preenchido
                              </button>
                            );
                          }
                          
                          return (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-sm text-primary"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {link}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {(selectedSubmission.status === 'submitted' || selectedSubmission.status === 'pending') && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MessageSquare className="w-4 h-4" />
                        Feedback (opcional)
                      </div>
                      <Textarea
                        placeholder="Deixe um feedback para a aluna..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Previous feedback */}
                  {selectedSubmission.admin_feedback && selectedSubmission.status !== 'submitted' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MessageSquare className="w-4 h-4" />
                        Feedback Dado
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        {selectedSubmission.admin_feedback}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {(selectedSubmission.status === 'submitted' || selectedSubmission.status === 'pending') && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-600 hover:bg-red-500/10"
                      onClick={() => handleReview(false)}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleReview(true)}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar (+{selectedSubmission.mission?.xp_reward} XP)
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Avatar Form Viewer Modal */}
        <StudentAvatarFormViewer
          open={!!avatarFormViewer}
          onOpenChange={(open) => !open && setAvatarFormViewer(null)}
          lessonId={avatarFormViewer?.lessonId || ""}
          userId={avatarFormViewer?.userId || ""}
          studentName={avatarFormViewer?.studentName}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminMissionReviews;
