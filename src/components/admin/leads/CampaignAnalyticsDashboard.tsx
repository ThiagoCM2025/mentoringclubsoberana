import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  Mail, 
  CheckCircle2, 
  Users, 
  Target, 
  TrendingUp,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  ArrowUpRight,
  Eye,
  MousePointerClick,
  FileDown
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface CampaignStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  activeLeads: number;
  conversions: number;
}

interface FunnelByList {
  listName: string;
  batchId: string;
  totalLeads: number;
  steps: { step: number; count: number; percentage: number }[];
  converted: number;
}

interface DailyStats {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
}

interface CampaignOption {
  sourceFilter: string | null;
  label: string;
}

export function CampaignAnalyticsDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<CampaignStats>({
    totalSent: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    activeLeads: 0,
    conversions: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [funnelByList, setFunnelByList] = useState<FunnelByList[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, { 
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Header
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text("Relatório de Performance de Campanhas", 20, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, 20, 28);
      pdf.text(`Período: Últimos ${dateRange} dias`, 20, 34);
      
      const campaignLabel = campaigns.find(c => 
        (c.sourceFilter || "all") === selectedCampaign
      )?.label || "Todas";
      pdf.text(`Campanha: ${campaignLabel}`, 20, 40);
      
      // Add image
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxHeight = 230;
      const finalHeight = Math.min(imgHeight, maxHeight);
      
      pdf.addImage(imgData, "PNG", 20, 50, imgWidth, finalHeight);
      
      pdf.save(`relatorio-campanhas-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchAnalytics();
  }, [selectedCampaign, dateRange]);

  async function fetchCampaigns() {
    const { data } = await supabase
      .from("nurturing_sequences")
      .select("source_filter, name")
      .order("step_number");

    if (data) {
      const uniqueCampaigns = new Map<string, string>();
      data.forEach((seq) => {
        const key = seq.source_filter || "default";
        if (!uniqueCampaigns.has(key)) {
          uniqueCampaigns.set(key, seq.name.split(" - ")[0]);
        }
      });

      const campaignOptions: CampaignOption[] = [
        { sourceFilter: null, label: "Todas as Campanhas" },
      ];
      uniqueCampaigns.forEach((name, filter) => {
        campaignOptions.push({
          sourceFilter: filter === "default" ? null : filter,
          label: name,
        });
      });
      setCampaigns(campaignOptions);
    }
  }

  async function fetchAnalytics() {
    setLoading(true);
    const startDate = subDays(new Date(), parseInt(dateRange));

    try {
      // Fetch communication history for email stats
      const { data: comms } = await supabase
        .from("communication_history")
        .select("id, recipient_id, status, sent_at, channel")
        .eq("recipient_type", "lead")
        .eq("channel", "email")
        .gte("sent_at", startDate.toISOString());

      // Fetch email tracking data for opens/clicks
      let trackingQuery = supabase
        .from("email_tracking")
        .select("id, tracking_id, opened_at, clicked_at, sent_at, campaign_source")
        .gte("sent_at", startDate.toISOString());
      
      if (selectedCampaign !== "all" && selectedCampaign !== "default") {
        trackingQuery = trackingQuery.eq("campaign_source", selectedCampaign);
      }
      
      const { data: tracking } = await trackingQuery;

      // Fetch leads with nurturing info
      let leadsQuery = supabase
        .from("leads")
        .select("id, source, nurturing_step, status, import_batch_id, nurturing_active");
      
      if (selectedCampaign !== "all") {
        if (selectedCampaign === "default") {
          leadsQuery = leadsQuery.or("source.is.null,source.not.ilike.%jornada%,source.not.ilike.%import%");
        } else {
          leadsQuery = leadsQuery.eq("source", selectedCampaign);
        }
      }
      
      const { data: leads } = await leadsQuery;

      // Fetch import lists
      const { data: importLists } = await supabase
        .from("import_lists")
        .select("id, name, batch_id, lead_count")
        .order("created_at", { ascending: false });

      if (comms && leads) {
        // Calculate stats from communication history
        const sent = comms.length;
        const delivered = comms.filter((c) => c.status === "sent").length;
        const active = leads.filter((l) => l.nurturing_active).length;
        const converted = leads.filter((l) => l.status === "converted").length;

        // Calculate open/click rates from tracking data
        const trackingTotal = tracking?.length || 0;
        const opened = tracking?.filter((t) => t.opened_at).length || 0;
        const clicked = tracking?.filter((t) => t.clicked_at).length || 0;

        setStats({
          totalSent: sent,
          deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
          openRate: trackingTotal > 0 ? Math.round((opened / trackingTotal) * 100) : 0,
          clickRate: trackingTotal > 0 ? Math.round((clicked / trackingTotal) * 100) : 0,
          activeLeads: active,
          conversions: converted,
        });

        // Calculate daily stats with opens and clicks
        const dailyMap = new Map<string, { sent: number; opened: number; clicked: number }>();
        
        comms.forEach((c) => {
          if (c.sent_at) {
            const dateKey = format(new Date(c.sent_at), "dd/MM");
            const existing = dailyMap.get(dateKey) || { sent: 0, opened: 0, clicked: 0 };
            existing.sent += 1;
            dailyMap.set(dateKey, existing);
          }
        });

        tracking?.forEach((t) => {
          if (t.sent_at) {
            const dateKey = format(new Date(t.sent_at), "dd/MM");
            const existing = dailyMap.get(dateKey) || { sent: 0, opened: 0, clicked: 0 };
            if (t.opened_at) existing.opened += 1;
            if (t.clicked_at) existing.clicked += 1;
            dailyMap.set(dateKey, existing);
          }
        });

        const daily: DailyStats[] = [];
        for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateKey = format(date, "dd/MM");
          const data = dailyMap.get(dateKey) || { sent: 0, opened: 0, clicked: 0 };
          daily.push({
            date: dateKey,
            sent: data.sent,
            opened: data.opened,
            clicked: data.clicked,
          });
        }
        // Only show last 14 days for chart readability
        setDailyStats(daily.slice(-14));

        // Calculate funnel by import list
        if (importLists && leads) {
          const funnels: FunnelByList[] = importLists.map((list) => {
            const listLeads = leads.filter((l) => l.import_batch_id === list.batch_id);
            const total = listLeads.length;

            const steps = [1, 2, 3, 4, 5].map((step) => {
              const count = listLeads.filter((l) => (l.nurturing_step || 0) >= step).length;
              return {
                step,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
              };
            });

            return {
              listName: list.name,
              batchId: list.batch_id,
              totalLeads: total,
              steps,
              converted: listLeads.filter((l) => l.status === "converted").length,
            };
          }).filter((f) => f.totalLeads > 0);

          setFunnelByList(funnels.slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  const stepColors = ["#3b82f6", "#8b5cf6", "#f97316", "#ec4899", "#22c55e"];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={dashboardRef} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance de Campanhas
          </h3>
          <p className="text-sm text-muted-foreground">
            Métricas de envio, entrega e conversão
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Campanha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Campanhas</SelectItem>
              {campaigns.slice(1).map((campaign) => (
                <SelectItem 
                  key={campaign.sourceFilter || "default"} 
                  value={campaign.sourceFilter || "default"}
                >
                  {campaign.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            {!exporting && "PDF"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.deliveryRate}%</p>
                <p className="text-xs text-muted-foreground">Entrega</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.openRate}%</p>
                <p className="text-xs text-muted-foreground">Abertura</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                <MousePointerClick className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.clickRate}%</p>
                <p className="text-xs text-muted-foreground">Cliques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.activeLeads.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.conversions}</p>
                <p className="text-xs text-muted-foreground">Conversões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sends Chart with Opens/Clicks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Envios, Aberturas e Cliques por Dia</CardTitle>
          <CardDescription className="text-xs">
            Comparativo de performance nos últimos {Math.min(14, parseInt(dateRange))} dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyStats}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="sent" name="Enviados" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opened" name="Abertos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicked" name="Clicados" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
              Nenhum envio no período
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funnel by Import List */}
      {funnelByList.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Funil por Lista Importada
            </CardTitle>
            <CardDescription className="text-xs">
              Progresso dos leads por etapa de nurturing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelByList.map((funnel) => (
              <div key={funnel.batchId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {funnel.listName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {funnel.totalLeads} leads
                    </Badge>
                  </div>
                  {funnel.converted > 0 && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {funnel.converted} conversões
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {funnel.steps.map((step, idx) => (
                    <div key={step.step} className="flex items-center gap-2">
                      <span className="text-xs w-16 text-muted-foreground">
                        Etapa {step.step}
                      </span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.max(step.percentage, 5)}%`,
                            backgroundColor: stepColors[idx],
                          }}
                        >
                          <span className="text-[10px] font-medium text-white">
                            {step.percentage}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs w-8 text-right text-muted-foreground">
                        {step.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
