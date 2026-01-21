import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Send, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Mail, 
  MessageSquare,
  Loader2,
  AlertTriangle,
  Video,
  CheckCircle,
  Phone,
  PhoneOff,
  Info,
  FileSpreadsheet,
  Megaphone,
  Home,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getBrazilNow, getBrazilToday } from '@/lib/dateUtils';

interface Template {
  id: string;
  name: string;
  email_subject: string | null;
  email_body: string | null;
  whatsapp_message: string | null;
  icon: string | null;
}

interface CampaignDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedBatchId?: string;
}

interface LeadPhoneStats {
  total: number;
  withPhone: number;
  withoutPhone: number;
}

interface DynamicCampaign {
  id: string;
  label: string;
  description: string;
  type: 'batch' | 'source';
  batchId?: string;
  sourceFilter?: string | null;
  leadCount?: number;
  createdAt?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: `${i.toString().padStart(2, '0')}:00`
}));

const MINUTES = ['00', '15', '30', '45'];

// Tempo de envio por mensagem (ms)
const MESSAGE_DELAY_MS = 500;

// Helper to get icon for campaign type
function getCampaignIcon(campaign: DynamicCampaign) {
  if (campaign.type === 'batch') {
    return <FileSpreadsheet className="w-4 h-4 text-purple-500" />;
  }
  const source = campaign.sourceFilter?.toLowerCase() || '';
  if (source.includes('jornada')) return <Home className="w-4 h-4 text-yellow-500" />;
  if (source.includes('ebook')) return <BookOpen className="w-4 h-4 text-blue-500" />;
  if (source.includes('operacao') || source.includes('operação')) return <Megaphone className="w-4 h-4 text-green-500" />;
  return <Sparkles className="w-4 h-4 text-amber-500" />;
}

export function CampaignDispatchDialog({ open, onOpenChange, onSuccess, preselectedBatchId }: CampaignDispatchDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<DynamicCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  
  // Step 1: Campanha
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [leadCount, setLeadCount] = useState<number>(0);
  const [phoneStats, setPhoneStats] = useState<LeadPhoneStats>({ total: 0, withPhone: 0, withoutPhone: 0 });
  const [countLoading, setCountLoading] = useState(false);
  
  // Step 2: Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Step 3: Agendamento
  const [scheduleNow, setScheduleNow] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');

  // Carregar templates e campanhas dinâmicas
  useEffect(() => {
    if (open) {
      fetchTemplates();
      fetchCampaigns();
    }
  }, [open]);

  // Pre-select campaign if batchId provided
  useEffect(() => {
    if (preselectedBatchId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.batchId === preselectedBatchId);
      if (campaign) {
        setSelectedCampaign(campaign.id);
      }
    }
  }, [preselectedBatchId, campaigns]);

  // Contar leads quando campanha muda
  useEffect(() => {
    if (selectedCampaign) {
      countLeads();
    }
  }, [selectedCampaign]);

  // Atualizar conteúdo quando template muda
  useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      setSubject(template.email_subject || '');
      if (channel === 'email') {
        setMessage(template.email_body || '');
      } else {
        setMessage(template.whatsapp_message || '');
      }
    }
  }, [selectedTemplateId, channel, templates]);

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from('message_templates')
      .select('id, name, email_subject, email_body, whatsapp_message, icon')
      .eq('target_audience', 'lead')
      .eq('is_active', true);
    
    if (!error && data) {
      setTemplates(data);
    }
  }

  async function fetchCampaigns() {
    setCampaignsLoading(true);
    const allCampaigns: DynamicCampaign[] = [];

    try {
      // 1. Buscar listas nomeadas da tabela import_lists
      const { data: importLists } = await supabase
        .from('import_lists')
        .select('id, name, batch_id, lead_count, created_at')
        .order('created_at', { ascending: false });

      if (importLists) {
        importLists.forEach(list => {
          allCampaigns.push({
            id: `batch_${list.batch_id}`,
            label: list.name,
            description: `${list.lead_count} leads - ${format(new Date(list.created_at), 'dd/MM/yyyy')}`,
            type: 'batch',
            batchId: list.batch_id,
            leadCount: list.lead_count,
            createdAt: list.created_at
          });
        });
      }

      // 2. Buscar sources únicos para campanhas automáticas
      const { data: sources } = await supabase
        .from('leads')
        .select('source')
        .not('source', 'is', null);

      if (sources) {
        // Agrupar e contar por source
        const sourceCounts: Record<string, number> = {};
        sources.forEach(lead => {
          if (lead.source) {
            sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
          }
        });

        // Criar campanhas para sources que começam com padrões conhecidos
        const knownPatterns = ['jornada', 'ebook', 'operacao', 'operação', 'exit_intent', 'nurturing'];
        
        Object.entries(sourceCounts).forEach(([source, count]) => {
          const lowerSource = source.toLowerCase();
          const isKnownPattern = knownPatterns.some(p => lowerSource.includes(p));
          
          // Só incluir se for padrão conhecido e não for importação (já coberto por import_lists)
          if (isKnownPattern && !lowerSource.includes('importação') && !lowerSource.includes('importacao')) {
            // Format label nicely
            const label = source
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            allCampaigns.push({
              id: `source_${source}`,
              label,
              description: `${count} leads`,
              type: 'source',
              sourceFilter: source,
              leadCount: count
            });
          }
        });
      }

      // 3. Adicionar opção "Todos os Leads"
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      allCampaigns.push({
        id: 'all_leads',
        label: 'Todos os Leads',
        description: `${totalLeads || 0} leads no total`,
        type: 'source',
        sourceFilter: null,
        leadCount: totalLeads || 0
      });

      setCampaigns(allCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  }

  async function countLeads() {
    setCountLoading(true);
    const campaign = campaigns.find(c => c.id === selectedCampaign);
    
    if (!campaign) {
      setLeadCount(0);
      setPhoneStats({ total: 0, withPhone: 0, withoutPhone: 0 });
      setCountLoading(false);
      return;
    }

    try {
      let query = supabase.from('leads').select('id, phone');
      
      if (campaign.type === 'batch' && campaign.batchId) {
        // Filtrar por batch_id
        query = query.eq('import_batch_id', campaign.batchId);
      } else if (campaign.sourceFilter) {
        // Filtrar por source
        if (campaign.sourceFilter.includes('%')) {
          query = query.ilike('source', campaign.sourceFilter);
        } else {
          query = query.eq('source', campaign.sourceFilter);
        }
      }
      // Se sourceFilter é null, busca todos

      const { data, error } = await query;
      
      if (!error && data) {
        const total = data.length;
        const withPhone = data.filter(lead => lead.phone && lead.phone.trim() !== '').length;
        const withoutPhone = total - withPhone;
        
        setLeadCount(total);
        setPhoneStats({ total, withPhone, withoutPhone });
      }
    } catch (error) {
      console.error('Error counting leads:', error);
    }
    setCountLoading(false);
  }

  // Calcular tempo estimado de envio
  function getEstimatedTime(count: number): string {
    const totalMs = count * MESSAGE_DELAY_MS;
    const seconds = Math.ceil(totalMs / 1000);
    
    if (seconds < 60) {
      return `~${seconds} segundos`;
    } else {
      const minutes = Math.ceil(seconds / 60);
      return `~${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
  }

  // Preview da mensagem com variáveis substituídas
  function getMessagePreview(msg: string): string {
    return msg.replace(/\{\{nome\}\}/gi, 'Maria Silva');
  }

  async function handleSubmit() {
    if (!selectedCampaign || !selectedTemplateId || !message) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const campaign = campaigns.find(c => c.id === selectedCampaign);
    if (!campaign) return;

    setLoading(true);

    try {
      if (scheduleNow) {
        // Buscar leads baseado no tipo de campanha
        let query = supabase.from('leads').select('id, full_name, email, phone');
        
        if (campaign.type === 'batch' && campaign.batchId) {
          query = query.eq('import_batch_id', campaign.batchId);
        } else if (campaign.sourceFilter) {
          if (campaign.sourceFilter.includes('%')) {
            query = query.ilike('source', campaign.sourceFilter);
          } else {
            query = query.eq('source', campaign.sourceFilter);
          }
        }

        const { data: filteredLeads, error: leadsError } = await query;
        
        if (leadsError) throw leadsError;

        if (!filteredLeads || filteredLeads.length === 0) {
          toast.error('Nenhum lead encontrado para esta campanha');
          setLoading(false);
          return;
        }

        const recipients = filteredLeads.map(lead => ({
          id: lead.id,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone
        }));

        const { data: session } = await supabase.auth.getSession();
        
        if (channel === 'whatsapp') {
          // Enviar via Evolution API
          const recipientsWithPhone = recipients.filter(r => r.phone);
          
          if (recipientsWithPhone.length === 0) {
            toast.error('Nenhum lead possui telefone cadastrado');
            setLoading(false);
            return;
          }

          const response = await supabase.functions.invoke('send-bulk-whatsapp', {
            body: {
              recipients: recipientsWithPhone.map(r => ({
                id: r.id,
                name: r.name,
                phone: r.phone,
                type: 'lead'
              })),
              message,
              templateId: selectedTemplateId
            }
          });

          if (response.error) throw response.error;

          const result = response.data;
          toast.success(`${result?.sent || 0} mensagens WhatsApp enviadas${result?.failed > 0 ? `, ${result.failed} falha(s)` : ''}!`);
        } else {
          // Enviar via email
          const response = await supabase.functions.invoke('send-bulk-email', {
            body: {
              recipients,
              subject: channel === 'email' ? subject : undefined,
              message,
              channel,
              recipientType: 'lead',
              templateId: selectedTemplateId
            }
          });

          if (response.error) throw response.error;

          toast.success(`${response.data?.sentCount || 0} e-mails enviados com sucesso!`);
        }
        
        handleClose();
        onSuccess?.();
      } else {
        // Agendar para depois
        if (!selectedDate) {
          toast.error('Selecione uma data para o agendamento');
          setLoading(false);
          return;
        }

        // Criar timestamp com horário de Brasília
        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);

        // Verificar se a data está no futuro
        const now = getBrazilNow();
        if (scheduledDate <= now) {
          toast.error('A data de agendamento deve ser no futuro');
          setLoading(false);
          return;
        }

        const { data: session } = await supabase.auth.getSession();

        // Para campanhas de batch, salvar batch_id no metadata
        const metadata = campaign.type === 'batch' && campaign.batchId 
          ? { batch_id: campaign.batchId }
          : null;

        const { error } = await supabase
          .from('scheduled_messages')
          .insert({
            template_id: selectedTemplateId,
            channel,
            subject: channel === 'email' ? subject : null,
            message,
            source_filter: campaign.type === 'batch' ? `batch:${campaign.batchId}` : campaign.sourceFilter,
            recipient_count: leadCount,
            scheduled_for: scheduledDate.toISOString(),
            status: 'pending',
            created_by: session?.session?.user?.id
          });

        if (error) throw error;

        toast.success(`Disparo agendado para ${format(scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} (horário de Brasília)`);
        handleClose();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Erro ao processar disparo:', error);
      toast.error(error.message || 'Erro ao processar disparo');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep(1);
    setSelectedCampaign('');
    setSelectedTemplateId('');
    setChannel('email');
    setSubject('');
    setMessage('');
    setScheduleNow(true);
    setSelectedDate(undefined);
    setSelectedHour('09');
    setSelectedMinute('00');
    onOpenChange(false);
  }

  function getTemplateIcon(iconName: string | null) {
    switch (iconName) {
      case 'Video': return <Video className="w-5 h-5" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5" />;
      default: return <Mail className="w-5 h-5" />;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Disparo por Campanha
          </DialogTitle>
          <DialogDescription>
            Envie mensagens em massa para um grupo específico de leads
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm hidden sm:block ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s === 1 ? 'Destinatários' : s === 2 ? 'Template' : 'Agendamento'}
                </span>
                {s < 3 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Selecionar Campanha */}
          {step === 1 && (
            <div className="space-y-4">
            <div>
              <Label>Selecionar Campanha</Label>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Escolha uma campanha..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {campaigns.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        Nenhuma campanha disponível
                      </div>
                    ) : (
                      campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          <div className="flex items-center gap-2">
                            {getCampaignIcon(campaign)}
                            <div className="flex flex-col">
                              <span>{campaign.label}</span>
                              <span className="text-xs text-muted-foreground">{campaign.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedCampaign && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Leads encontrados</p>
                      <p className="text-2xl font-bold">
                        {countLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          leadCount
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Estatísticas de telefone */}
                  {!countLoading && phoneStats.total > 0 && (
                    <div className="pt-2 border-t border-border/50 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">Com telefone:</span>
                        <span className="font-medium text-green-600">{phoneStats.withPhone}</span>
                        <span className="text-muted-foreground">
                          ({Math.round((phoneStats.withPhone / phoneStats.total) * 100)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneOff className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Sem telefone:</span>
                        <span className="font-medium">{phoneStats.withoutPhone}</span>
                        <span className="text-xs text-muted-foreground">(ignorados no WhatsApp)</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedCampaign || leadCount === 0}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Selecionar Template */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Canal de Envio</Label>
              <div className="flex gap-2 mt-1.5">
                <Button
                  type="button"
                  variant={channel === 'email' ? 'default' : 'outline'}
                  onClick={() => setChannel('email')}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  E-mail
                </Button>
                <Button
                  type="button"
                  variant={channel === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setChannel('whatsapp')}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div>
              <Label>Selecionar Template</Label>
              <div className="grid grid-cols-1 gap-2 mt-1.5">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplateId === template.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="text-primary">
                        {getTemplateIcon(template.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{template.name}</p>
                        {template.email_subject && (
                          <p className="text-sm text-muted-foreground">{template.email_subject}</p>
                        )}
                      </div>
                      {selectedTemplateId === template.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {channel === 'email' && selectedTemplateId && (
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}

            {selectedTemplateId && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="mt-1.5"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      Variável disponível: {'{{nome}}'} - será substituído pelo nome do lead
                    </p>
                    {channel === 'whatsapp' && (
                      <span className="text-xs text-muted-foreground">
                        {message.length} caracteres
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview WhatsApp */}
                {channel === 'whatsapp' && message && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Preview da mensagem</Label>
                    <div className="bg-[#0b141a] p-4 rounded-lg">
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-[#005c4b] rounded-lg rounded-tr-none px-3 py-2 shadow-sm">
                          <p className="text-sm text-white whitespace-pre-wrap break-words">
                            {getMessagePreview(message)}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] text-white/60">
                              {format(new Date(), 'HH:mm')}
                            </span>
                            <CheckCircle className="w-3 h-3 text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rate limiting warning */}
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                      <Info className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-sm">
                        <strong>{phoneStats.withPhone} mensagens</strong> serão enviadas com intervalo de 500ms.
                        <br />
                        <span className="text-muted-foreground">
                          Tempo estimado: {getEstimatedTime(phoneStats.withPhone)}
                        </span>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!selectedTemplateId || !message}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Agendamento */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium">{leadCount} leads</span>
                  </div>
                  <Badge variant="outline">
                    {channel === 'email' ? 'E-mail' : 'WhatsApp'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enviar agora?</Label>
                <p className="text-sm text-muted-foreground">
                  {scheduleNow 
                    ? 'Os e-mails serão enviados imediatamente' 
                    : 'Agende para uma data e hora específica'}
                </p>
              </div>
              <Switch
                checked={scheduleNow}
                onCheckedChange={setScheduleNow}
              />
            </div>

            {!scheduleNow && (
              <div className="space-y-4 p-4 rounded-lg border bg-card">
                <div>
                  <Label>Data do Disparo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1.5"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate 
                          ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < getBrazilToday()}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hora</Label>
                    <Select value={selectedHour} onValueChange={setSelectedHour}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Minuto</Label>
                    <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MINUTES.map((min) => (
                          <SelectItem key={min} value={min}>
                            {min}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Horário de Brasília (GMT-3)</span>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || (!scheduleNow && !selectedDate)}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {scheduleNow ? 'Enviar Agora' : 'Agendar Disparo'}
              </Button>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
