import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Mail, 
  MessageCircle, 
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  User
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommunicationRecord {
  id: string;
  channel: string;
  subject: string | null;
  message: string;
  status: string | null;
  sent_at: string;
  recipient_name: string | null;
  recipient_email: string | null;
}

export const LeadHistoryTab = () => {
  const [history, setHistory] = useState<CommunicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("communication_history")
      .select("id, channel, subject, message, status, sent_at, recipient_name, recipient_email")
      .eq("recipient_type", "lead")
      .order("sent_at", { ascending: false })
      .limit(100);

    if (data) setHistory(data);
    if (error) console.error("Error fetching history:", error);
    setLoading(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="w-4 h-4" />;
      case "whatsapp": return <MessageCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "sent":
        return <Badge variant="outline" className="text-xs text-green-600 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Enviado</Badge>;
      case "failed":
        return <Badge variant="outline" className="text-xs text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status || "—"}</Badge>;
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.recipient_email?.toLowerCase().includes(search.toLowerCase()) ||
      item.subject?.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = filterChannel === "all" || item.channel === filterChannel;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const stats = {
    total: history.length,
    sent: history.filter(h => h.status === "sent").length,
    failed: history.filter(h => h.status === "failed").length,
    email: history.filter(h => h.channel === "email").length,
    whatsapp: history.filter(h => h.channel === "whatsapp").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10">
                <History className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
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
                <p className="text-xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-100">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Falhas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.email}</p>
                <p className="text-xs text-muted-foreground">Emails</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.whatsapp}</p>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos canais</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* History List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico de Comunicações com Leads
          </CardTitle>
          <CardDescription className="text-xs">
            Últimas 100 comunicações enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhuma comunicação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${item.channel === "email" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                    {getChannelIcon(item.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{item.recipient_name || item.recipient_email || "—"}</span>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    {item.subject && (
                      <p className="text-sm font-medium truncate">{item.subject}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(item.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
