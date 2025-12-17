import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  TrendingUp,
  Flame,
  Calendar,
  Activity,
  BarChart3,
  Target
} from "lucide-react";
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

type PeriodFilter = '7d' | '30d' | '6m' | '1y';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
];

const WEEKDAY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];
const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface StudentEngagement {
  user_id: string;
  full_name: string;
  xp: number;
  level: number;
  streak_days: number;
  total_lessons_completed: number;
  total_study_minutes: number;
  last_activity_date: string | null;
}

const getDateFromPeriod = (period: PeriodFilter): Date => {
  const date = new Date();
  switch (period) {
    case '7d': return subDays(date, 7);
    case '30d': return subDays(date, 30);
    case '6m': return subMonths(date, 6);
    case '1y': return subMonths(date, 12);
  }
};

export default function AdminEngagement() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalStudyMinutes: 0,
    activeStudents: 0,
    avgCompletionRate: 0,
    maxStreak: 0
  });
  const [activityByDay, setActivityByDay] = useState<any[]>([]);
  const [activityTrend, setActivityTrend] = useState<any[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentEngagement[]>([]);
  const [sortBy, setSortBy] = useState<'xp' | 'streak_days' | 'total_lessons_completed'>('xp');

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    setLoading(true);
    const startDate = getDateFromPeriod(period);

    await Promise.all([
      fetchSummary(startDate),
      fetchActivityByDay(startDate),
      fetchActivityTrend(startDate),
      fetchHourlyActivity(startDate),
      fetchStudents()
    ]);

    setLoading(false);
  };

  const fetchSummary = async (startDate: Date) => {
    // Total study minutes
    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("total_study_minutes, streak_days, last_activity_date");

    const totalMinutes = gamification?.reduce((sum, g) => sum + (g.total_study_minutes || 0), 0) || 0;
    const maxStreak = gamification?.reduce((max, g) => Math.max(max, g.streak_days || 0), 0) || 0;
    
    const today = new Date().toISOString().split('T')[0];
    const activeToday = gamification?.filter(g => g.last_activity_date === today).length || 0;

    // Completion rate
    const { data: progress } = await supabase
      .from("progress")
      .select("completed")
      .gte("updated_at", startDate.toISOString());

    const completed = progress?.filter(p => p.completed).length || 0;
    const total = progress?.length || 0;
    const avgCompletion = total > 0 ? Math.round((completed / total) * 100) : 0;

    setSummary({
      totalStudyMinutes: totalMinutes,
      activeStudents: activeToday,
      avgCompletionRate: avgCompletion,
      maxStreak
    });
  };

  const fetchActivityByDay = async (startDate: Date) => {
    const { data: progress } = await supabase
      .from("progress")
      .select("updated_at")
      .gte("updated_at", startDate.toISOString());

    const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    progress?.forEach(p => {
      const day = new Date(p.updated_at).getDay();
      dayCount[day]++;
    });

    const chartData = WEEKDAY_NAMES.map((name, index) => ({
      name,
      atividades: dayCount[index],
      fill: WEEKDAY_COLORS[index]
    }));

    setActivityByDay(chartData);
  };

  const fetchActivityTrend = async (startDate: Date) => {
    const { data: progress } = await supabase
      .from("progress")
      .select("updated_at, completed")
      .gte("updated_at", startDate.toISOString())
      .order("updated_at", { ascending: true });

    const grouped: Record<string, { total: number; completed: number }> = {};

    progress?.forEach(p => {
      const date = format(new Date(p.updated_at), 'dd/MM', { locale: ptBR });
      if (!grouped[date]) grouped[date] = { total: 0, completed: 0 };
      grouped[date].total++;
      if (p.completed) grouped[date].completed++;
    });

    const chartData = Object.entries(grouped).map(([date, data]) => ({
      date,
      atividades: data.total,
      conclusoes: data.completed
    }));

    setActivityTrend(chartData);
  };

  const fetchHourlyActivity = async (startDate: Date) => {
    const { data: progress } = await supabase
      .from("progress")
      .select("updated_at")
      .gte("updated_at", startDate.toISOString());

    const hourCount: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCount[i] = 0;

    progress?.forEach(p => {
      const hour = new Date(p.updated_at).getHours();
      hourCount[hour]++;
    });

    const chartData = Object.entries(hourCount).map(([hour, count]) => ({
      hora: `${hour}h`,
      atividades: count
    }));

    setHourlyActivity(chartData);
  };

  const fetchStudents = async () => {
    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("user_id, xp, level, streak_days, total_lessons_completed, total_study_minutes, last_activity_date")
      .order("xp", { ascending: false })
      .limit(50);

    if (gamification && gamification.length > 0) {
      const userIds = gamification.map(g => g.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const studentData: StudentEngagement[] = gamification.map(g => ({
        user_id: g.user_id,
        full_name: nameMap.get(g.user_id) || 'Aluno',
        xp: g.xp,
        level: g.level,
        streak_days: g.streak_days,
        total_lessons_completed: g.total_lessons_completed,
        total_study_minutes: g.total_study_minutes,
        last_activity_date: g.last_activity_date
      }));

      setStudents(studentData);
    }
  };

  const sortedStudents = [...students].sort((a, b) => b[sortBy] - a[sortBy]);

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const SummaryCard = ({ icon: Icon, label, value, color, suffix = '' }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden admin-stat-card border-0">
        <div className={`absolute inset-0 ${color} opacity-10`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cream/60">{label}</p>
              <p className="text-3xl font-bold text-cream mt-1">{value}{suffix}</p>
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
            <h1 className="text-3xl font-bold text-cream">
              Engajamento dos Alunos
            </h1>
            <p className="text-cream/60 mt-1">
              Métricas de tempo de estudo, frequência e padrões de uso
            </p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-secondary/30 text-cream">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={Clock}
            label="Tempo Total de Estudo"
            value={formatMinutes(summary.totalStudyMinutes)}
            color="bg-blue-600"
          />
          <SummaryCard
            icon={Users}
            label="Alunos Ativos Hoje"
            value={summary.activeStudents}
            color="bg-emerald-600"
          />
          <SummaryCard
            icon={Target}
            label="Taxa de Conclusão"
            value={summary.avgCompletionRate}
            suffix="%"
            color="bg-violet-600"
          />
          <SummaryCard
            icon={Flame}
            label="Maior Streak"
            value={summary.maxStreak}
            suffix=" dias"
            color="bg-orange-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Activity Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="admin-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-cream">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Evolução de Atividades
                </CardTitle>
                <CardDescription className="text-cream/60">Atividades e conclusões por período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {activityTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityTrend}>
                        <defs>
                          <linearGradient id="colorAtividades" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorConclusoes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Legend />
                        <Area type="monotone" dataKey="atividades" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAtividades)" name="Atividades" />
                        <Area type="monotone" dataKey="conclusoes" stroke="#10b981" strokeWidth={2} fill="url(#colorConclusoes)" name="Conclusões" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-cream/60">
                      Sem dados no período
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity by Day */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="admin-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-cream">
                  <Calendar className="w-5 h-5 text-secondary" />
                  Atividade por Dia da Semana
                </CardTitle>
                <CardDescription className="text-cream/60">Distribuição de atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {activityByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="atividades" name="Atividades" radius={[4, 4, 0, 0]}>
                          {activityByDay.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-cream/60">
                      Sem dados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Hourly Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Padrão de Uso por Horário
              </CardTitle>
              <CardDescription>Quando seus alunos mais estudam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {hourlyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="atividades" fill="#14b8a6" name="Atividades" radius={[2, 2, 0, 0]} />
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

        {/* Students Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-pink-600" />
                  Ranking de Engajamento
                </CardTitle>
                <CardDescription>Top alunos por engajamento</CardDescription>
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xp">XP Total</SelectItem>
                  <SelectItem value="streak_days">Streak</SelectItem>
                  <SelectItem value="total_lessons_completed">Aulas Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead className="text-center">Level</TableHead>
                      <TableHead className="text-center">XP</TableHead>
                      <TableHead className="text-center">Streak</TableHead>
                      <TableHead className="text-center">Aulas</TableHead>
                      <TableHead className="text-center">Tempo</TableHead>
                      <TableHead className="text-center">Última Atividade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStudents.slice(0, 20).map((student, index) => (
                      <TableRow key={student.user_id}>
                        <TableCell className="font-medium">
                          {index < 3 ? (
                            <Badge variant={index === 0 ? "default" : "secondary"} className={index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"}>
                              {index + 1}º
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{student.level}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium text-primary">
                          {student.xp.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {student.streak_days}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{student.total_lessons_completed}</TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {formatMinutes(student.total_study_minutes)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {student.last_activity_date
                            ? format(new Date(student.last_activity_date), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {students.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum dado de engajamento encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
