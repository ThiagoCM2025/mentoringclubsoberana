import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  MousePointerClick, 
  ScrollText, 
  FileText, 
  Eye,
  TrendingUp,
  Clock,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadEvent {
  id: string;
  event_type: string;
  event_name: string;
  event_data: Record<string, unknown>;
  page_url: string;
  page_title: string;
  created_at: string;
}

interface LeadBehaviorTabProps {
  leadId: string;
  behaviorScore?: number;
}

const eventTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  cta_click: { icon: MousePointerClick, label: "Clique CTA", color: "bg-blue-500" },
  scroll_depth: { icon: ScrollText, label: "Scroll", color: "bg-green-500" },
  form_start: { icon: FileText, label: "Início Form", color: "bg-yellow-500" },
  form_complete: { icon: FileText, label: "Form Completo", color: "bg-emerald-500" },
  page_view: { icon: Eye, label: "Visualização", color: "bg-purple-500" },
};

export const LeadBehaviorTab = ({ leadId, behaviorScore = 0 }: LeadBehaviorTabProps) => {
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ctaClicks: 0,
    pagesViewed: 0,
    maxScroll: 0,
    formsStarted: 0,
    formsCompleted: 0,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lead_events")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setEvents(data as LeadEvent[]);
        
        // Calcular estatísticas
        const ctaClicks = data.filter(e => e.event_type === "cta_click").length;
        const pagesViewed = new Set(data.filter(e => e.event_type === "page_view").map(e => e.page_url)).size;
        const scrollEvents = data.filter(e => e.event_type === "scroll_depth");
        const maxScroll = scrollEvents.length > 0 
          ? Math.max(...scrollEvents.map(e => (e.event_data as { depth?: number }).depth || 0))
          : 0;
        const formsStarted = data.filter(e => e.event_type === "form_start").length;
        const formsCompleted = data.filter(e => e.event_type === "form_complete").length;

        setStats({
          totalEvents: data.length,
          ctaClicks,
          pagesViewed,
          maxScroll,
          formsStarted,
          formsCompleted,
        });
      }
      setLoading(false);
    };

    if (leadId) {
      fetchEvents();
    }
  }, [leadId]);

  const getEventIcon = (eventType: string) => {
    const config = eventTypeConfig[eventType] || eventTypeConfig.page_view;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getEventLabel = (event: LeadEvent) => {
    if (event.event_type === "scroll_depth") {
      const depth = (event.event_data as { depth?: number }).depth || 0;
      return `Scroll ${depth}%`;
    }
    if (event.event_type === "cta_click") {
      return (event.event_data as { cta_name?: string }).cta_name || event.event_name;
    }
    return eventTypeConfig[event.event_type]?.label || event.event_name;
  };

  const getIntentionLevel = (score: number) => {
    if (score >= 80) return { label: "Muito Alta", color: "bg-green-500 text-white" };
    if (score >= 50) return { label: "Alta", color: "bg-emerald-500 text-white" };
    if (score >= 25) return { label: "Média", color: "bg-yellow-500 text-white" };
    return { label: "Baixa", color: "bg-gray-500 text-white" };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const intention = getIntentionLevel(behaviorScore);

  return (
    <div className="space-y-6">
      {/* Score e Intenção */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Score Comportamental</span>
          </div>
          <p className="text-3xl font-bold text-primary">{behaviorScore}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Intenção de Compra</span>
          </div>
          <Badge className={intention.color}>{intention.label}</Badge>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.ctaClicks}</p>
          <p className="text-xs text-muted-foreground">CTAs Clicados</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.pagesViewed}</p>
          <p className="text-xs text-muted-foreground">Páginas Vistas</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.maxScroll}%</p>
          <p className="text-xs text-muted-foreground">Scroll Máximo</p>
        </div>
      </div>

      {/* Timeline de Eventos */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timeline de Eventos
        </h4>
        
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum evento registrado ainda
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {events.map((event) => {
                const config = eventTypeConfig[event.event_type] || eventTypeConfig.page_view;
                
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${config.color} text-white shrink-0`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{getEventLabel(event)}</p>
                      {event.page_url && (
                        <p className="text-xs text-muted-foreground truncate">
                          {new URL(event.page_url).pathname}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default LeadBehaviorTab;
