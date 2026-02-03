import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  X,
  Mail,
  MessageCircle,
  FileText,
  User,
  Phone,
  Clock,
  Send,
  Zap,
  ZapOff,
  Play,
  Pause,
  Flame,
  Thermometer,
  ThermometerSnowflake,
  Target,
  DollarSign,
  Briefcase,
  AlertCircle,
  Loader2,
  Pencil,
  History,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LeadBehaviorTab } from "./LeadBehaviorTab";
import { LeadActionNotes } from "./LeadActionNotes";
import { LeadTasksSection } from "./LeadTasksSection";
import { WhatsAppInboxModal } from "@/components/admin/whatsapp/WhatsAppInboxModal";
import { NewTaskDialog } from "@/components/admin/tasks/TaskDialog";
import { useNurturingSequences } from "@/hooks/useNurturingSequences";
import { useTasks } from "@/hooks/useTasks";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus | null;
  temperature: LeadTemperature | null;
  messages_sent: number | null;
  created_at: string;
  last_contact_at: string | null;
  nurturing_active?: boolean | null;
  nurturing_step?: number | null;
  score?: number | null;
  behavior_score?: number | null;
  notes?: string | null;
  pain_points?: string[] | null;
  mentoring_goals?: string | null;
  practice_area?: string | null;
  product_interest?: string | null;
  investment_range?: string | null;
  meeting_scheduled_at?: string | null;
  meeting_status?: string | null;
  meeting_link?: string | null;
  meeting_notes?: string | null;
  discard_reason?: string | null;
  discard_notes?: string | null;
  student_user_id?: string | null;
}

interface CommunicationHistory {
  id: string;
  channel: string;
  subject: string | null;
  message: string;
  sent_at: string;
  status: string | null;
}

interface LeadDetailModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onLeadUpdated: () => void;
  onOpenQualification?: () => void;
  onOpenMessage?: () => void;
}

const temperatureConfig = {
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "text-blue-500" },
  warm: { label: "Morno", icon: Thermometer, color: "text-amber-500" },
  hot: { label: "Quente", icon: Flame, color: "text-red-500" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  qualified: { label: "Qualificado", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  negotiating: { label: "Negociando", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  meeting: { label: "Reunião", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  converted: { label: "Cliente", color: "bg-green-500/10 text-green-600 border-green-200" },
  discarded: { label: "Descartado", color: "bg-gray-500/10 text-gray-600 border-gray-200" },
};

export function LeadDetailModal({ open, onClose, lead, onLeadUpdated, onOpenQualification, onOpenMessage }: LeadDetailModalProps) {
  const { getSequenceInfo, calculateNextSend } = useNurturingSequences();
  const { admins, createTask } = useTasks();
  
  const [status, setStatus] = useState<LeadStatus>("new");
  const [temperature, setTemperature] = useState<LeadTemperature>("warm");
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });
  }, []);

  useEffect(() => {
    if (lead && open) {
      setStatus((lead.status as LeadStatus) || "new");
      setTemperature(lead.temperature || "warm");
      fetchCommunicationHistory(lead.id);
    }
  }, [lead, open]);

  const fetchCommunicationHistory = async (leadId: string) => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("communication_history")
      .select("id, channel, subject, message, sent_at, status")
      .eq("recipient_id", leadId)
      .order("sent_at", { ascending: false })
      .limit(10);
    
    setCommunicationHistory(data || []);
    setLoadingHistory(false);
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setStatus(newStatus);
    
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", lead.id);
    
    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      onLeadUpdated();
    }
  };

  const handleTemperatureChange = async (newTemp: LeadTemperature) => {
    if (!lead) return;
    setTemperature(newTemp);
    
    const { error } = await supabase
      .from("leads")
      .update({ temperature: newTemp })
      .eq("id", lead.id);
    
    if (error) {
      toast.error("Erro ao atualizar temperatura");
    } else {
      toast.success("Temperatura atualizada!");
      onLeadUpdated();
    }
  };

  const handleToggleNurturing = async () => {
    if (!lead) return;
    const newStatus = !lead.nurturing_active;
    
    const { error } = await supabase
      .from("leads")
      .update({ nurturing_active: newStatus })
      .eq("id", lead.id);
    
    if (error) {
      toast.error("Erro ao atualizar nurturing");
    } else {
      toast.success(newStatus ? "Nurturing ativado!" : "Nurturing pausado!");
      onLeadUpdated();
    }
  };

  const handleWhatsAppClick = () => {
    // Abre o modal de WhatsApp direto na conversa do lead
    setWhatsappOpen(true);
  };


  const handleEmailClick = () => {
    if (lead?.email) {
      window.open(`mailto:${lead.email}`, "_blank");
    }
  };

  if (!lead) return null;

  const nurturingStep = lead.nurturing_step ?? 0;
  const isNurturingActive = lead.nurturing_active ?? false;
  const sequenceInfo = getSequenceInfo(lead.source, nurturingStep);
  const nextSend = calculateNextSend(lead.source, nurturingStep, lead.last_contact_at);
  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
  const statusInfo = statusConfig[lead.status || "new"];
  const nurturingProgress = sequenceInfo.maxStep > 0 ? (nurturingStep / sequenceInfo.maxStep) * 100 : 0;

  const hasQualificationData = lead.pain_points?.length || lead.mentoring_goals || lead.practice_area || lead.product_interest || lead.investment_range;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        variant="fullscreen"
        className="flex flex-col bg-background p-0 gap-0"
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">{lead.full_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold truncate">{lead.full_name}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{lead.source || "Direto"}</Badge>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Há {formatDistanceToNow(new Date(lead.created_at), { locale: ptBR })}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>
            
            {/* Score Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">{lead.score || 0}</span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Sidebar - Fixed Width */}
          <div className="w-[280px] border-r bg-muted/30 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Status & Temperature in Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Status</p>
                    <Select value={status} onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-xs">{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Temperatura</p>
                    <Select value={temperature} onValueChange={(v) => handleTemperatureChange(v as LeadTemperature)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cold" className="text-xs">❄️ Frio</SelectItem>
                        <SelectItem value="warm" className="text-xs">🌡️ Morno</SelectItem>
                        <SelectItem value="hot" className="text-xs">🔥 Quente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nurturing Card */}
                <div className="bg-background rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isNurturingActive ? (
                        <Zap className="w-4 h-4 text-amber-500" />
                      ) : (
                        <ZapOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium">Nurturing</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={handleToggleNurturing}
                    >
                      {isNurturingActive ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Etapa {nurturingStep}/{sequenceInfo.maxStep}</span>
                      <span className="text-muted-foreground">{Math.round(nurturingProgress)}%</span>
                    </div>
                    <Progress value={nurturingProgress} className="h-1.5" />
                    
                    {isNurturingActive && nextSend && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                        <Send className="w-3 h-3" />
                        <span>Próximo envio: {nextSend.text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="bg-background rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Métricas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-lg font-semibold">{lead.messages_sent || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Mensagens</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{lead.behavior_score || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Engajamento</p>
                    </div>
                  </div>
                  {lead.last_contact_at && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-3 pt-2 border-t">
                      <Clock className="w-3 h-3" />
                      <span>Último contato: {formatDistanceToNow(new Date(lead.last_contact_at), { locale: ptBR, addSuffix: true })}</span>
                    </div>
                  )}
                </div>

                {/* Action Notes - Multiple notes system */}
                <LeadActionNotes leadId={lead.id} />
              </div>
            </ScrollArea>

            {/* Fixed Quick Actions */}
            <div className="p-3 border-t bg-background">
              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">Ações Rápidas</p>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-12 flex-col gap-1 text-xs"
                  onClick={handleEmailClick}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                {lead.phone && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-12 flex-col gap-1 text-xs border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-12 flex-col gap-1 text-xs border-secondary/50 text-secondary hover:bg-secondary/10"
                  onClick={onOpenMessage}
                >
                  <FileText className="w-4 h-4" />
                  Templates
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-12 flex-col gap-1 text-xs border-primary/50 text-primary hover:bg-primary/10"
                  onClick={() => setTaskDialogOpen(true)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tarefa
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-muted/10 min-h-0">
          <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-4">
                <TabsList className="w-fit">
                  <TabsTrigger value="info" className="gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                    Informações
                  </TabsTrigger>
                  <TabsTrigger value="behavior" className="gap-1.5 text-xs">
                    <Target className="w-3.5 h-3.5" />
                    Comportamento
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="info" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                {/* Tasks Section */}
                <div className="bg-background rounded-lg border overflow-hidden">
                  <div className="p-4">
                    <LeadTasksSection 
                      leadId={lead.id} 
                      leadName={lead.full_name}
                      onCreateTask={() => setTaskDialogOpen(true)} 
                    />
                  </div>
                </div>

                {/* Qualification Data - Table Format */}
                <div className="bg-background rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Dados de Qualificação
                    </h3>
                    {onOpenQualification && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onOpenQualification}>
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                  
                  {hasQualificationData ? (
                    <div className="divide-y">
                      {lead.pain_points && lead.pain_points.length > 0 && (
                        <div className="flex px-4 py-2.5">
                          <span className="w-32 text-xs text-muted-foreground shrink-0">Dores</span>
                          <div className="flex flex-wrap gap-1">
                            {lead.pain_points.map((pain, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{pain}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {lead.mentoring_goals && (
                        <div className="flex px-4 py-2.5">
                          <span className="w-32 text-xs text-muted-foreground shrink-0">Objetivos</span>
                          <span className="text-sm">{lead.mentoring_goals}</span>
                        </div>
                      )}
                      {lead.practice_area && (
                        <div className="flex px-4 py-2.5">
                          <span className="w-32 text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> Área
                          </span>
                          <span className="text-sm font-medium">{lead.practice_area}</span>
                        </div>
                      )}
                      {lead.product_interest && (
                        <div className="flex px-4 py-2.5">
                          <span className="w-32 text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Produto
                          </span>
                          <span className="text-sm font-medium">{lead.product_interest}</span>
                        </div>
                      )}
                      {lead.investment_range && (
                        <div className="flex px-4 py-2.5">
                          <span className="w-32 text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Investimento
                          </span>
                          <span className="text-sm font-medium">{lead.investment_range}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Nenhum dado de qualificação</p>
                      {onOpenQualification && (
                        <Button variant="link" size="sm" onClick={onOpenQualification} className="mt-1 text-xs">
                          Preencher agora
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Communication History - Compact */}
                <div className="bg-background rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" />
                      Histórico de Comunicações
                    </h3>
                    <span className="text-[10px] text-muted-foreground">{communicationHistory.length} registros</span>
                  </div>
                  
                  {loadingHistory ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Carregando...
                    </div>
                  ) : communicationHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      Nenhuma comunicação registrada
                    </div>
                  ) : (
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                      {communicationHistory.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                          <div className={cn(
                            "p-1.5 rounded-full shrink-0 mt-0.5",
                            item.channel === "email" ? "bg-blue-100 text-blue-600" :
                            item.channel === "whatsapp" ? "bg-green-100 text-green-600" :
                            "bg-gray-100 text-gray-600"
                          )}>
                            {item.channel === "whatsapp" ? <MessageCircle className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="text-xs font-medium truncate">{item.subject || (item.channel === "whatsapp" ? "WhatsApp" : "Email")}</p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {format(new Date(item.sent_at), "dd/MM HH:mm")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="flex-1 overflow-y-auto p-4 mt-0">
                <LeadBehaviorTab leadId={lead.id} behaviorScore={lead.behavior_score || 0} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* WhatsApp Inbox Modal */}
      {lead?.phone && (
        <WhatsAppInboxModal
          open={whatsappOpen}
          onOpenChange={setWhatsappOpen}
          initialPhone={lead.phone}
          initialContactName={lead.full_name}
          initialContactType="lead"
          initialContactId={lead.id}
        />
      )}

      {/* New Task Dialog */}
      <NewTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        admins={admins}
        currentUserId={currentUserId}
        onSubmit={createTask}
        defaultLeadId={lead?.id}
        defaultLeadName={lead?.full_name}
      />
    </Dialog>
  );
}
