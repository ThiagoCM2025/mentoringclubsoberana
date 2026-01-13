import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Timer,
  Mail,
  Calendar
} from "lucide-react";
import { getBrazilNow } from "@/lib/dateUtils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CronJob {
  name: string;
  schedule: string;
  brazilHour: number;
  type: 'daily' | 'hourly' | 'interval';
  description: string;
}

interface NextExecution {
  name: string;
  type: 'daily' | 'hourly' | 'interval';
  scheduledTime: Date;
  countdown: string;
}

interface ExecutionHistory {
  id: string;
  executed_at: string;
  emails_sent: number;
  errors_count: number;
  status: string;
  execution_time_ms: number | null;
  trigger?: string;
}

// Configuração dos cron jobs ativos no sistema
const CRON_JOBS: CronJob[] = [
  { 
    name: 'nurturing-automation-9h', 
    schedule: '0 12 * * *', 
    brazilHour: 9, 
    type: 'daily',
    description: 'Disparo diário 9h'
  },
  { 
    name: 'nurturing-automation-15h', 
    schedule: '0 18 * * *', 
    brazilHour: 15, 
    type: 'daily',
    description: 'Disparo diário 15h'
  },
  { 
    name: 'nurturing-automation-21h', 
    schedule: '0 0 * * *', 
    brazilHour: 21, 
    type: 'daily',
    description: 'Disparo diário 21h'
  },
  { 
    name: 'nurturing-email-hourly', 
    schedule: '0 * * * *', 
    brazilHour: -1, // Indica horário variável
    type: 'hourly',
    description: 'Disparo a cada hora'
  },
  { 
    name: 'process-jornada-reminders', 
    schedule: '*/5 * * * *', 
    brazilHour: -1,
    type: 'interval',
    description: 'Jornada - Lembretes a cada 5 min'
  },
  { 
    name: 'process-scheduled-messages', 
    schedule: '*/5 * * * *', 
    brazilHour: -1,
    type: 'interval',
    description: 'Disparos agendados a cada 5 min'
  },
];

export const CronJobsStatus = () => {
  const [executions, setExecutions] = useState<ExecutionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(getBrazilNow());

  useEffect(() => {
    fetchExecutions();
    
    // Atualizar o contador a cada minuto
    const interval = setInterval(() => {
      setCurrentTime(getBrazilNow());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data } = await supabase
      .from("nurturing_executions")
      .select("id, executed_at, emails_sent, errors_count, status, execution_time_ms")
      .gte("executed_at", twentyFourHoursAgo.toISOString())
      .order("executed_at", { ascending: false });

    if (data) {
      setExecutions(data);
    }
    setLoading(false);
  };

  // Calcular próximas execuções
  const nextExecutions = useMemo((): NextExecution[] => {
    const now = currentTime;
    const results: NextExecution[] = [];

    // Próximo disparo horário
    const nextHourly = new Date(now);
    nextHourly.setMinutes(0, 0, 0);
    nextHourly.setHours(nextHourly.getHours() + 1);
    
    results.push({
      name: 'nurturing-email-hourly',
      type: 'hourly',
      scheduledTime: nextHourly,
      countdown: formatCountdown(nextHourly, now)
    });

    // Próximos disparos diários
    const dailyHours = [9, 15, 21];
    const todayDailySchedules: NextExecution[] = [];

    for (const hour of dailyHours) {
      const scheduled = new Date(now);
      scheduled.setHours(hour, 0, 0, 0);

      // Se já passou hoje, agendar para amanhã
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }

      todayDailySchedules.push({
        name: `nurturing-automation-${hour}h`,
        type: 'daily',
        scheduledTime: scheduled,
        countdown: formatCountdown(scheduled, now)
      });
    }

    results.push(...todayDailySchedules);

    // Ordenar por horário
    return results.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()).slice(0, 5);
  }, [currentTime]);

  // Estatísticas das últimas 24h
  const stats24h = useMemo(() => {
    const totalEmails = executions.reduce((sum, e) => sum + (e.emails_sent || 0), 0);
    const totalErrors = executions.reduce((sum, e) => sum + (e.errors_count || 0), 0);
    const totalExecutions = executions.length;
    const successRate = totalExecutions > 0 
      ? Math.round(((totalExecutions - executions.filter(e => e.status === 'error').length) / totalExecutions) * 100)
      : 100;

    return { totalEmails, totalErrors, totalExecutions, successRate };
  }, [executions]);

  // Status do sistema
  const systemStatus = useMemo(() => {
    const hasRecentErrors = executions.some(e => e.status === 'error');
    const hasRecentExecution = executions.length > 0;
    
    // Verificar se houve execução na última hora
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const hasRecentHourlyExecution = executions.some(
      e => new Date(e.executed_at) > oneHourAgo
    );

    if (hasRecentErrors) return { status: 'warning', label: 'Com Erros', color: 'bg-yellow-100 text-yellow-700' };
    if (!hasRecentExecution || !hasRecentHourlyExecution) return { status: 'warning', label: 'Verificar', color: 'bg-yellow-100 text-yellow-700' };
    return { status: 'active', label: 'Ativo', color: 'bg-green-100 text-green-700' };
  }, [executions]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const formatExecutionTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Agendamento Automático
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={systemStatus.color}>
              {systemStatus.status === 'active' ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {systemStatus.label}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchExecutions}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Próximas Execuções */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            PRÓXIMAS EXECUÇÕES
          </p>
          <div className="space-y-1.5">
            {nextExecutions.slice(0, 4).map((exec, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${exec.type === 'hourly' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}
                  >
                    {formatTime(exec.scheduledTime)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {exec.type === 'hourly' ? 'Horário' : 'Diário'}
                  </span>
                </div>
                <span className="text-xs font-medium text-primary">
                  {exec.countdown}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico das Últimas 24h */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            HISTÓRICO 24H
          </p>
          {loading ? (
            <div className="text-center py-2 text-muted-foreground text-xs">Carregando...</div>
          ) : executions.length === 0 ? (
            <div className="text-center py-2 text-muted-foreground text-xs">Nenhuma execução</div>
          ) : (
            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {executions.slice(0, 12).map((exec) => (
                <div 
                  key={exec.id} 
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {exec.status === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : exec.emails_sent > 0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                    )}
                    <span className="font-mono text-muted-foreground">
                      {formatExecutionTime(exec.executed_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 ${exec.emails_sent > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      <Mail className="w-3 h-3" />
                      {exec.emails_sent}
                    </span>
                    {exec.execution_time_ms && (
                      <span className="text-muted-foreground">
                        {(exec.execution_time_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              📊 24h: <span className="font-medium text-foreground">{stats24h.totalEmails}</span> emails 
              {stats24h.totalErrors > 0 && (
                <span className="text-red-500"> • {stats24h.totalErrors} erros</span>
              )}
              {stats24h.totalErrors === 0 && (
                <span className="text-green-600"> • {stats24h.successRate}% sucesso</span>
              )}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ⚙️ 4 cron jobs: Diário (9h, 15h, 21h) + Horário
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper para formatar countdown
function formatCountdown(targetDate: Date, now: Date): string {
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `em ${diffMins} min`;
  }
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (mins === 0) {
    return `em ${hours}h`;
  }
  
  return `em ${hours}h ${mins}min`;
}
