import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Inbox, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getBrazilToday } from "@/lib/dateUtils";

interface Stats {
  activeConversations: number;
  messagesToday: number;
  unreadCount: number;
  responseRate: number;
}

export function WhatsAppDashboardStats() {
  const [stats, setStats] = useState<Stats>({
    activeConversations: 0,
    messagesToday: 0,
    unreadCount: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Usar horário de Brasília para filtrar "hoje"
        const today = getBrazilToday();

        // Active conversations
        const { count: activeCount } = await supabase
          .from("whatsapp_conversations")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Messages today
        const { count: todayCount } = await supabase
          .from("whatsapp_messages")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());

        // Unread count
        const { data: unreadData } = await supabase
          .from("whatsapp_conversations")
          .select("unread_count")
          .eq("status", "active");

        const unreadTotal = unreadData?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0;

        // Response rate calculation (sent vs received ratio)
        const { count: sentCount } = await supabase
          .from("whatsapp_messages")
          .select("*", { count: "exact", head: true })
          .eq("direction", "outgoing");

        const { count: receivedCount } = await supabase
          .from("whatsapp_messages")
          .select("*", { count: "exact", head: true })
          .eq("direction", "incoming");

        const total = (sentCount || 0) + (receivedCount || 0);
        const rate = total > 0 ? Math.round(((sentCount || 0) / total) * 100) : 0;

        setStats({
          activeConversations: activeCount || 0,
          messagesToday: todayCount || 0,
          unreadCount: unreadTotal,
          responseRate: rate,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("whatsapp-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_conversations" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_messages" }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    {
      label: "Conversas Ativas",
      value: stats.activeConversations,
      icon: MessageCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Mensagens Hoje",
      value: stats.messagesToday,
      icon: Send,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Não Lidas",
      value: stats.unreadCount,
      icon: Inbox,
      color: stats.unreadCount > 0 ? "text-amber-500" : "text-muted-foreground",
      bgColor: stats.unreadCount > 0 ? "bg-amber-500/10" : "bg-muted/50",
    },
    {
      label: "Taxa de Resposta",
      value: `${stats.responseRate}%`,
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
