import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, AlertTriangle, Clock, XCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function WhatsAppRecentActivity() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recent conversations
        const { data: recentConvs } = await supabase
          .from("whatsapp_conversations")
          .select("id, contact_name, phone, last_message_preview, last_message_at, unread_count, contact_type")
          .eq("status", "active")
          .order("last_message_at", { ascending: false })
          .limit(5);

        setConversations(recentConvs || []);

        // Alerts
        const alertsList: Alert[] = [];

        // Failed messages
        const { count: failedCount } = await supabase
          .from("communication_history")
          .select("*", { count: "exact", head: true })
          .eq("channel", "whatsapp")
          .eq("status", "failed");

        if (failedCount && failedCount > 0) {
          alertsList.push({
            type: "failed",
            message: "Mensagens com falha",
            count: failedCount,
          });
        }

        // Unreplied conversations (no outgoing message in last 24h but has incoming)
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const { data: unrepliedConvs } = await supabase
          .from("whatsapp_conversations")
          .select("id")
          .eq("status", "active")
          .gt("unread_count", 0)
          .lt("last_message_at", yesterday.toISOString());

        if (unrepliedConvs && unrepliedConvs.length > 0) {
          alertsList.push({
            type: "unreplied",
            message: "Sem resposta há +24h",
            count: unrepliedConvs.length,
          });
        }

        setAlerts(alertsList);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };

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

  return (
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
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertas e Problemas
          </CardTitle>
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
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-muted-foreground">Nenhum problema detectado</p>
              <p className="text-sm text-muted-foreground/70">Tudo está funcionando bem!</p>
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
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ver <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
