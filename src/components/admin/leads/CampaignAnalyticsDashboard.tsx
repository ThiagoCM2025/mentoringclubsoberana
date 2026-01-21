import { useState, useEffect, useMemo } from "react";
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
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
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
  ArrowUpRight
} from "lucide-react";

interface CampaignStats {
  totalSent: number;
  deliveryRate: number;
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
  count: number;
}

interface CampaignOption {
  sourceFilter: string | null;
  label: string;
}

export function CampaignAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CampaignStats>({
    totalSent: 0,
    deliveryRate: 0,
    activeLeads: 0,
    conversions: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [funnelByList, setFunnelByList] = useState<FunnelByList[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

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
        // Calculate stats
        const sent = comms.length;
        const delivered = comms.filter((c) => c.status === "sent").length;
        const active = leads.filter((l) => l.nurturing_active).length;
        const converted = leads.filter((l) => l.status === "converted").length;

        setStats({
          totalSent: sent,
          deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
          activeLeads: active,
          conversions: converted,
        });

        // Calculate daily stats
        const dailyMap = new Map<string, number>();
        comms.forEach((c) => {
          if (c.sent_at) {
            const dateKey = format(new Date(c.sent_at), "dd/MM");
            dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
          }
        });

        const daily: DailyStats[] = [];
        for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateKey = format(date, "dd/MM");
          daily.push({
            date: dateKey,
            count: dailyMap.get(dateKey) || 0,
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
    <div className="space-y-4">
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
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Emails Enviados</p>
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
                <p className="text-xs text-muted-foreground">Taxa de Entrega</p>
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
                <p className="text-xs text-muted-foreground">Leads Ativos</p>
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

      {/* Daily Sends Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Envios por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
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
                  formatter={(value: number) => [`${value} emails`, 'Enviados']}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
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
