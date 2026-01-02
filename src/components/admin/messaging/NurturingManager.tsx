import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Zap, 
  Mail, 
  Clock, 
  Save, 
  Play, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";

interface NurturingSequence {
  id: string;
  step_number: number;
  name: string;
  delay_hours: number;
  email_subject: string;
  email_body: string;
  is_active: boolean;
}

interface NurturingExecution {
  id: string;
  executed_at: string;
  emails_sent: number;
  errors_count: number;
  status: string;
  execution_time_ms: number | null;
}

interface LeadFunnelData {
  step: number;
  count: number;
  label: string;
}

interface StuckLead {
  id: string;
  full_name: string;
  email: string;
  nurturing_step: number;
  last_contact_at: string | null;
  days_stuck: number;
}

interface UpcomingSend {
  lead_name: string;
  lead_email: string;
  next_step: number;
  estimated_send: Date;
}

export const NurturingManager = () => {
  const { toast } = useToast();
  const [sequences, setSequences] = useState<NurturingSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [editingSequence, setEditingSequence] = useState<NurturingSequence | null>(null);
  const [stats, setStats] = useState({ active: 0, completed: 0, total: 0, inactive: 0 });
  const [funnelData, setFunnelData] = useState<LeadFunnelData[]>([]);
  const [stuckLeads, setStuckLeads] = useState<StuckLead[]>([]);
  const [upcomingSends, setUpcomingSends] = useState<UpcomingSend[]>([]);
  const [lastExecutions, setLastExecutions] = useState<NurturingExecution[]>([]);

  useEffect(() => {
    fetchSequences();
    fetchStats();
    fetchLastExecutions();

    // Realtime subscription for leads changes
    const channel = supabase
      .channel('leads-nurturing-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          console.log('Lead change detected in nurturing manager');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSequences = async () => {
    const { data, error } = await supabase
      .from("nurturing_sequences")
      .select("*")
      .order("step_number");

    if (data) setSequences(data);
    if (error) console.error("Error fetching sequences:", error);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data: leads } = await supabase
      .from("leads")
      .select("id, full_name, email, nurturing_active, nurturing_step, last_contact_at");

    const { data: seqs } = await supabase
      .from("nurturing_sequences")
      .select("step_number, delay_hours")
      .eq("is_active", true)
      .order("step_number");

    if (leads) {
      const active = leads.filter(l => l.nurturing_active);
      const completed = leads.filter(l => (l.nurturing_step || 0) >= 5);
      const inactive = leads.filter(l => !l.nurturing_active && (l.nurturing_step || 0) < 5);

      setStats({
        total: leads.length,
        active: active.length,
        completed: completed.length,
        inactive: inactive.length,
      });

      // Funnel data
      const funnel: LeadFunnelData[] = [
        { step: 0, count: leads.filter(l => (l.nurturing_step || 0) === 0).length, label: "Aguardando início" },
        { step: 1, count: leads.filter(l => l.nurturing_step === 1).length, label: "Etapa 1" },
        { step: 2, count: leads.filter(l => l.nurturing_step === 2).length, label: "Etapa 2" },
        { step: 3, count: leads.filter(l => l.nurturing_step === 3).length, label: "Etapa 3" },
        { step: 4, count: leads.filter(l => l.nurturing_step === 4).length, label: "Etapa 4" },
        { step: 5, count: leads.filter(l => (l.nurturing_step || 0) >= 5).length, label: "Completo" },
      ];
      setFunnelData(funnel);

      // Stuck leads (active but no contact in 3+ days)
      // NEW: Exclude new leads (step 0, no contact) - they're awaiting first email, not stuck
      const now = new Date();
      const stuck = active
        .filter(l => {
          const isNewLead = (l.nurturing_step || 0) === 0 && !l.last_contact_at;
          if (isNewLead) return false; // New leads are NOT stuck
          
          if (!l.last_contact_at) return true;
          const lastContact = new Date(l.last_contact_at);
          const daysSince = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince >= 3;
        })
        .map(l => ({
          id: l.id,
          full_name: l.full_name,
          email: l.email,
          nurturing_step: l.nurturing_step || 0,
          last_contact_at: l.last_contact_at,
          days_stuck: l.last_contact_at 
            ? Math.floor((now.getTime() - new Date(l.last_contact_at).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        }))
        .sort((a, b) => b.days_stuck - a.days_stuck)
        .slice(0, 5);
      setStuckLeads(stuck);

      // Upcoming sends - NEW: Include new leads with "immediate" send
      if (seqs) {
        const upcoming: UpcomingSend[] = [];
        for (const lead of active.slice(0, 15)) {
          const nextStep = (lead.nurturing_step || 0) + 1;
          const seq = seqs.find(s => s.step_number === nextStep);
          if (seq) {
            const isNewLead = (lead.nurturing_step || 0) === 0 && !lead.last_contact_at;
            
            if (isNewLead) {
              // New leads get immediate email on next cron run
              upcoming.push({
                lead_name: lead.full_name,
                lead_email: lead.email,
                next_step: nextStep,
                estimated_send: new Date(), // Immediate
              });
            } else if (lead.last_contact_at) {
              const lastContact = new Date(lead.last_contact_at);
              const estimatedSend = addHours(lastContact, seq.delay_hours);
              if (estimatedSend > now) {
                upcoming.push({
                  lead_name: lead.full_name,
                  lead_email: lead.email,
                  next_step: nextStep,
                  estimated_send: estimatedSend,
                });
              }
            }
          }
        }
        setUpcomingSends(upcoming.sort((a, b) => a.estimated_send.getTime() - b.estimated_send.getTime()).slice(0, 5));
      }
    }
  };

  const fetchLastExecutions = async () => {
    const { data } = await supabase
      .from("nurturing_executions")
      .select("id, executed_at, emails_sent, errors_count, status, execution_time_ms")
      .order("executed_at", { ascending: false })
      .limit(5);

    if (data) setLastExecutions(data);
  };

  const updateSequence = async (id: string, updates: Partial<NurturingSequence>) => {
    setSaving(id);
    const { error } = await supabase
      .from("nurturing_sequences")
      .update(updates)
      .eq("id", id);

    setSaving(null);
    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Sequência atualizada!" });
      fetchSequences();
    }
  };

  const runNurturing = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-nurturing-email");
      
      if (error) throw error;
      
      toast({
        title: "Nurturing executado!",
        description: data.message,
      });
      fetchStats();
      fetchLastExecutions();
    } catch (error: any) {
      toast({
        title: "Erro ao executar nurturing",
        description: error.message,
        variant: "destructive",
      });
    }
    setRunning(false);
  };

  const getStepColor = (step: number) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-green-100 text-green-700 border-green-200",
    ];
    return colors[step - 1] || colors[0];
  };

  const getFunnelColor = (step: number) => {
    if (step === 0) return "bg-muted";
    if (step === 5) return "bg-green-500";
    return `bg-primary/${20 + step * 15}`;
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Em nurturing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-yellow-100">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stuckLeads.length}</p>
                <p className="text-xs text-muted-foreground">Parados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-muted">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-4 pb-3">
            <Button 
              className="w-full h-full min-h-[48px]" 
              onClick={runNurturing}
              disabled={running}
              size="sm"
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Executar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Stuck + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Funil de Nurturing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {funnelData.map((item, idx) => {
              const maxCount = Math.max(...funnelData.map(f => f.count), 1);
              const width = Math.max((item.count / maxCount) * 100, 10);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs w-24 text-muted-foreground truncate">{item.label}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.step === 5 ? 'bg-green-500' : 'bg-primary'} transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-xs font-medium text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Stuck Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Leads Parados
            </CardTitle>
            <CardDescription className="text-xs">Sem contato há 3+ dias</CardDescription>
          </CardHeader>
          <CardContent>
            {stuckLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum lead parado!</p>
            ) : (
              <div className="space-y-2">
                {stuckLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <div className="truncate flex-1">
                      <p className="font-medium truncate">{lead.full_name}</p>
                      <p className="text-xs text-muted-foreground">Etapa {lead.nurturing_step}/5</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                      {lead.days_stuck}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sends */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Próximos Envios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum envio agendado</p>
            ) : (
              <div className="space-y-2">
                {upcomingSends.map((send, idx) => {
                  const isImmediate = send.next_step === 1 && send.estimated_send <= new Date();
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                      <div className="truncate flex-1">
                        <p className="font-medium truncate">{send.lead_name}</p>
                        <p className="text-xs text-muted-foreground">Etapa {send.next_step}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${isImmediate ? 'text-green-600 border-green-300' : ''}`}
                      >
                        {isImmediate ? "Imediato" : formatDistanceToNow(send.estimated_send, { addSuffix: true, locale: ptBR })}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Executions */}
      {lastExecutions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Últimas Execuções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lastExecutions.map((exec) => (
                <Badge 
                  key={exec.id} 
                  variant="outline" 
                  className={`text-xs ${exec.status === 'error' ? 'border-red-300 text-red-600' : exec.status === 'partial' ? 'border-yellow-300 text-yellow-600' : 'border-green-300 text-green-600'}`}
                >
                  {format(new Date(exec.executed_at), "dd/MM HH:mm", { locale: ptBR })} • {exec.emails_sent} enviados
                  {exec.errors_count > 0 && ` • ${exec.errors_count} erros`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sequences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sequência de Nurturing
          </CardTitle>
          <CardDescription>
            Configure a sequência automática de emails. Use {"{{nome}}"} para inserir o nome do lead.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sequences.map((seq) => (
            <div 
              key={seq.id} 
              className={`p-4 rounded-lg border transition-all ${
                seq.is_active ? "bg-card" : "bg-muted/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getStepColor(seq.step_number)}`}>
                  {seq.step_number}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{seq.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {seq.delay_hours}h
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${seq.id}`} className="text-sm text-muted-foreground">
                        Ativo
                      </Label>
                      <Switch
                        id={`active-${seq.id}`}
                        checked={seq.is_active}
                        onCheckedChange={(checked) => updateSequence(seq.id, { is_active: checked })}
                      />
                    </div>
                  </div>

                  {editingSequence?.id === seq.id ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome da etapa</Label>
                          <Input
                            value={editingSequence.name}
                            onChange={(e) => setEditingSequence({ ...editingSequence, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Delay (horas)</Label>
                          <Input
                            type="number"
                            value={editingSequence.delay_hours}
                            onChange={(e) => setEditingSequence({ ...editingSequence, delay_hours: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Assunto do email</Label>
                        <Input
                          value={editingSequence.email_subject}
                          onChange={(e) => setEditingSequence({ ...editingSequence, email_subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Corpo do email</Label>
                        <Textarea
                          value={editingSequence.email_body}
                          onChange={(e) => setEditingSequence({ ...editingSequence, email_body: e.target.value })}
                          rows={5}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            updateSequence(seq.id, {
                              name: editingSequence.name,
                              delay_hours: editingSequence.delay_hours,
                              email_subject: editingSequence.email_subject,
                              email_body: editingSequence.email_body,
                            });
                            setEditingSequence(null);
                          }}
                          disabled={saving === seq.id}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {saving === seq.id ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSequence(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2 transition-colors"
                      onClick={() => setEditingSequence(seq)}
                    >
                      <p className="font-medium text-sm">{seq.email_subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {seq.email_body}
                      </p>
                      <p className="text-xs text-primary mt-2">Clique para editar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Como funciona o nurturing automático:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Novos leads são automaticamente ativados no nurturing</li>
                <li>Cada etapa é enviada após o delay configurado desde o último contato</li>
                <li>O cron job executa a cada hora automaticamente</li>
                <li>Use o botão "Executar" para processar manualmente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
