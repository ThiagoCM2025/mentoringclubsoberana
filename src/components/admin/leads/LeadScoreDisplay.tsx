import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Mail, MessageCircle, MousePointerClick, Eye, Loader2, Plus } from "lucide-react";

interface EngagementEvent {
  id: string;
  lead_id: string;
  event_type: string;
  points: number;
  created_at: string;
}

interface LeadScoreDisplayProps {
  leadId: string;
  score: number | null;
}

const eventTypeConfig: Record<string, { label: string; icon: React.ElementType; points: number; color: string }> = {
  email_opened: { label: "Abriu email", icon: Eye, points: 5, color: "bg-blue-100 text-blue-700" },
  email_clicked: { label: "Clicou no link", icon: MousePointerClick, points: 10, color: "bg-green-100 text-green-700" },
  whatsapp_replied: { label: "Respondeu WhatsApp", icon: MessageCircle, points: 15, color: "bg-emerald-100 text-emerald-700" },
  page_visited: { label: "Visitou página", icon: Eye, points: 3, color: "bg-purple-100 text-purple-700" },
  form_submitted: { label: "Enviou formulário", icon: Mail, points: 20, color: "bg-orange-100 text-orange-700" },
};

export function LeadScoreDisplay({ leadId, score }: LeadScoreDisplayProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [leadId]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("lead_engagement_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setEvents(data);
    if (error) console.error("Error fetching events:", error);
    setLoading(false);
  };

  const addManualEvent = async (eventType: string, points: number) => {
    try {
      const { error } = await supabase
        .from("lead_engagement_events")
        .insert({
          lead_id: leadId,
          event_type: eventType,
          points,
        });

      if (error) throw error;
      toast({ title: "Evento registrado!" });
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({ title: "Erro ao registrar evento", variant: "destructive" });
    }
  };

  const getScoreColor = (s: number) => {
    if (s >= 50) return "text-green-600";
    if (s >= 25) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Score de Engajamento</p>
            <p className={`text-2xl font-bold ${getScoreColor(score || 0)}`}>
              {score || 0} pts
            </p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`${
            (score || 0) >= 50 ? "border-green-500 text-green-700 bg-green-50" :
            (score || 0) >= 25 ? "border-yellow-500 text-yellow-700 bg-yellow-50" :
            "border-border text-muted-foreground"
          }`}
        >
          {(score || 0) >= 50 ? "Alta Intenção" :
           (score || 0) >= 25 ? "Média Intenção" :
           "Baixa Intenção"}
        </Badge>
      </div>

      {/* Quick Add Events */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Registrar Engajamento</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(eventTypeConfig).map(([type, config]) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => addManualEvent(type, config.points)}
              className="text-xs bg-card border-border hover:bg-muted"
            >
              <config.icon className="w-3 h-3 mr-1" />
              {config.label} (+{config.points})
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Histórico de Engajamento</p>
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-secondary" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum evento registrado
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {events.map((event) => {
              const config = eventTypeConfig[event.event_type] || {
                label: event.event_type,
                icon: Eye,
                color: "bg-muted text-muted-foreground",
              };
              const EventIcon = config.icon;

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded ${config.color}`}>
                      <EventIcon className="w-3 h-3" />
                    </span>
                    <span className="text-foreground">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      +{event.points} pts
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
