import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Trophy,
  Calendar,
  Phone,
  Mail,
  Clock,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  History,
  StickyNote,
  ArrowRight
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StudentProfile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface GamificationStats {
  xp: number;
  level: number;
  streak_days: number;
  total_lessons_completed: number;
  total_study_minutes: number;
}

interface CourseProgress {
  course_id: string;
  course_title: string;
  enrolled_at: string;
  total_lessons: number;
  completed_lessons: number;
  last_activity: string | null;
}

interface EarnedBadge {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

interface Diagnostic {
  years_practicing: string | null;
  practice_area: string | null;
  practice_area_other: string | null;
  has_office: boolean | null;
  office_size: string | null;
  monthly_revenue: string | null;
  revenue_goal: string | null;
  main_challenges: string[] | null;
  main_goals: string[] | null;
  current_step: number;
  marketing_knowledge: string | null;
  digital_presence: string | null;
  referral_source: string | null;
  weekly_study_hours: string | null;
  completed: boolean;
  created_at: string;
}

interface ActivityItem {
  type: 'lesson' | 'badge' | 'enrollment' | 'account';
  description: string;
  date: string;
}

interface CommunicationItem {
  id: string;
  channel: string;
  subject: string | null;
  message: string;
  status: string | null;
  sent_at: string;
}

interface AdminNote {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  admin_user_id: string;
  admin_name?: string;
}

interface DiagnosticHistoryItem {
  id: string;
  changed_fields: Record<string, { old: string | null; new: string | null }>;
  changed_at: string;
  change_type: string;
}

const YEARS_LABELS: Record<string, string> = {
  'menos_1': 'Menos de 1 ano',
  '1_3': '1 a 3 anos',
  '3_5': '3 a 5 anos',
  '5_10': '5 a 10 anos',
  'mais_10': 'Mais de 10 anos'
};

const PRACTICE_LABELS: Record<string, string> = {
  'civil': 'Direito Civil',
  'trabalhista': 'Direito Trabalhista',
  'criminal': 'Direito Criminal',
  'tributario': 'Direito Tributário',
  'empresarial': 'Direito Empresarial',
  'familia': 'Direito de Família',
  'outro': 'Outro'
};

const REVENUE_LABELS: Record<string, string> = {
  'ate_5k': 'Até R$ 5.000',
  '5k_10k': 'R$ 5.000 - R$ 10.000',
  '10k_20k': 'R$ 10.000 - R$ 20.000',
  '20k_50k': 'R$ 20.000 - R$ 50.000',
  'mais_50k': 'Mais de R$ 50.000',
  'nao_informar': 'Prefiro não informar'
};

const CHALLENGE_LABELS: Record<string, string> = {
  'captacao': 'Captação de clientes',
  'gestao': 'Gestão do escritório',
  'marketing': 'Marketing pessoal',
  'financeiro': 'Gestão financeira',
  'tempo': 'Gestão de tempo',
  'equipe': 'Gestão de equipe'
};

const GOAL_LABELS: Record<string, string> = {
  'faturamento': 'Aumentar faturamento',
  'clientes': 'Mais clientes',
  'marca': 'Construir marca pessoal',
  'networking': 'Ampliar networking',
  'organizacao': 'Melhorar organização',
  'vida': 'Equilíbrio vida/trabalho'
};

const KNOWLEDGE_LABELS: Record<string, string> = {
  'iniciante': 'Iniciante',
  'basico': 'Básico',
  'intermediario': 'Intermediário',
  'avancado': 'Avançado'
};

const PRESENCE_LABELS: Record<string, string> = {
  'nenhuma': 'Nenhuma',
  'basica': 'Básica',
  'moderada': 'Moderada',
  'forte': 'Forte'
};

const REFERRAL_LABELS: Record<string, string> = {
  'instagram': 'Instagram',
  'indicacao': 'Indicação',
  'google': 'Google',
  'evento': 'Evento',
  'outro': 'Outro'
};

const HOURS_LABELS: Record<string, string> = {
  '1_2': '1-2 horas',
  '3_5': '3-5 horas',
  '5_10': '5-10 horas',
  'mais_10': 'Mais de 10 horas'
};

const OFFICE_SIZE_LABELS: Record<string, string> = {
  'solo': 'Advogada solo',
  'pequeno': 'Pequeno (2-5 pessoas)',
  'medio': 'Médio (6-15 pessoas)',
  'grande': 'Grande (16+ pessoas)'
};

// Field labels for diagnostic history
const FIELD_LABELS: Record<string, string> = {
  years_practicing: 'Tempo de advocacia',
  practice_area: 'Área de atuação',
  practice_area_other: 'Área de atuação (outro)',
  has_office: 'Possui escritório próprio',
  office_size: 'Tamanho do escritório',
  monthly_revenue: 'Faturamento mensal',
  revenue_goal: 'Meta de faturamento',
  main_challenges: 'Principais desafios',
  main_goals: 'Principais objetivos',
  marketing_knowledge: 'Conhecimento em marketing',
  digital_presence: 'Presença digital',
  referral_source: 'Como conheceu',
  weekly_study_hours: 'Horas de estudo/semana'
};

export default function AdminStudentProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationStats | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [communications, setCommunications] = useState<CommunicationItem[]>([]);
  
  // Admin notes state
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  
  // Diagnostic history state
  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchStudentData();
      fetchAdminNotes();
      fetchDiagnosticHistory();
    }
  }, [userId]);

  const fetchStudentData = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      // Fetch gamification
      const { data: gamificationData } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (gamificationData) setGamification(gamificationData);

      // Fetch enrollments with course progress
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          enrolled_at,
          courses (title)
        `)
        .eq("user_id", userId);

      if (enrollments) {
        const progressPromises = enrollments.map(async (enrollment) => {
          // Get total lessons for course
          const { data: modules } = await supabase
            .from("modules")
            .select("id")
            .eq("course_id", enrollment.course_id);
          
          let totalLessons = 0;
          let completedLessons = 0;
          let lastActivity: string | null = null;

          if (modules) {
            const moduleIds = modules.map(m => m.id);
            
            const { data: lessons } = await supabase
              .from("lessons")
              .select("id")
              .in("module_id", moduleIds);
            
            totalLessons = lessons?.length || 0;

            const { data: progress } = await supabase
              .from("progress")
              .select("completed, updated_at")
              .eq("user_id", userId)
              .in("lesson_id", lessons?.map(l => l.id) || []);
            
            completedLessons = progress?.filter(p => p.completed).length || 0;
            
            if (progress?.length) {
              const sorted = progress.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
              lastActivity = sorted[0]?.updated_at || null;
            }
          }

          return {
            course_id: enrollment.course_id,
            course_title: (enrollment.courses as any)?.title || "Curso",
            enrolled_at: enrollment.enrolled_at,
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
            last_activity: lastActivity
          };
        });

        const progressData = await Promise.all(progressPromises);
        setCourseProgress(progressData);
      }

      // Fetch badges
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select(`
          badge_id,
          earned_at,
          badges (name, description, icon)
        `)
        .eq("user_id", userId);

      if (userBadges) {
        setBadges(userBadges.map(ub => ({
          badge_id: ub.badge_id,
          name: (ub.badges as any)?.name || "",
          description: (ub.badges as any)?.description || "",
          icon: (ub.badges as any)?.icon || "🏆",
          earned_at: ub.earned_at
        })));
      }

      // Fetch diagnostic
      const { data: diagnosticData } = await supabase
        .from("student_diagnostics")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (diagnosticData) setDiagnostic(diagnosticData as Diagnostic);

      // Fetch communication history
      const { data: commData } = await supabase
        .from("communication_history")
        .select("id, channel, subject, message, status, sent_at")
        .eq("recipient_id", userId)
        .order("sent_at", { ascending: false })
        .limit(10);
      
      if (commData) setCommunications(commData);
      
      if (diagnosticData) setDiagnostic(diagnosticData as Diagnostic);

      // Build activity timeline
      const activityList: ActivityItem[] = [];

      // Add account creation
      if (profileData?.created_at) {
        activityList.push({
          type: 'account',
          description: 'Criou a conta',
          date: profileData.created_at
        });
      }

      // Add enrollments
      if (enrollments) {
        enrollments.forEach(e => {
          activityList.push({
            type: 'enrollment',
            description: `Matriculou-se em "${(e.courses as any)?.title}"`,
            date: e.enrolled_at
          });
        });
      }

      // Add badges
      if (userBadges) {
        userBadges.forEach(b => {
          activityList.push({
            type: 'badge',
            description: `Ganhou badge "${(b.badges as any)?.name}"`,
            date: b.earned_at
          });
        });
      }

      // Sort by date descending
      activityList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(activityList.slice(0, 10));

    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminNotes = async () => {
    if (!userId) return;
    
    try {
      const { data: notes, error } = await supabase
        .from("admin_student_notes")
        .select("*")
        .eq("student_user_id", userId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (notes && notes.length > 0) {
        // Fetch admin names for each note
        const adminIds = [...new Set(notes.map(n => n.admin_user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", adminIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setAdminNotes(notes.map(note => ({
          ...note,
          admin_name: profileMap.get(note.admin_user_id) || "Admin"
        })));
      } else {
        setAdminNotes([]);
      }
    } catch (error) {
      console.error("Error fetching admin notes:", error);
    }
  };

  const fetchDiagnosticHistory = async () => {
    if (!userId) return;
    
    try {
      const { data: history, error } = await supabase
        .from("diagnostic_history")
        .select("*")
        .eq("user_id", userId)
        .order("changed_at", { ascending: false });
      
      if (error) throw error;
      
      // Map the data to match our interface
      const mappedHistory: DiagnosticHistoryItem[] = (history || []).map(item => ({
        id: item.id,
        changed_fields: item.changed_fields as Record<string, { old: string | null; new: string | null }>,
        changed_at: item.changed_at,
        change_type: item.change_type || 'update'
      }));
      
      setDiagnosticHistory(mappedHistory);
    } catch (error) {
      console.error("Error fetching diagnostic history:", error);
    }
  };

  const handleSaveNote = async () => {
    if (!userId || !user?.id || !newNoteContent.trim()) return;
    
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from("admin_student_notes")
        .insert({
          student_user_id: userId,
          admin_user_id: user.id,
          content: newNoteContent.trim()
        });
      
      if (error) throw error;
      
      toast.success("Nota salva com sucesso!");
      setNewNoteContent("");
      fetchAdminNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Erro ao salvar nota");
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from("admin_student_notes")
        .update({ content: editingContent.trim() })
        .eq("id", noteId);
      
      if (error) throw error;
      
      toast.success("Nota atualizada!");
      setEditingNoteId(null);
      setEditingContent("");
      fetchAdminNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Erro ao atualizar nota");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("admin_student_notes")
        .delete()
        .eq("id", noteId);
      
      if (error) throw error;
      
      toast.success("Nota excluída!");
      fetchAdminNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Erro ao excluir nota");
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("admin_student_notes")
        .update({ is_pinned: !currentPinned })
        .eq("id", noteId);
      
      if (error) throw error;
      
      toast.success(currentPinned ? "Nota desafixada" : "Nota fixada");
      fetchAdminNotes();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Erro ao fixar/desafixar nota");
    }
  };

  const formatFieldValue = (field: string, value: string | null): string => {
    if (value === null || value === "null") return "Não informado";
    if (value === "true") return "Sim";
    if (value === "false") return "Não";
    
    // Try to match with known labels
    const labelMaps: Record<string, Record<string, string>> = {
      years_practicing: YEARS_LABELS,
      practice_area: PRACTICE_LABELS,
      office_size: OFFICE_SIZE_LABELS,
      monthly_revenue: REVENUE_LABELS,
      revenue_goal: REVENUE_LABELS,
      marketing_knowledge: KNOWLEDGE_LABELS,
      digital_presence: PRESENCE_LABELS,
      referral_source: REFERRAL_LABELS,
      weekly_study_hours: HOURS_LABELS
    };
    
    if (labelMaps[field] && labelMaps[field][value]) {
      return labelMaps[field][value];
    }
    
    return value;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM - HH:mm", { locale: ptBR });
  };

  const getRelativeTime = (date: string | null) => {
    if (!date) return "Sem atividade";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return `Há ${days} dias`;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="w-4 h-4" />;
      case "whatsapp": return <MessageCircle className="w-4 h-4" />;
      case "in_app": return <Mail className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case "email": return "Email";
      case "whatsapp": return "WhatsApp";
      case "in_app": return "Notificação";
      default: return channel;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aluno não encontrado</p>
          <Button onClick={() => navigate("/admin/students")} className="mt-4">
            Voltar para Alunos
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil do Aluno</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.full_name || "Sem nome"}</h2>
                
                <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membro desde {formatDate(profile.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  {diagnostic?.completed ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Diagnóstico Completo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Diagnóstico Pendente
                    </Badge>
                  )}
                  
                  <SendNotificationDialog 
                    studentId={profile.user_id} 
                    studentName={profile.full_name || "Aluno"} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Observações do Admin ({adminNotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Adicionar uma nova observação sobre este aluno..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleSaveNote}
                disabled={!newNoteContent.trim() || savingNote}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                {savingNote ? "Salvando..." : "Salvar Nota"}
              </Button>
            </div>

            {/* Notes list */}
            {adminNotes.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                {adminNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className={`p-3 rounded-lg border ${note.is_pinned ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}
                  >
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateNote(note.id)}>
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingContent("");
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleTogglePin(note.id, note.is_pinned)}
                              title={note.is_pinned ? "Desafixar" : "Fixar"}
                            >
                              {note.is_pinned ? (
                                <PinOff className="h-3.5 w-3.5" />
                              ) : (
                                <Pin className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingContent(note.content);
                              }}
                              title="Editar"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          {note.is_pinned && (
                            <span className="flex items-center gap-1 text-primary">
                              <Pin className="h-3 w-3" /> Fixada
                            </span>
                          )}
                          <span>Por: {note.admin_name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gamification Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{gamification?.xp || 0}</p>
              <p className="text-sm text-muted-foreground">XP Total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{gamification?.level || 1}</p>
              <p className="text-sm text-muted-foreground">Nível</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{gamification?.streak_days || 0}</p>
              <p className="text-sm text-muted-foreground">Dias de Streak</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{gamification?.total_lessons_completed || 0}</p>
              <p className="text-sm text-muted-foreground">Aulas Concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Progresso nos Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseProgress.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma matrícula encontrada
              </p>
            ) : (
              <div className="space-y-4">
                {courseProgress.map((course) => {
                  const progressPercent = course.total_lessons > 0 
                    ? Math.round((course.completed_lessons / course.total_lessons) * 100)
                    : 0;
                  
                  return (
                    <div key={course.course_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{course.course_title}</h4>
                        <span className="text-sm font-medium">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{course.completed_lessons} de {course.total_lessons} aulas</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(course.last_activity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Conquistas Obtidas ({badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma conquista ainda
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Badge 
                    key={badge.badge_id} 
                    variant="secondary"
                    className="px-3 py-2 text-sm"
                  >
                    <span className="mr-1">{badge.icon}</span>
                    {badge.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Histórico de Comunicações ({communications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {communications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma comunicação registrada
              </p>
            ) : (
              <div className="space-y-3">
                {communications.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getChannelIcon(comm.channel)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {getChannelLabel(comm.channel)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comm.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {comm.status === 'sent' ? 'Enviado' : comm.status}
                        </span>
                      </div>
                      <p className="font-medium text-sm mt-1">{comm.subject || "Sem assunto"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{comm.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(comm.sent_at), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostic */}
        {diagnostic && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Diagnóstico Inicial
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!diagnostic.completed ? (
                <p className="text-muted-foreground text-center py-4">
                  Diagnóstico não concluído (Etapa {diagnostic.current_step}/5)
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {diagnostic.years_practicing && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo de advocacia</p>
                      <p className="font-medium">{YEARS_LABELS[diagnostic.years_practicing] || diagnostic.years_practicing}</p>
                    </div>
                  )}
                  
                  {diagnostic.practice_area && (
                    <div>
                      <p className="text-sm text-muted-foreground">Área de atuação</p>
                      <p className="font-medium">
                        {diagnostic.practice_area === 'outro' 
                          ? diagnostic.practice_area_other 
                          : PRACTICE_LABELS[diagnostic.practice_area] || diagnostic.practice_area}
                      </p>
                    </div>
                  )}

                  {diagnostic.has_office !== null && diagnostic.has_office !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Possui escritório próprio</p>
                      <p className="font-medium">{diagnostic.has_office ? 'Sim' : 'Não'}</p>
                    </div>
                  )}

                  {diagnostic.office_size && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tamanho do escritório</p>
                      <p className="font-medium">{OFFICE_SIZE_LABELS[diagnostic.office_size] || diagnostic.office_size}</p>
                    </div>
                  )}
                  
                  {diagnostic.monthly_revenue && (
                    <div>
                      <p className="text-sm text-muted-foreground">Faturamento mensal</p>
                      <p className="font-medium">{REVENUE_LABELS[diagnostic.monthly_revenue] || diagnostic.monthly_revenue}</p>
                    </div>
                  )}
                  
                  {diagnostic.revenue_goal && (
                    <div>
                      <p className="text-sm text-muted-foreground">Meta de faturamento</p>
                      <p className="font-medium">{REVENUE_LABELS[diagnostic.revenue_goal] || diagnostic.revenue_goal}</p>
                    </div>
                  )}
                  
                  {diagnostic.main_challenges && diagnostic.main_challenges.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Principais desafios</p>
                      <div className="flex flex-wrap gap-1">
                        {diagnostic.main_challenges.map((c) => (
                          <Badge key={c} variant="outline">{CHALLENGE_LABELS[c] || c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {diagnostic.main_goals && diagnostic.main_goals.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Principais objetivos</p>
                      <div className="flex flex-wrap gap-1">
                        {diagnostic.main_goals.map((g) => (
                          <Badge key={g} variant="outline">{GOAL_LABELS[g] || g}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {diagnostic.marketing_knowledge && (
                    <div>
                      <p className="text-sm text-muted-foreground">Conhecimento em marketing</p>
                      <p className="font-medium">{KNOWLEDGE_LABELS[diagnostic.marketing_knowledge] || diagnostic.marketing_knowledge}</p>
                    </div>
                  )}
                  
                  {diagnostic.digital_presence && (
                    <div>
                      <p className="text-sm text-muted-foreground">Presença digital</p>
                      <p className="font-medium">{PRESENCE_LABELS[diagnostic.digital_presence] || diagnostic.digital_presence}</p>
                    </div>
                  )}
                  
                  {diagnostic.referral_source && (
                    <div>
                      <p className="text-sm text-muted-foreground">Como conheceu</p>
                      <p className="font-medium">{REFERRAL_LABELS[diagnostic.referral_source] || diagnostic.referral_source}</p>
                    </div>
                  )}
                  
                  {diagnostic.weekly_study_hours && (
                    <div>
                      <p className="text-sm text-muted-foreground">Horas de estudo/semana</p>
                      <p className="font-medium">{HOURS_LABELS[diagnostic.weekly_study_hours] || diagnostic.weekly_study_hours}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnostic History */}
              {diagnosticHistory.length > 0 && (
                <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mt-6 pt-4 border-t">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <History className="h-4 w-4" />
                        Histórico de Alterações ({diagnosticHistory.length})
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    {diagnosticHistory.map((historyItem) => (
                      <div key={historyItem.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(historyItem.changed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        <div className="space-y-2">
                          {Object.entries(historyItem.changed_fields).map(([field, values]) => (
                            <div key={field} className="flex items-start gap-2 text-sm">
                              <span className="font-medium shrink-0">{FIELD_LABELS[field] || field}:</span>
                              <span className="text-muted-foreground line-through">
                                {formatFieldValue(field, values.old)}
                              </span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="text-primary font-medium">
                                {formatFieldValue(field, values.new)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma atividade registrada
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
