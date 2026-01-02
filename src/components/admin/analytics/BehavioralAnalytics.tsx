import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  MousePointer2, 
  Eye, 
  ArrowDownToLine, 
  FileSpreadsheet,
  Users,
  TrendingUp,
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartSkeleton,
  StatsCardSkeleton,
  PieChartSkeleton,
  TableSkeleton,
} from "@/components/admin/skeletons/AdminSkeletons";

interface BehavioralAnalyticsProps {
  startDate: Date;
}

const SCROLL_COLORS = {
  '25': '#f59e0b',
  '50': '#3b82f6',
  '75': '#8b5cf6',
  '100': '#10b981'
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  page_view: '#3b82f6',
  cta_click: '#10b981',
  form_start: '#f59e0b',
  form_complete: '#8b5cf6',
  scroll_depth: '#ec4899'
};

export const BehavioralAnalytics = ({ startDate }: BehavioralAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    uniqueSessions: 0,
    totalCtaClicks: 0,
    deepScrollRate: 0,
    avgEventsPerSession: 0
  });
  const [eventsByDay, setEventsByDay] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [topCtas, setTopCtas] = useState<any[]>([]);
  const [scrollDistribution, setScrollDistribution] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchBehavioralData();
  }, [startDate]);

  const fetchBehavioralData = async () => {
    setLoading(true);
    
    try {
      const { data: events } = await supabase
        .from("lead_events")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (!events || events.length === 0) {
        setLoading(false);
        return;
      }

      // Process summary
      const uniqueSessions = new Set(events.map(e => e.session_id)).size;
      const ctaClicks = events.filter(e => e.event_type === 'cta_click').length;
      
      // Deep scroll = scroll 75% or 100%
      const scrollEvents = events.filter(e => e.event_type === 'scroll_depth');
      const deepScrolls = scrollEvents.filter(e => {
        const eventData = e.event_data as Record<string, unknown> | null;
        const depth = eventData?.depth as number | undefined;
        return depth && depth >= 75;
      }).length;
      const sessionsWithScroll = new Set(scrollEvents.map(e => e.session_id)).size;
      const deepScrollRate = sessionsWithScroll > 0 
        ? Math.round((deepScrolls / sessionsWithScroll) * 100) 
        : 0;
      
      const avgEvents = Math.round(events.length / uniqueSessions);

      setSummary({
        uniqueSessions,
        totalCtaClicks: ctaClicks,
        deepScrollRate,
        avgEventsPerSession: avgEvents
      });

      // Events by day
      const eventsByDate: Record<string, Record<string, number>> = {};
      events.forEach(e => {
        const date = format(new Date(e.created_at), 'dd/MM', { locale: ptBR });
        if (!eventsByDate[date]) {
          eventsByDate[date] = { page_view: 0, cta_click: 0, form_start: 0, form_complete: 0 };
        }
        if (eventsByDate[date][e.event_type] !== undefined) {
          eventsByDate[date][e.event_type]++;
        }
      });
      
      const chartData = Object.entries(eventsByDate)
        .map(([date, counts]) => ({
          date,
          'Visualizações': counts.page_view,
          'Cliques CTA': counts.cta_click,
          'Início Form': counts.form_start,
          'Conclusão Form': counts.form_complete
        }))
        .reverse();
      setEventsByDay(chartData);

      // Top pages
      const pageCounts: Record<string, number> = {};
      events
        .filter(e => e.event_type === 'page_view')
        .forEach(e => {
          const eventData = e.event_data as Record<string, unknown> | null;
          const path = (eventData?.path as string) || new URL(e.page_url || '/', 'http://localhost').pathname;
          pageCounts[path] = (pageCounts[path] || 0) + 1;
        });
      
      const topPagesData = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([page, count]) => ({
          page: page.length > 30 ? page.substring(0, 30) + '...' : page,
          visitas: count
        }));
      setTopPages(topPagesData);

      // Top CTAs
      const ctaCounts: Record<string, number> = {};
      events
        .filter(e => e.event_type === 'cta_click')
        .forEach(e => {
          const eventData = e.event_data as Record<string, unknown> | null;
          const ctaName = e.event_name || (eventData?.cta_name as string) || 'unknown';
          ctaCounts[ctaName] = (ctaCounts[ctaName] || 0) + 1;
        });
      
      const topCtasData = Object.entries(ctaCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([cta, count]) => ({
          cta: cta.length > 25 ? cta.substring(0, 25) + '...' : cta,
          cliques: count
        }));
      setTopCtas(topCtasData);

      // Scroll distribution
      const scrollCounts: Record<string, number> = { '25': 0, '50': 0, '75': 0, '100': 0 };
      scrollEvents.forEach(e => {
        const eventData = e.event_data as Record<string, unknown> | null;
        const depth = (eventData?.depth as number)?.toString();
        if (depth && scrollCounts[depth] !== undefined) {
          scrollCounts[depth]++;
        }
      });
      
      const scrollData = Object.entries(scrollCounts).map(([depth, count]) => ({
        name: `${depth}%`,
        value: count,
        color: SCROLL_COLORS[depth as keyof typeof SCROLL_COLORS]
      }));
      setScrollDistribution(scrollData);

      // Behavioral funnel
      const totalVisitors = uniqueSessions;
      const scrolled50Plus = new Set(
        scrollEvents
          .filter(e => {
            const eventData = e.event_data as Record<string, unknown> | null;
            return ((eventData?.depth as number) || 0) >= 50;
          })
          .map(e => e.session_id)
      ).size;
      const clickedCta = new Set(
        events.filter(e => e.event_type === 'cta_click').map(e => e.session_id)
      ).size;
      const startedForm = new Set(
        events.filter(e => e.event_type === 'form_start').map(e => e.session_id)
      ).size;
      const completedForm = new Set(
        events.filter(e => e.event_type === 'form_complete').map(e => e.session_id)
      ).size;

      setFunnelData([
        { stage: 'Visitantes', value: totalVisitors, rate: 100 },
        { stage: 'Scroll 50%+', value: scrolled50Plus, rate: Math.round((scrolled50Plus / totalVisitors) * 100) || 0 },
        { stage: 'Clicou CTA', value: clickedCta, rate: Math.round((clickedCta / totalVisitors) * 100) || 0 },
        { stage: 'Iniciou Form', value: startedForm, rate: Math.round((startedForm / totalVisitors) * 100) || 0 },
        { stage: 'Completou', value: completedForm, rate: Math.round((completedForm / totalVisitors) * 100) || 0 }
      ]);

      // Recent sessions
      const sessionMap: Record<string, { 
        events: number; 
        pages: Set<string>; 
        maxScroll: number; 
        ctaClicks: number;
        hasLead: boolean;
        lastActivity: Date;
      }> = {};
      
      events.forEach(e => {
        const sid = e.session_id;
        if (!sessionMap[sid]) {
          sessionMap[sid] = {
            events: 0,
            pages: new Set(),
            maxScroll: 0,
            ctaClicks: 0,
            hasLead: false,
            lastActivity: new Date(e.created_at)
          };
        }
        sessionMap[sid].events++;
        if (e.page_url) {
          sessionMap[sid].pages.add(new URL(e.page_url, 'http://localhost').pathname);
        }
        if (e.event_type === 'scroll_depth') {
          const eventData = e.event_data as Record<string, unknown> | null;
          const depth = (eventData?.depth as number) || 0;
          sessionMap[sid].maxScroll = Math.max(sessionMap[sid].maxScroll, depth);
        }
        if (e.event_type === 'cta_click') {
          sessionMap[sid].ctaClicks++;
        }
        if (e.lead_id) {
          sessionMap[sid].hasLead = true;
        }
        const eventDate = new Date(e.created_at);
        if (eventDate > sessionMap[sid].lastActivity) {
          sessionMap[sid].lastActivity = eventDate;
        }
      });

      const recentSessionsData = Object.entries(sessionMap)
        .sort((a, b) => b[1].lastActivity.getTime() - a[1].lastActivity.getTime())
        .slice(0, 10)
        .map(([sessionId, data]) => ({
          sessionId: sessionId.substring(0, 12) + '...',
          pages: data.pages.size,
          events: data.events,
          maxScroll: data.maxScroll,
          ctaClicks: data.ctaClicks,
          hasLead: data.hasLead,
          lastActivity: formatDistanceToNow(data.lastActivity, { addSuffix: true, locale: ptBR })
        }));
      setRecentSessions(recentSessionsData);

    } catch (error) {
      console.error("Error fetching behavioral data:", error);
    }
    
    setLoading(false);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        return typeof val === 'object' ? JSON.stringify(val) : val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const SummaryCard = ({ icon: Icon, label, value, color, suffix = '' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden admin-stat-card border-0">
        <div className={`absolute inset-0 ${color} opacity-10`} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{value}{suffix}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-secondary" />
            Analytics Comportamental
          </h2>
          <p className="text-sm text-muted-foreground">
            Comportamento de todos os visitantes, independente de serem leads
          </p>
        </div>
        <Button
          onClick={() => exportToCSV(recentSessions, 'sessoes_comportamentais')}
          variant="outline"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          <StatsCardSkeleton count={4} />
        ) : (
          <>
            <SummaryCard 
              icon={Users} 
              label="Sessões Únicas" 
              value={summary.uniqueSessions}
              color="bg-blue-600"
            />
            <SummaryCard 
              icon={MousePointer2} 
              label="Cliques em CTAs" 
              value={summary.totalCtaClicks}
              color="bg-emerald-600"
            />
            <SummaryCard 
              icon={ArrowDownToLine} 
              label="Scroll Profundo" 
              value={summary.deepScrollRate}
              suffix="%"
              color="bg-purple-600"
            />
            <SummaryCard 
              icon={Eye} 
              label="Eventos/Sessão" 
              value={summary.avgEventsPerSession}
              color="bg-amber-600"
            />
          </>
        )}
      </div>

      {/* Behavioral Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Funil Comportamental
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Jornada do visitante até conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={100} variant="bar" />
            ) : funnelData.length > 0 ? (
              <div className="flex items-center justify-between gap-2 py-4">
                {funnelData.map((stage, idx) => (
                  <div key={stage.stage} className="flex items-center flex-1">
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold text-foreground">{stage.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stage.stage}</div>
                      <Badge 
                        variant="secondary" 
                        className={`mt-2 ${stage.rate >= 50 ? 'bg-emerald-500/20 text-emerald-400' : stage.rate >= 25 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}
                      >
                        {stage.rate}%
                      </Badge>
                    </div>
                    {idx < funnelData.length - 1 && (
                      <div className="text-muted-foreground px-2">→</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                Sem dados comportamentais
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Events Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Eye className="w-5 h-5 text-blue-500" />
              Eventos por Dia
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Timeline de interações dos visitantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {loading ? (
                <ChartSkeleton height={288} variant="area" />
              ) : eventsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eventsByDay}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Visualizações" stroke="#3b82f6" strokeWidth={2} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="Cliques CTA" stroke="#10b981" strokeWidth={2} fill="url(#colorClicks)" />
                    <Area type="monotone" dataKey="Início Form" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.1} fill="#f59e0b" />
                    <Area type="monotone" dataKey="Conclusão Form" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.1} fill="#8b5cf6" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="admin-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-blue-500" />
                Páginas Mais Visitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <ChartSkeleton height={256} variant="bar" />
                ) : topPages.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis 
                        dataKey="page" 
                        type="category" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        width={90}
                      />
                      <Tooltip />
                      <Bar dataKey="visitas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Sem dados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="admin-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <MousePointer2 className="w-5 h-5 text-emerald-500" />
                CTAs Mais Clicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <ChartSkeleton height={256} variant="bar" />
                ) : topCtas.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCtas} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis 
                        dataKey="cta" 
                        type="category" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        width={90}
                      />
                      <Tooltip />
                      <Bar dataKey="cliques" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Sem dados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scroll Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="admin-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <ArrowDownToLine className="w-5 h-5 text-purple-500" />
                Distribuição de Scroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <PieChartSkeleton size={180} />
                ) : scrollDistribution.some(s => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scrollDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scrollDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Sem dados de scroll
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Sessions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-teal-500" />
              Sessões Recentes
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimas sessões de visitantes e seu comportamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : recentSessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sessão</TableHead>
                    <TableHead className="text-center">Páginas</TableHead>
                    <TableHead className="text-center">Eventos</TableHead>
                    <TableHead className="text-center">Scroll Max</TableHead>
                    <TableHead className="text-center">CTAs</TableHead>
                    <TableHead className="text-center">Lead?</TableHead>
                    <TableHead>Última Atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSessions.map((session, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs">{session.sessionId}</TableCell>
                      <TableCell className="text-center">{session.pages}</TableCell>
                      <TableCell className="text-center">{session.events}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary"
                          className={session.maxScroll >= 75 ? 'bg-emerald-500/20 text-emerald-400' : session.maxScroll >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-muted'}
                        >
                          {session.maxScroll}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{session.ctaClicks}</TableCell>
                      <TableCell className="text-center">
                        {session.hasLead ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400">Sim</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{session.lastActivity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Sem sessões registradas
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
