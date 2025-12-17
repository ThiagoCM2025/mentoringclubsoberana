import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Download, 
  TrendingUp, 
  Users, 
  Target, 
  BookOpen,
  MessageSquare,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
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
  Legend,
  AreaChart,
  Area
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type PeriodFilter = '7d' | '30d' | '6m' | '1y';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
];

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  negotiating: '#8b5cf6',
  converted: '#10b981',
  lost: '#ef4444'
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Novos',
  contacted: 'Contactados',
  negotiating: 'Negociando',
  converted: 'Convertidos',
  lost: 'Perdidos'
};

const getDateFromPeriod = (period: PeriodFilter): Date => {
  const date = new Date();
  switch (period) {
    case '7d': return subDays(date, 7);
    case '30d': return subDays(date, 30);
    case '6m': return subMonths(date, 6);
    case '1y': return subMonths(date, 12);
  }
};

const AdminReports = () => {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [leadData, setLeadData] = useState<any[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [communicationStats, setCommunicationStats] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalEnrollments: 0,
    totalLeads: 0,
    conversionRate: 0,
    totalCommunications: 0,
    avgProgress: 0
  });

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    setLoading(true);
    const startDate = getDateFromPeriod(period);
    
    await Promise.all([
      fetchEnrollmentData(startDate),
      fetchLeadData(startDate),
      fetchCourseProgress(startDate),
      fetchCommunicationStats(startDate)
    ]);
    
    setLoading(false);
  };

  const fetchEnrollmentData = async (startDate: Date) => {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("enrolled_at, course_id")
      .gte("enrolled_at", startDate.toISOString())
      .order("enrolled_at", { ascending: true });

    if (enrollments) {
      const grouped = enrollments.reduce((acc: Record<string, number>, e) => {
        const date = format(new Date(e.enrolled_at), 'dd/MM', { locale: ptBR });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(grouped).map(([date, count]) => ({
        date,
        matriculas: count
      }));

      setEnrollmentData(chartData);
      setSummary(prev => ({ ...prev, totalEnrollments: enrollments.length }));
    }
  };

  const fetchLeadData = async (startDate: Date) => {
    const { data: leads } = await supabase
      .from("leads")
      .select("created_at, status")
      .gte("created_at", startDate.toISOString());

    if (leads) {
      // Group by date
      const grouped = leads.reduce((acc: Record<string, number>, l) => {
        const date = format(new Date(l.created_at), 'dd/MM', { locale: ptBR });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(grouped).map(([date, count]) => ({
        date,
        leads: count
      }));

      setLeadData(chartData);

      // Group by status
      const statusCounts: Record<string, number> = {};
      leads.forEach(l => {
        const status = l.status || 'new';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusData = Object.entries(statusCounts).map(([status, value]) => ({
        name: LEAD_STATUS_LABELS[status] || status,
        value,
        color: LEAD_STATUS_COLORS[status] || '#666'
      }));

      setLeadsByStatus(statusData);

      const converted = leads.filter(l => l.status === 'converted').length;
      const conversionRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;
      
      setSummary(prev => ({ 
        ...prev, 
        totalLeads: leads.length,
        conversionRate 
      }));
    }
  };

  const fetchCourseProgress = async (startDate: Date) => {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true);

    if (courses) {
      const progressData = await Promise.all(
        courses.map(async (course) => {
          const { data: modules } = await supabase
            .from("modules")
            .select("id")
            .eq("course_id", course.id);

          if (!modules?.length) return { name: course.title, progress: 0, students: 0 };

          const moduleIds = modules.map(m => m.id);
          const { data: lessons } = await supabase
            .from("lessons")
            .select("id")
            .in("module_id", moduleIds);

          if (!lessons?.length) return { name: course.title, progress: 0, students: 0 };

          const lessonIds = lessons.map(l => l.id);
          const { data: progress } = await supabase
            .from("progress")
            .select("user_id, completed")
            .in("lesson_id", lessonIds);

          if (!progress?.length) return { name: course.title, progress: 0, students: 0 };

          const uniqueStudents = new Set(progress.map(p => p.user_id)).size;
          const completed = progress.filter(p => p.completed).length;
          const avgProgress = Math.round((completed / progress.length) * 100);

          return {
            name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
            progress: avgProgress,
            students: uniqueStudents
          };
        })
      );

      setCourseProgress(progressData.filter(p => p.students > 0));
      
      const avgProgress = progressData.length > 0 
        ? Math.round(progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length)
        : 0;
      setSummary(prev => ({ ...prev, avgProgress }));
    }
  };

  const fetchCommunicationStats = async (startDate: Date) => {
    const { data: communications } = await supabase
      .from("communication_history")
      .select("sent_at, channel, status")
      .gte("sent_at", startDate.toISOString());

    if (communications) {
      const byChannel = communications.reduce((acc: Record<string, number>, c) => {
        acc[c.channel] = (acc[c.channel] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(byChannel).map(([channel, count]) => ({
        name: channel === 'email' ? 'Email' : channel === 'whatsapp' ? 'WhatsApp' : channel,
        enviados: count
      }));

      setCommunicationStats(chartData);
      setSummary(prev => ({ ...prev, totalCommunications: communications.length }));
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const PeriodSelector = () => (
    <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
      <SelectTrigger className="w-[140px]">
        <Calendar className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const SummaryCard = ({ icon: Icon, label, value, color, suffix = '' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden admin-stat-card border-0">
        <div className={`absolute inset-0 ${color} opacity-10`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}{suffix}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 admin-area">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas detalhadas do seu ecossistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector />
            <Button
              onClick={() => exportToCSV([...enrollmentData, ...leadData], 'relatorio_completo')}
              className="bg-card border border-border text-foreground hover:bg-muted"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <SummaryCard 
            icon={Users} 
            label="Matrículas" 
            value={summary.totalEnrollments}
            color="bg-blue-600"
          />
          <SummaryCard 
            icon={Target} 
            label="Leads" 
            value={summary.totalLeads}
            color="bg-purple-600"
          />
          <SummaryCard 
            icon={TrendingUp} 
            label="Conversão" 
            value={summary.conversionRate}
            suffix="%"
            color="bg-emerald-600"
          />
          <SummaryCard 
            icon={MessageSquare} 
            label="Comunicações" 
            value={summary.totalCommunications}
            color="bg-amber-600"
          />
          <SummaryCard 
            icon={Activity} 
            label="Progresso Médio" 
            value={summary.avgProgress}
            suffix="%"
            color="bg-teal-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Enrollments Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="admin-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    Matrículas por Período
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Evolução de novas matrículas</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => exportToCSV(enrollmentData, 'matriculas')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {enrollmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enrollmentData}>
                        <defs>
                          <linearGradient id="colorMatriculas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                        <Area 
                          type="monotone" 
                          dataKey="matriculas" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fill="url(#colorMatriculas)"
                          name="Matrículas"
                        />
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

          {/* Leads Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="admin-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <Target className="w-5 h-5 text-purple-600" />
                    Leads por Período
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Novos leads captados</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => exportToCSV(leadData, 'leads')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {leadData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={leadData}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                        <Area 
                          type="monotone" 
                          dataKey="leads" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fill="url(#colorLeads)"
                          name="Leads"
                        />
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
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Leads by Status Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="admin-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <PieChartIcon className="w-5 h-5 text-amber-600" />
                  Leads por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {leadsByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {leadsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
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

          {/* Course Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="admin-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Progresso por Curso
                </CardTitle>
                <CardDescription className="text-muted-foreground">Taxa de conclusão e alunos ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {courseProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={courseProgress} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={11}
                          width={100}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="progress" 
                          fill="#10b981" 
                          name="Progresso %"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar 
                          dataKey="students" 
                          fill="#3b82f6" 
                          name="Alunos"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sem dados de progresso
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Communications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="admin-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Comunicações Enviadas
              </CardTitle>
              <CardDescription className="text-muted-foreground">Total de mensagens por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {communicationStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={communicationStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip />
                      <Bar 
                        dataKey="enviados" 
                        fill="#14b8a6" 
                        name="Enviados"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Sem dados de comunicação
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
