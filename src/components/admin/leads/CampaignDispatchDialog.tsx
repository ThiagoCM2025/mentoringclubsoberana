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
  BookOpen,
  Target,
  Zap,
  Trash2
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

interface OriginOption {
  id: string;
  label: string;
  description: string;
  type: 'batch' | 'source';
  batchId?: string;
  sourceFilter?: string | null;
  leadCount?: number;
  createdAt?: string;
}

interface CampaignOption {
  id: string;
  name: string;
  sourceFilter: string;
  stepsCount: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: `${i.toString().padStart(2, '0')}:00`
}));

const MINUTES = ['00', '15', '30', '45'];
const MESSAGE_DELAY_MS = 500;

function getOriginIcon(origin: OriginOption) {
  if (origin.type === 'batch') {
    return <FileSpreadsheet className="w-5 h-5 text-purple-500" />;
  }
  const source = origin.sourceFilter?.toLowerCase() || '';
  if (source.includes('jornada')) return <Home className="w-5 h-5 text-yellow-500" />;
  if (source.includes('ebook')) return <BookOpen className="w-5 h-5 text-blue-500" />;
  if (source.includes('operacao') || source.includes('operação')) return <Megaphone className="w-5 h-5 text-green-500" />;
  return <Sparkles className="w-5 h-5 text-amber-500" />;
}

export function CampaignDispatchDialog({ open, onOpenChange, onSuccess, preselectedBatchId }: CampaignDispatchDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Origins (Step 1)
  const [origins, setOrigins] = useState<OriginOption[]>([]);
  const [originsLoading, setOriginsLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  
  // Campaigns (Step 2)
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('direct'); // 'direct' = envio direto
  
  // Lead stats
  const [leadCount, setLeadCount] = useState<number>(0);
  const [phoneStats, setPhoneStats] = useState<LeadPhoneStats>({ total: 0, withPhone: 0, withoutPhone: 0 });
  const [countLoading, setCountLoading] = useState(false);
  
  // Step 3: Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Step 4: Agendamento
  const [scheduleNow, setScheduleNow] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');

  useEffect(() => {
    if (open) {
      fetchTemplates();
      fetchOrigins();
      fetchCampaigns();
    }
  }, [open]);

  useEffect(() => {
    if (preselectedBatchId && origins.length > 0) {
      const origin = origins.find(o => o.batchId === preselectedBatchId);
      if (origin) {
        setSelectedOrigin(origin.id);
      }
    }
  }, [preselectedBatchId, origins]);

  useEffect(() => {
    if (selectedOrigin) {
      countLeads();
    }
  }, [selectedOrigin]);

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

  async function fetchOrigins() {
    setOriginsLoading(true);
    const allOrigins: OriginOption[] = [];

    try {
      // 1. Named import lists
      const { data: importLists } = await supabase
        .from('import_lists')
        .select('id, name, batch_id, lead_count, created_at')
        .order('created_at', { ascending: false });

      if (importLists) {
        importLists.forEach(list => {
          allOrigins.push({
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

      // 2. Automatic sources
      const { data: sources } = await supabase
        .from('leads')
        .select('source')
        .not('source', 'is', null);

      if (sources) {
        const sourceCounts: Record<string, number> = {};
        sources.forEach(lead => {
          if (lead.source) {
            sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
          }
        });

        const knownPatterns = ['jornada', 'ebook', 'operacao', 'operação', 'exit_intent', 'nurturing'];
        
        Object.entries(sourceCounts).forEach(([source, count]) => {
          const lowerSource = source.toLowerCase();
          const isKnownPattern = knownPatterns.some(p => lowerSource.includes(p));
          
          if (isKnownPattern && !lowerSource.includes('importação') && !lowerSource.includes('importacao')) {
            const label = source
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            allOrigins.push({
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

      // 3. All leads option
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      allOrigins.push({
        id: 'all_leads',
        label: 'Todos os Leads',
        description: `${totalLeads || 0} leads no total`,
        type: 'source',
        sourceFilter: null,
        leadCount: totalLeads || 0
      });

      setOrigins(allOrigins);
    } catch (error) {
      console.error('Error fetching origins:', error);
    } finally {
      setOriginsLoading(false);
    }
  }

  async function fetchCampaigns() {
    setCampaignsLoading(true);
    try {
      const { data } = await supabase
        .from('nurturing_sequences')
        .select('source_filter, name')
        .order('step_number');

      if (data) {
        // Group by source_filter to get unique campaigns
        const campaignMap = new Map<string, { name: string; count: number }>();
        data.forEach(seq => {
          const key = seq.source_filter;
          if (!campaignMap.has(key)) {
            campaignMap.set(key, { name: seq.name.split(' - ')[0], count: 1 });
          } else {
            const existing = campaignMap.get(key)!;
            existing.count++;
          }
        });

        const campaignOptions: CampaignOption[] = Array.from(campaignMap.entries()).map(([filter, info]) => ({
          id: filter,
          name: info.name,
          sourceFilter: filter,
          stepsCount: info.count
        }));

        setCampaigns(campaignOptions);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  }

  async function countLeads() {
    setCountLoading(true);
    const origin = origins.find(o => o.id === selectedOrigin);
    
    if (!origin) {
      setLeadCount(0);
      setPhoneStats({ total: 0, withPhone: 0, withoutPhone: 0 });
      setCountLoading(false);
      return;
    }

    try {
      let query = supabase.from('leads').select('id, phone');
      
      if (origin.type === 'batch' && origin.batchId) {
        query = query.eq('import_batch_id', origin.batchId);
      } else if (origin.sourceFilter) {
        if (origin.sourceFilter.includes('%')) {
          query = query.ilike('source', origin.sourceFilter);
        } else {
          query = query.eq('source', origin.sourceFilter);
        }
      }

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

  function getMessagePreview(msg: string): string {
    return msg.replace(/\{\{nome\}\}/gi, 'Maria Silva');
  }

  async function handleSubmit() {
    if (!selectedOrigin || !selectedTemplateId || !message) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const origin = origins.find(o => o.id === selectedOrigin);
    if (!origin) return;

    setLoading(true);

    try {
      if (scheduleNow) {
        let query = supabase.from('leads').select('id, full_name, email, phone');
        
        if (origin.type === 'batch' && origin.batchId) {
          query = query.eq('import_batch_id', origin.batchId);
        } else if (origin.sourceFilter) {
          if (origin.sourceFilter.includes('%')) {
            query = query.ilike('source', origin.sourceFilter);
          } else {
            query = query.eq('source', origin.sourceFilter);
          }
        }

        const { data: filteredLeads, error: leadsError } = await query;
        
        if (leadsError) throw leadsError;

        if (!filteredLeads || filteredLeads.length === 0) {
          toast.error('Nenhum lead encontrado para esta origem');
          setLoading(false);
          return;
        }

        const recipients = filteredLeads.map(lead => ({
          id: lead.id,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone
        }));

        if (channel === 'whatsapp') {
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
        if (!selectedDate) {
          toast.error('Selecione uma data para o agendamento');
          setLoading(false);
          return;
        }

        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);

        const now = getBrazilNow();
        if (scheduledDate <= now) {
          toast.error('A data de agendamento deve ser no futuro');
          setLoading(false);
          return;
        }

        const { data: session } = await supabase.auth.getSession();

        const { error } = await supabase
          .from('scheduled_messages')
          .insert({
            template_id: selectedTemplateId,
            channel,
            subject: channel === 'email' ? subject : null,
            message,
            source_filter: origin.type === 'batch' ? `batch:${origin.batchId}` : origin.sourceFilter,
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
    setSelectedOrigin('');
    setSelectedCampaign('direct');
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

  const selectedOriginData = origins.find(o => o.id === selectedOrigin);

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
          {/* 4-Step Stepper */}
          <div className="flex items-center gap-1 mb-6">
            {[
              { num: 1, label: 'Origem' },
              { num: 2, label: 'Campanha' },
              { num: 3, label: 'Template' },
              { num: 4, label: 'Agendamento' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center gap-1 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs hidden md:block ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {idx < 3 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Selecionar Origem */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">De onde vêm os leads?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione a lista importada ou fonte automática
                </p>
                
                {originsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {origins.map((origin) => (
                      <Card 
                        key={origin.id}
                        className={`cursor-pointer transition-all ${
                          selectedOrigin === origin.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedOrigin(origin.id)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          {getOriginIcon(origin)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{origin.label}</p>
                            <p className="text-sm text-muted-foreground">{origin.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedOrigin === origin.id && (
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                            {origin.type === 'batch' && origin.batchId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!confirm('Excluir esta lista? Os leads importados não serão afetados.')) return;
                                  
                                  const { error } = await supabase
                                    .from('import_lists')
                                    .delete()
                                    .eq('batch_id', origin.batchId);
                                  
                                  if (error) {
                                    toast.error('Erro ao excluir lista');
                                    console.error(error);
                                  } else {
                                    toast.success('Lista removida');
                                    if (selectedOrigin === origin.id) {
                                      setSelectedOrigin('');
                                    }
                                    fetchOrigins();
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {selectedOrigin && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Leads encontrados</p>
                        <p className="text-2xl font-bold">
                          {countLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : leadCount}
                        </p>
                      </div>
                    </div>
                    
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
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button onClick={() => setStep(2)} disabled={!selectedOrigin || leadCount === 0}>
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Selecionar Campanha/Sequência */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Qual campanha aplicar?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Escolha uma sequência de nurturing ou envio direto
                </p>
                
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Envio Direto - Always first */}
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedCampaign === 'direct' 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCampaign('direct')}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <div className="flex-1">
                          <p className="font-medium">Envio Direto</p>
                          <p className="text-sm text-muted-foreground">
                            Mensagem única sem sequência automática
                          </p>
                        </div>
                        {selectedCampaign === 'direct' && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>

                    {/* Nurturing Sequences */}
                    {campaigns.map((campaign) => (
                      <Card 
                        key={campaign.id}
                        className={`cursor-pointer transition-all ${
                          selectedCampaign === campaign.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedCampaign(campaign.id)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <Target className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.stepsCount} etapas na sequência
                            </p>
                          </div>
                          {selectedCampaign === campaign.id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    {selectedOriginData && getOriginIcon(selectedOriginData)}
                    <span className="font-medium">{selectedOriginData?.label}</span>
                    <Badge variant="secondary">{leadCount} leads</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => setStep(3)}>
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Selecionar Template */}
          {step === 3 && (
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
                <div className="grid grid-cols-1 gap-2 mt-1.5 max-h-[200px] overflow-y-auto">
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
                            <p className="text-sm text-muted-foreground truncate">{template.email_subject}</p>
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
                      rows={4}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Variável disponível: {'{{nome}}'}
                    </p>
                  </div>

                  {channel === 'whatsapp' && message && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Preview</Label>
                      <div className="bg-[#0b141a] p-3 rounded-lg">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] bg-[#005c4b] rounded-lg rounded-tr-none px-3 py-2 shadow-sm">
                            <p className="text-sm text-white whitespace-pre-wrap break-words">
                              {getMessagePreview(message)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Alert className="border-amber-500/50 bg-amber-500/10">
                        <Info className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-sm">
                          <strong>{phoneStats.withPhone} mensagens</strong> - Tempo: {getEstimatedTime(phoneStats.withPhone)}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={() => setStep(4)} disabled={!selectedTemplateId || !message}>
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Agendamento */}
          {step === 4 && (
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
                      ? 'As mensagens serão enviadas imediatamente' 
                      : 'Agende para uma data e hora específica'}
                  </p>
                </div>
                <Switch checked={scheduleNow} onCheckedChange={setScheduleNow} />
              </div>

              {!scheduleNow && (
                <div className="space-y-4 p-4 rounded-lg border bg-card">
                  <div>
                    <Label>Data do Disparo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal mt-1.5">
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
                <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
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
