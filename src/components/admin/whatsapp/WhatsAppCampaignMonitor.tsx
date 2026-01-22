import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Rocket, 
  RefreshCw, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Campaign {
  id: string;
  templateName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  scheduledFor: string;
  processedAt: string | null;
}

export function WhatsAppCampaignMonitor() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select(`
          id,
          status,
          recipient_count,
          sent_count,
          failed_count,
          scheduled_for,
          processed_at,
          template_id,
          message_templates (name)
        `)
        .eq('channel', 'whatsapp')
        .in('status', ['pending', 'processing', 'completed', 'failed'])
        .order('scheduled_for', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mapped: Campaign[] = (data || []).map((item: any) => ({
        id: item.id,
        templateName: item.message_templates?.name || 'Campanha sem nome',
        status: item.status,
        recipientCount: item.recipient_count || 0,
        sentCount: item.sent_count || 0,
        failedCount: item.failed_count || 0,
        scheduledFor: item.scheduled_for,
        processedAt: item.processed_at
      }));

      setCampaigns(mapped);
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();

    // Realtime subscription for campaign updates
    const channel = supabase
      .channel('campaign-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_messages'
        },
        () => {
          fetchCampaigns();
        }
      )
      .subscribe();

    // Poll every 10 seconds for processing campaigns
    const interval = setInterval(() => {
      const hasProcessing = campaigns.some(c => c.status === 'processing');
      if (hasProcessing) {
        fetchCampaigns();
      }
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  const processingCampaigns = campaigns.filter(c => c.status === 'processing');
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending' && !isPast(new Date(c.scheduledFor)));
  const completedCampaigns = campaigns.filter(c => c.status === 'completed' || c.status === 'failed').slice(0, 3);

  const getProgressPercentage = (campaign: Campaign) => {
    if (campaign.recipientCount === 0) return 0;
    return Math.round((campaign.sentCount / campaign.recipientCount) * 100);
  };

  const getSuccessRate = (campaign: Campaign) => {
    const total = campaign.sentCount + campaign.failedCount;
    if (total === 0) return 0;
    return Math.round((campaign.sentCount / total) * 100);
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return "text-emerald-500";
    if (rate >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const getSuccessBadge = (rate: number) => {
    if (rate >= 90) return { text: "Excelente", variant: "default" as const, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    if (rate >= 70) return { text: "Atenção", variant: "secondary" as const, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { text: "Problema", variant: "destructive" as const, className: "bg-red-500/10 text-red-500 border-red-500/20" };
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasCampaigns = processingCampaigns.length > 0 || pendingCampaigns.length > 0 || completedCampaigns.length > 0;

  if (!hasCampaigns) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            Campanhas em Andamento
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma campanha WhatsApp ativa ou recente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          Campanhas em Andamento
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Processing Campaigns */}
        {processingCampaigns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              PROCESSANDO AGORA
            </div>
            {processingCampaigns.map((campaign) => {
              const progress = getProgressPercentage(campaign);
              return (
                <div 
                  key={campaign.id} 
                  className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{campaign.templateName}</span>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">
                      {progress}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {campaign.sentCount} de {campaign.recipientCount} enviados
                      {campaign.failedCount > 0 && (
                        <span className="text-red-500 ml-2">• {campaign.failedCount} falhas</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{Math.ceil((campaign.recipientCount - campaign.sentCount) * 0.5 / 60)} min restantes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pending Campaigns */}
        {pendingCampaigns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-500">
              <Calendar className="w-3 h-3" />
              AGENDADOS ({pendingCampaigns.length})
            </div>
            {pendingCampaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
              >
                <span className="text-muted-foreground">
                  📨 {campaign.templateName}
                </span>
                <span className="text-xs text-blue-500">
                  {format(new Date(campaign.scheduledFor), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  <span className="ml-1 text-muted-foreground">
                    ({formatDistanceToNow(new Date(campaign.scheduledFor), { locale: ptBR, addSuffix: true })})
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Completed Campaigns */}
        {completedCampaigns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              ÚLTIMOS DISPAROS
            </div>
            {completedCampaigns.map((campaign) => {
              const successRate = getSuccessRate(campaign);
              const badge = getSuccessBadge(successRate);
              const isCompleted = campaign.status === 'completed';
              
              return (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      successRate >= 70 ? (
                        <CheckCircle className={`w-4 h-4 ${getSuccessColor(successRate)}`} />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-muted-foreground">{campaign.templateName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {campaign.sentCount}/{campaign.recipientCount}
                    </span>
                    <Badge variant={badge.variant} className={badge.className}>
                      {successRate}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
