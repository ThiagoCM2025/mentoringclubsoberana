import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MessageSquare, Bell, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  recipient_id: string;
  recipient_type: string;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  channel: string;
  subject: string | null;
  message: string;
  status: string | null;
  sent_at: string | null;
}

export function MessageHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<HistoryItem | null>(null);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [channelFilter, typeFilter, statusFilter]);

  async function fetchHistory() {
    setLoading(true);
    try {
      let query = supabase
        .from("communication_history")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);

      if (channelFilter !== "all") {
        query = query.eq("channel", channelFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("recipient_type", typeFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }

  const failedWhatsappMessages = history.filter(
    (h) => h.status === "failed" && h.channel === "whatsapp" && h.recipient_phone
  );

  const handleResendFailed = async () => {
    if (failedWhatsappMessages.length === 0) return;

    setIsResending(true);
    setResendDialogOpen(false);

    try {
      // Group messages by their content to resend in batches
      const messageGroups = new Map<string, HistoryItem[]>();
      
      failedWhatsappMessages.forEach((msg) => {
        const key = msg.message;
        if (!messageGroups.has(key)) {
          messageGroups.set(key, []);
        }
        messageGroups.get(key)!.push(msg);
      });

      let totalSuccess = 0;
      let totalFailed = 0;

      for (const [message, messages] of messageGroups) {
        const recipients = messages.map((msg) => ({
          id: msg.recipient_id,
          name: msg.recipient_name || "Sem nome",
          phone: msg.recipient_phone,
          type: msg.recipient_type,
        }));

        const { data, error } = await supabase.functions.invoke("send-bulk-whatsapp", {
          body: { recipients, message },
        });

        if (error) {
          console.error("Resend error:", error);
          totalFailed += recipients.length;
        } else if (data) {
          totalSuccess += data.successCount || 0;
          totalFailed += data.failedCount || 0;
        }
      }

      if (totalSuccess > 0) {
        toast.success(`${totalSuccess} mensagens reenviadas com sucesso!`);
      }
      if (totalFailed > 0) {
        toast.error(`${totalFailed} mensagens falharam novamente`);
      }

      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error("Error resending messages:", error);
      toast.error("Erro ao reenviar mensagens");
    } finally {
      setIsResending(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "notification":
        return <Bell className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case "email":
        return "Email";
      case "whatsapp":
        return "WhatsApp";
      case "notification":
        return "Notificação";
      default:
        return channel;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "sent") {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Enviado
        </Badge>
      );
    }
    if (status === "failed") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Falhou
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Histórico de Envios</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos canais</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="notification">Notificação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="student">Alunos</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sent">Enviados</SelectItem>
                  <SelectItem value="failed">Falhos</SelectItem>
                </SelectContent>
              </Select>

              {failedWhatsappMessages.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setResendDialogOpen(true)}
                  disabled={isResending}
                  className="gap-2"
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Reenviar {failedWhatsappMessages.length} Falhas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum envio encontrado
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Assunto/Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">
                        {item.sent_at
                          ? format(new Date(item.sent_at), "dd/MM/yy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {item.recipient_name || "Sem nome"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.recipient_email || item.recipient_phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getChannelIcon(item.channel)}
                          {getChannelLabel(item.channel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-sm">
                          {item.subject || item.message.slice(0, 50)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedMessage(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage && getChannelIcon(selectedMessage.channel)}
              Detalhes da Mensagem
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Destinatário:</span>
                  <p className="font-medium">{selectedMessage.recipient_name}</p>
                  <p className="text-muted-foreground">
                    {selectedMessage.recipient_email || selectedMessage.recipient_phone}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Enviado em:</span>
                  <p className="font-medium">
                    {selectedMessage.sent_at
                      ? format(new Date(selectedMessage.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <span className="text-sm text-muted-foreground">Assunto:</span>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-muted-foreground">Mensagem:</span>
                <div className="mt-2 p-3 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(selectedMessage.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resend Confirmation Dialog */}
      <AlertDialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reenviar Mensagens Falhas</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você vai reenviar <strong>{failedWhatsappMessages.length}</strong> mensagens 
                WhatsApp que falharam anteriormente.
              </p>
              <p className="text-amber-600 dark:text-amber-400">
                ⚠️ Certifique-se que o WhatsApp está conectado antes de continuar.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResendFailed}>
              Reenviar Mensagens
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}