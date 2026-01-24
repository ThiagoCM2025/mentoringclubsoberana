import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface ScheduledMessage {
  id: string;
  channel: string;
  subject: string | null;
  message: string;
  source_filter: string | null;
  recipient_count: number;
  scheduled_for: string;
  status: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
  template: {
    name: string;
    icon: string | null;
  } | null;
}

export function ScheduledMessagesPanel() {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledMessages();
  }, []);

  async function fetchScheduledMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('scheduled_messages')
      .select(`
        *,
        template:template_id (
          name,
          icon
        )
      `)
      .order('scheduled_for', { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setScheduledMessages(data as unknown as ScheduledMessage[]);
    }
    setLoading(false);
  }

  async function handleCancel(id: string) {
    setCancelling(id);
    const { error } = await supabase
      .from('scheduled_messages')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (error) {
      toast.error('Erro ao cancelar disparo');
    } else {
      toast.success('Disparo cancelado');
      fetchScheduledMessages();
    }
    setCancelling(null);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Agendado</Badge>;
      case 'processing':
        return <Badge className="gap-1 bg-blue-500"><Loader2 className="w-3 h-3 animate-spin" /> Processando</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" /> Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Falhou</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="gap-1"><XCircle className="w-3 h-3" /> Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  function getCampaignLabel(sourceFilter: string | null) {
    if (!sourceFilter) return 'Todos os Leads';
    if (sourceFilter === 'importação_excel') return 'Convite Jornada';
    if (sourceFilter.includes('jornada')) return 'Jornada Cadastrados';
    if (sourceFilter.includes('exit_intent')) return 'Exit Intent';
    if (sourceFilter.includes('ebook')) return 'E-book Downloads';
    return sourceFilter;
  }

  const pendingMessages = scheduledMessages.filter(m => m.status === 'pending');
  const historyMessages = scheduledMessages.filter(m => m.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Disparos Agendados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Disparos Agendados
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchScheduledMessages}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum disparo agendado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {msg.channel === 'email' ? (
                        <Mail className="w-4 h-4 text-primary" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {msg.template?.name || 'Template não encontrado'}
                        </p>
                        {getStatusBadge(msg.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {msg.recipient_count} leads
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(msg.scheduled_for), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <span className="text-muted-foreground/60">
                          ({getCampaignLabel(msg.source_filter)})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        {cancelling === msg.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar disparo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá cancelar o disparo agendado para{' '}
                          {format(new Date(msg.scheduled_for), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Manter Agendado</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancel(msg.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancelar Disparo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Disparos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            Histórico de Disparos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum disparo realizado ainda</p>
            </div>
          ) : (
            <ResponsiveTable minWidth="600px">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Agendado para</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Enviados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {msg.channel === 'email' ? (
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{msg.template?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCampaignLabel(msg.source_filter)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(msg.scheduled_for), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(msg.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {msg.status === 'completed' ? (
                          <span className="text-green-600 font-medium">
                            {msg.sent_count}/{msg.recipient_count}
                          </span>
                        ) : msg.status === 'failed' ? (
                          <span className="text-destructive">
                            {msg.error_message?.substring(0, 30) || 'Erro'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
