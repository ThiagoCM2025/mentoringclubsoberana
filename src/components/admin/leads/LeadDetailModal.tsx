import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNurturingSequences } from "@/hooks/useNurturingSequences";
import { LeadBehaviorTab } from "./LeadBehaviorTab";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  X,
  Mail,
  MessageCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
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
  Save,
  Loader2,
  Pencil,
  History,
} from "lucide-react";
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
  // Qualification fields
  pain_points?: string[] | null;
  mentoring_goals?: string | null;
  practice_area?: string | null;
  product_interest?: string | null;
  investment_range?: string | null;
  // Meeting fields
  meeting_scheduled_at?: string | null;
  meeting_status?: string | null;
  meeting_link?: string | null;
  meeting_notes?: string | null;
  // Discard fields
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
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "bg-blue-100 text-blue-700" },
  warm: { label: "Morno", icon: Thermometer, color: "bg-amber-100 text-amber-700" },
  hot: { label: "Quente", icon: Flame, color: "bg-red-100 text-red-700" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  qualified: { label: "Qualificado", color: "bg-purple-100 text-purple-700" },
  negotiating: { label: "Negociando", color: "bg-orange-100 text-orange-700" },
  meeting: { label: "Reunião", color: "bg-cyan-100 text-cyan-700" },
  converted: { label: "Cliente", color: "bg-green-100 text-green-700" },
  discarded: { label: "Descartado", color: "bg-gray-100 text-gray-700" },
};

export function LeadDetailModal({ open, onClose, lead, onLeadUpdated, onOpenQualification, onOpenMessage }: LeadDetailModalProps) {
  const { toast } = useToast();
  const { getSequenceInfo, calculateNextSend } = useNurturingSequences();
  
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [status, setStatus] = useState<LeadStatus>("new");
  const [temperature, setTemperature] = useState<LeadTemperature>("warm");
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (lead && open) {
      setNotes(lead.notes || "");
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

  const handleSaveNotes = async () => {
    if (!lead) return;
    setSavingNotes(true);
    
    const { error } = await supabase
      .from("leads")
      .update({ notes })
      .eq("id", lead.id);
    
    setSavingNotes(false);
    if (error) {
      toast({ title: "Erro ao salvar notas", variant: "destructive" });
    } else {
      toast({ title: "Notas salvas!" });
      onLeadUpdated();
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setStatus(newStatus);
    
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", lead.id);
    
    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } else {
      toast({ title: "Status atualizado!" });
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
      toast({ title: "Erro ao atualizar temperatura", variant: "destructive" });
    } else {
      toast({ title: "Temperatura atualizada!" });
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
      toast({ title: "Erro ao atualizar nurturing", variant: "destructive" });
    } else {
      toast({ title: newStatus ? "Nurturing ativado!" : "Nurturing pausado!" });
      onLeadUpdated();
    }
  };

  const handleWhatsAppClick = () => {
    if (lead?.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${cleanPhone}`, "_blank");
    }
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 gap-0 overflow-hidden rounded-none border-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{lead.full_name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{lead.full_name}</h2>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 border-r bg-muted/20 p-4 overflow-y-auto flex flex-col">
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{lead.source || "Direto"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Capturado {format(new Date(lead.created_at), "dd/MM/yy", { locale: ptBR })}</span>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span>{lead.messages_sent || 0} msgs</span>
              </div>
              {lead.last_contact_at && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDistanceToNow(new Date(lead.last_contact_at), { locale: ptBR })}</span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Nurturing Status */}
            <div className="space-y-3 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Nurturing</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isNurturingActive ? (
                    <Zap className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ZapOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Step {nurturingStep}/{sequenceInfo.maxStep}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToggleNurturing}>
                  {isNurturingActive ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-green-500" />}
                </Button>
              </div>
              {isNurturingActive && nextSend && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Send className="w-3 h-3" />
                  <span>Próximo: {nextSend.text}</span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Status & Temperature */}
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Status</p>
                <Select value={status} onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Temperatura</p>
                <Select value={temperature} onValueChange={(v) => handleTemperatureChange(v as LeadTemperature)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold">Frio</SelectItem>
                    <SelectItem value="warm">Morno</SelectItem>
                    <SelectItem value="hot">Quente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Quick Actions */}
            <div className="space-y-2 mt-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Ações Rápidas</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="h-9 flex-col gap-1" onClick={handleEmailClick}>
                  <Mail className="w-4 h-4" />
                  <span className="text-[10px]">Email</span>
                </Button>
                {lead.phone && (
                  <Button variant="outline" size="sm" className="h-9 flex-col gap-1 border-green-200 text-green-700 hover:bg-green-50" onClick={handleWhatsAppClick}>
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-[10px]">WhatsApp</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-9 flex-col gap-1 border-secondary/50 text-secondary hover:bg-secondary/10" onClick={onOpenMessage}>
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px]">Templates</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="info" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-4 w-fit">
                <TabsTrigger value="info" className="gap-2">
                  <User className="w-4 h-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="behavior" className="gap-2">
                  <Target className="w-4 h-4" />
                  Comportamento
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Qualification Data */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Dados de Qualificação
                    </h3>
                    {onOpenQualification && (
                      <Button variant="ghost" size="sm" onClick={onOpenQualification}>
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                  
                  {(lead.pain_points?.length || lead.mentoring_goals || lead.practice_area || lead.product_interest || lead.investment_range) ? (
                    <div className="grid grid-cols-2 gap-4">
                      {lead.pain_points && lead.pain_points.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Dores</p>
                          <div className="flex flex-wrap gap-1">
                            {lead.pain_points.map((pain, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{pain}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {lead.mentoring_goals && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Objetivos</p>
                          <p className="text-sm">{lead.mentoring_goals}</p>
                        </div>
                      )}
                      {lead.practice_area && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> Área de Atuação
                          </p>
                          <p className="text-sm font-medium">{lead.practice_area}</p>
                        </div>
                      )}
                      {lead.product_interest && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Interesse em Produto
                          </p>
                          <p className="text-sm font-medium">{lead.product_interest}</p>
                        </div>
                      )}
                      {lead.investment_range && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Faixa de Investimento
                          </p>
                          <p className="text-sm font-medium">{lead.investment_range}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum dado de qualificação preenchido</p>
                      {onOpenQualification && (
                        <Button variant="link" size="sm" onClick={onOpenQualification} className="mt-1">
                          Preencher agora
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Notas
                  </h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações sobre este lead..."
                    className="min-h-[100px] resize-none"
                  />
                  <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Salvar Notas
                  </Button>
                </div>

                {/* Communication History */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Histórico de Comunicações
                  </h3>
                  
                  {loadingHistory ? (
                    <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                  ) : communicationHistory.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Nenhuma comunicação registrada
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2 pr-4">
                        {communicationHistory.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className={cn(
                              "p-1.5 rounded-full",
                              item.channel === "email" ? "bg-blue-100 text-blue-600" :
                              item.channel === "whatsapp" ? "bg-green-100 text-green-600" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              {item.channel === "whatsapp" ? <MessageCircle className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              {item.subject && <p className="font-medium text-sm truncate">{item.subject}</p>}
                              <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(item.sent_at), "dd/MM HH:mm")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="flex-1 overflow-y-auto p-4">
                <LeadBehaviorTab leadId={lead.id} behaviorScore={lead.behavior_score || 0} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
