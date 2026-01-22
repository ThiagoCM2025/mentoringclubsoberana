import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, AlertTriangle, Clock, XCircle, ExternalLink, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { WhatsAppInboxModal } from "./WhatsAppInboxModal";

interface Conversation {
  id: string;
  contact_name: string | null;
  phone: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  contact_type: string | null;
}

interface Alert {
  type: "failed" | "unreplied" | "low_delivery";
  message: string;
  count: number;
}

interface SuccessStats {
  sentCount: number;
  activeConversations: number;
}

export function WhatsAppRecentActivity() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [successStats, setSuccessStats] = useState<SuccessStats>({ sentCount: 0, activeConversations: 0 });
  const [loading, setLoading] = useState(true);
  const [showInbox, setShowInbox] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Time filters
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
      
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Recent conversations
      const { data: recentConvs } = await supabase
        .from("whatsapp_conversations")
        .select("id, contact_name, phone, last_message_preview, last_message_at, unread_count, contact_type")
        .eq("status", "active")
        .order("last_message_at", { ascending: false })
        .limit(5);

      setConversations(recentConvs || []);

      // Alerts - only recent failures (last 48h)
      const alertsList: Alert[] = [];

      const { count: failedCount } = await supabase
        .from("communication_history")
        .select("*", { count: "exact", head: true })
        .eq("channel", "whatsapp")
        .eq("status", "failed")
        .gte("sent_at", fortyEightHoursAgo.toISOString());

      if (failedCount && failedCount > 0) {
        alertsList.push({
          type: "failed",
          message: "Mensagens com falha (últimas 48h)",
          count: failedCount,
        });
      }

      // Unreplied conversations (no response in last 24h but has unread)
      const { data: unrepliedConvs } = await supabase
        .from("whatsapp_conversations")
        .select("id")
        .eq("status", "active")
        .gt("unread_count", 0)
        .lt("last_message_at", twentyFourHoursAgo.toISOString());

      if (unrepliedConvs && unrepliedConvs.length > 0) {
        alertsList.push({
          type: "unreplied",
          message: "Sem resposta há +24h",
          count: unrepliedConvs.length,
        });
      }

      setAlerts(alertsList);

      // Success stats for when no alerts (last 24h)
      const { count: sentCount } = await supabase
        .from("communication_history")
        .select("*", { count: "exact", head: true })
        .eq("channel", "whatsapp")
        .eq("status", "sent")
        .gte("sent_at", twentyFourHoursAgo.toISOString());

      const { count: activeConvCount } = await supabase
        .from("whatsapp_conversations")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      setSuccessStats({
        sentCount: sentCount || 0,
        activeConversations: activeConvCount || 0,
      });

    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getInitials = (name: string | null, phoneNum: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    }
    return phoneNum.slice(-2);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "failed": return XCircle;
      case "unreplied": return Clock;
      case "low_delivery": return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "failed": return "text-destructive bg-destructive/10";
      case "unreplied": return "text-amber-500 bg-amber-500/10";
      case "low_delivery": return "text-orange-500 bg-orange-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const handleAlertAction = (alertType: string) => {
    switch (alertType) {
      case "failed":
        // Navigate to messaging history with filters
        navigate("/admin/messaging?tab=history");
        break;
      case "unreplied":
        // Open inbox to show pending conversations
        setShowInbox(true);
        break;
      case "low_delivery":
        navigate("/admin/messaging?tab=history");
        break;
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Conversations */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              Últimas Conversas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-40 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                Nenhuma conversa recente
              </p>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="w-10 h-10 bg-secondary/20 border border-secondary/30">
                      <AvatarFallback className="text-sm font-medium text-secondary">
                        {getInitials(conv.contact_name, conv.phone)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {conv.contact_name || conv.phone}
                        </span>
                        {conv.contact_type && (
                          <Badge variant="outline" className="text-xs">
                            {conv.contact_type === "lead" ? "Lead" : "Aluna"}
                          </Badge>
                        )}
                        {conv.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message_preview || "Sem mensagens"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {conv.last_message_at
                        ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: ptBR })
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas e Problemas
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-foreground font-medium">Nenhum problema detectado</p>
                <p className="text-sm text-muted-foreground mb-4">Tudo está funcionando bem!</p>
                
                {/* Success Stats Summary */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    📊 Resumo (últimas 24h)
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 justify-center p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-foreground">{successStats.sentCount} enviadas</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center p-2 rounded-lg bg-secondary/10">
                      <MessageCircle className="w-4 h-4 text-secondary" />
                      <span className="text-foreground">{successStats.activeConversations} conversas</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, idx) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-secondary/30 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.count} ocorrência(s)</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleAlertAction(alert.type)}
                      >
                        Ver <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
                
                {/* Summary even with alerts */}
                <div className="mt-2 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>📊 Últimas 24h: {successStats.sentCount} enviadas com sucesso</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inbox Modal for unreplied conversations */}
      <WhatsAppInboxModal 
        open={showInbox} 
        onOpenChange={setShowInbox} 
      />
    </>
  );
}
