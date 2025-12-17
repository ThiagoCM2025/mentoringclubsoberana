import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { StatsCardSkeleton, ChartSkeleton, PieChartSkeleton, ActivityTimelineSkeleton } from "@/components/admin/skeletons/AdminSkeletons";
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  TrendingUp,
  Target,
  GraduationCap,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  BarChart3
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

type PeriodFilter = '7d' | '30d' | '6m' | '1y';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  recentEnrollments: number;
  totalLeads: number;
  completionRate: number;
  conversionRate: number;
  estimatedRevenue: number;
  growthRate: number;
}

interface EnrollmentTrend {
  period: string;
  enrollments: number;
}

interface LeadByStatus {
  name: string;
  value: number;
  color: string;
}

interface StudentProgress {
  name: string;
  completed: number;
  inProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'lead' | 'course';
  description: string;
  date: string;
  userName?: string;
}

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

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
];

const getDateFromPeriod = (period: PeriodFilter): Date => {
  const date = new Date();
  switch (period) {
    case '7d':
      date.setDate(date.getDate() - 7);
      break;
    case '30d':
      date.setDate(date.getDate() - 30);
      break;
    case '6m':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1y':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }
  return date;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    recentEnrollments: 0,
    totalLeads: 0,
    completionRate: 0,
    conversionRate: 0,
    estimatedRevenue: 0,
    growthRate: 0
  });
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<LeadByStatus[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentPeriod, setEnrollmentPeriod] = useState<PeriodFilter>('6m');
  const [leadsPeriod, setLeadsPeriod] = useState<PeriodFilter>('30d');
  const [progressPeriod, setProgressPeriod] = useState<PeriodFilter>('30d');

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    fetchEnrollmentTrends();
  }, [enrollmentPeriod]);

  useEffect(() => {
    fetchLeadsByStatus();
  }, [leadsPeriod]);

  useEffect(() => {
    fetchStudentProgress();
  }, [progressPeriod]);

  useEffect(() => {
    if (stats.totalCourses > 0 || enrollmentTrends.length > 0) {
      setLoading(false);
    }
  }, [stats, enrollmentTrends]);

  const fetchStats = async () => {
    // Total courses
    const { count: coursesCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    // Get admin user_ids to exclude
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    const adminUserIds = adminRoles?.map(r => r.user_id) || [];

    // Total students (excluding admins)
    const { data: studentRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");
    
    const pureStudents = studentRoles?.filter(s => !adminUserIds.includes(s.user_id)) || [];

    // Total enrollments
    const { count: enrollmentsCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true });

    // Recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: recentCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .gte("enrolled_at", sevenDaysAgo.toISOString());

    // Previous 7 days for growth calculation
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const { count: previousCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .gte("enrolled_at", fourteenDaysAgo.toISOString())
      .lt("enrolled_at", sevenDaysAgo.toISOString());

    // Growth rate
    const growthRate = previousCount && previousCount > 0 
      ? Math.round(((recentCount || 0) - previousCount) / previousCount * 100)
      : 0;

    // Total leads
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    // Converted leads for conversion rate
    const { count: convertedCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "converted");

    const conversionRate = leadsCount && leadsCount > 0 
      ? Math.round((convertedCount || 0) / leadsCount * 100) 
      : 0;

    // Completion rate
    const { data: progressData } = await supabase
      .from("progress")
      .select("completed");
    
    const completedLessons = progressData?.filter(p => p.completed).length || 0;
    const totalProgress = progressData?.length || 0;
    const completionRate = totalProgress > 0 ? Math.round((completedLessons / totalProgress) * 100) : 0;

    // Estimated revenue (mock - based on enrollments * average price)
    const { data: courses } = await supabase
      .from("courses")
      .select("price")
      .not("price", "is", null);
    
    const avgPrice = courses && courses.length > 0 
      ? courses.reduce((sum, c) => sum + (c.price || 0), 0) / courses.length 
      : 0;
    const estimatedRevenue = (enrollmentsCount || 0) * avgPrice;

    setStats({
      totalCourses: coursesCount || 0,
      totalStudents: pureStudents.length,
      totalEnrollments: enrollmentsCount || 0,
      recentEnrollments: recentCount || 0,
      totalLeads: leadsCount || 0,
      completionRate,
      conversionRate,
      estimatedRevenue,
      growthRate
    });
  };

  const fetchEnrollmentTrends = async () => {
    const startDate = getDateFromPeriod(enrollmentPeriod);

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("enrolled_at")
      .gte("enrolled_at", startDate.toISOString())
      .order("enrolled_at", { ascending: true });

    if (enrollments) {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const groupedData: Record<string, number> = {};

      if (enrollmentPeriod === '7d' || enrollmentPeriod === '30d') {
        const days = enrollmentPeriod === '7d' ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const key = `${date.getDate()}/${date.getMonth() + 1}`;
          groupedData[key] = 0;
        }
        
        enrollments.forEach(e => {
          const date = new Date(e.enrolled_at);
          const key = `${date.getDate()}/${date.getMonth() + 1}`;
          if (key in groupedData) {
            groupedData[key]++;
          }
        });
      } else {
        const monthsCount = enrollmentPeriod === '6m' ? 6 : 12;
        for (let i = monthsCount - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const key = `${months[date.getMonth()]}`;
          groupedData[key] = 0;
        }

        enrollments.forEach(e => {
          const date = new Date(e.enrolled_at);
          const key = `${months[date.getMonth()]}`;
          if (key in groupedData) {
            groupedData[key]++;
          }
        });
      }

      const trends = Object.entries(groupedData).map(([period, enrollments]) => ({
        period,
        enrollments
      }));

      setEnrollmentTrends(trends);
    }
  };

  const fetchLeadsByStatus = async () => {
    const startDate = getDateFromPeriod(leadsPeriod);

    const { data: leads } = await supabase
      .from("leads")
      .select("status")
      .gte("created_at", startDate.toISOString());

    if (leads) {
      const statusCounts: Record<string, number> = {
        new: 0,
        contacted: 0,
        negotiating: 0,
        converted: 0,
        lost: 0
      };

      leads.forEach(lead => {
        const status = lead.status || 'new';
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });

      const chartData = Object.entries(statusCounts)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
          name: LEAD_STATUS_LABELS[status] || status,
          value,
          color: LEAD_STATUS_COLORS[status] || '#666'
        }));

      setLeadsByStatus(chartData);
    }
  };

  const fetchStudentProgress = async () => {
    const startDate = getDateFromPeriod(progressPeriod);

    const { data: progressData } = await supabase
      .from("progress")
      .select("user_id, completed, updated_at")
      .gte("updated_at", startDate.toISOString());

    if (progressData && progressData.length > 0) {
      const userProgress: Record<string, { completed: number; inProgress: number }> = {};
      
      progressData.forEach(p => {
        if (!userProgress[p.user_id]) {
          userProgress[p.user_id] = { completed: 0, inProgress: 0 };
        }
        if (p.completed) {
          userProgress[p.user_id].completed++;
        } else {
          userProgress[p.user_id].inProgress++;
        }
      });

      const topUserIds = Object.entries(userProgress)
        .sort((a, b) => b[1].completed - a[1].completed)
        .slice(0, 5)
        .map(([userId]) => userId);

      if (topUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", topUserIds);

        const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        const chartData = topUserIds.map(userId => ({
          name: nameMap.get(userId)?.split(' ')[0] || 'Aluno',
          completed: userProgress[userId].completed,
          inProgress: userProgress[userId].inProgress
        }));

        setStudentProgress(chartData);
      } else {
        setStudentProgress([]);
      }
    } else {
      setStudentProgress([]);
    }
  };

  const fetchRecentActivities = async () => {
    const activities: RecentActivity[] = [];

    const { data: recentEnrollments } = await supabase
      .from("enrollments")
      .select(`id, enrolled_at, user_id, course_id`)
      .order("enrolled_at", { ascending: false })
      .limit(5);

    if (recentEnrollments) {
      const courseIds = recentEnrollments.map(e => e.course_id);
      const userIds = recentEnrollments.map(e => e.user_id);
      
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const courseMap = new Map(courses?.map(c => [c.id, c.title]) || []);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      recentEnrollments.forEach(e => {
        activities.push({
          id: e.id,
          type: 'enrollment',
          description: `Nova matrícula em "${courseMap.get(e.course_id) || 'Curso'}"`,
          date: e.enrolled_at,
          userName: profileMap.get(e.user_id) || 'Aluno'
        });
      });
    }

    const { data: recentLeads } = await supabase
      .from("leads")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentLeads) {
      recentLeads.forEach(l => {
        activities.push({
          id: l.id,
          type: 'lead',
          description: `Novo lead capturado`,
          date: l.created_at,
          userName: l.full_name
        });
      });
    }

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivities(activities.slice(0, 8));
  };

  const statCards = [
    { 
      icon: BookOpen, 
      label: "Cursos Ativos", 
      value: stats.totalCourses, 
      gradient: "from-secondary to-secondary-light",
      bgLight: "bg-secondary/10"
    },
    { 
      icon: Users, 
      label: "Alunos", 
      value: stats.totalStudents, 
      gradient: "from-emerald-600 to-emerald-500",
      bgLight: "bg-emerald-500/10"
    },
    { 
      icon: UserCheck, 
      label: "Matrículas", 
      value: stats.totalEnrollments, 
      gradient: "from-violet-600 to-violet-500",
      bgLight: "bg-violet-500/10"
    },
    { 
      icon: TrendingUp, 
      label: "Novos (7d)", 
      value: stats.recentEnrollments, 
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      trend: stats.growthRate,
      trendUp: stats.growthRate >= 0
    },
    { 
      icon: Target, 
      label: "Leads", 
      value: stats.totalLeads, 
      gradient: "from-pink-500 to-pink-600",
      bgLight: "bg-pink-50"
    },
    { 
      icon: Percent, 
      label: "Conversão", 
      value: `${stats.conversionRate}%`, 
      gradient: "from-teal-500 to-teal-600",
      bgLight: "bg-teal-50"
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserCheck className="w-4 h-4" />;
      case 'lead': return <Target className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': return 'bg-violet-100 text-violet-600';
      case 'lead': return 'bg-pink-100 text-pink-600';
      case 'course': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const PeriodSelector = ({ value, onChange }: { value: PeriodFilter; onChange: (v: PeriodFilter) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodFilter)}>
      <SelectTrigger className="w-[120px] h-8 text-xs border-border bg-card text-foreground">
        <Calendar className="w-3 h-3 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 admin-area">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground title-premium mb-1">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do seu ecossistema de cursos
          </p>
        </motion.div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="col-span-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
              >
                <StatsCardSkeleton count={6} />
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
              >
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.08,
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    <div className="admin-stat-card p-5">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-[100px] opacity-60`} />
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-end gap-2">
                        <motion.p 
                          className="text-2xl font-bold text-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.08 + 0.2 }}
                        >
                          {stat.value}
                        </motion.p>
                        {stat.trend !== undefined && (
                          <motion.span 
                            className={`text-xs font-medium flex items-center ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 + 0.3 }}
                          >
                            {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(stat.trend)}%
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trends - Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="admin-card border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-4 h-4 text-secondary" />
                  Evolução de Matrículas
                </CardTitle>
                <PeriodSelector value={enrollmentPeriod} onChange={setEnrollmentPeriod} />
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="chart-skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <ChartSkeleton height={256} />
                      </motion.div>
                    ) : enrollmentTrends.length > 0 ? (
                      <motion.div
                        key="chart-data"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={enrollmentTrends}>
                            <defs>
                              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--secondary) / 0.2)" vertical={false} />
                            <XAxis 
                              dataKey="period" 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--secondary) / 0.3)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="enrollments" 
                              stroke="hsl(var(--secondary))" 
                              strokeWidth={2}
                              fill="url(#colorEnrollments)"
                              name="Matrículas"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="no-data"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex items-center justify-center text-muted-foreground"
                      >
                        Sem dados de matrículas
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leads by Status - Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="admin-card border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <Target className="w-4 h-4 text-pink-400" />
                  Leads por Status
                </CardTitle>
                <PeriodSelector value={leadsPeriod} onChange={setLeadsPeriod} />
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="pie-skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex items-center justify-center"
                      >
                        <PieChartSkeleton size={180} />
                      </motion.div>
                    ) : leadsByStatus.length > 0 ? (
                      <motion.div
                        key="pie-data"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={leadsByStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {leadsByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--secondary) / 0.3)',
                                borderRadius: '12px'
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="no-leads"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex items-center justify-center text-muted-foreground"
                      >
                        Sem leads no período
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Student Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <Card className="admin-card border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Top 5 Alunos Mais Ativos
              </CardTitle>
              <PeriodSelector value={progressPeriod} onChange={setProgressPeriod} />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="progress-skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <ChartSkeleton height={256} />
                    </motion.div>
                  ) : studentProgress.length > 0 ? (
                    <motion.div
                      key="progress-data"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studentProgress} layout="vertical" barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--secondary) / 0.2)" horizontal={false} />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11}
                            width={80}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--secondary) / 0.3)',
                              borderRadius: '12px'
                            }}
                          />
                          <Legend 
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                          />
                          <Bar 
                            dataKey="completed" 
                            fill="#10b981" 
                            name="Concluídas"
                            radius={[0, 6, 6, 0]}
                          />
                          <Bar 
                            dataKey="inProgress" 
                            fill="#f59e0b" 
                            name="Em Progresso"
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-progress"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex items-center justify-center text-muted-foreground"
                    >
                      Sem dados de progresso no período
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="admin-card border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <Activity className="w-4 h-4 text-violet-400" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="activity-skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ActivityTimelineSkeleton count={5} />
                    </motion.div>
                  ) : recentActivities.length > 0 ? (
                    <motion.div
                      key="activity-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      {recentActivities.map((activity, index) => (
                        <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {activity.userName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(activity.date).toLocaleDateString("pt-BR", { 
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-activity"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma atividade recente
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="admin-card border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link 
                  to="/admin/courses/new" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-all group border border-blue-500/20"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">
                      Novo Curso
                    </p>
                    <p className="text-xs text-muted-foreground">Criar novo curso</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/students" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group border border-emerald-500/20"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors">
                      Alunos
                    </p>
                    <p className="text-xs text-muted-foreground">Gerenciar alunos</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/leads" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 transition-all group border border-pink-500/20"
                >
                  <div className="w-9 h-9 rounded-lg bg-pink-500 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-pink-400 transition-colors">
                      Leads
                    </p>
                    <p className="text-xs text-muted-foreground">Gerenciar leads</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/reports" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 transition-all group border border-violet-500/20"
                >
                  <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-violet-400 transition-colors">
                      Relatórios
                    </p>
                    <p className="text-xs text-muted-foreground">Ver métricas</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
