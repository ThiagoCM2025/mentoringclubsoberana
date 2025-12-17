import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  TrendingUp,
  Target,
  GraduationCap,
  Activity,
  Calendar
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
  Legend
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

type PeriodFilter = '7d' | '30d' | '6m' | '1y';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  recentEnrollments: number;
  totalLeads: number;
  completionRate: number;
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
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  converted: '#10b981',
  lost: '#ef4444'
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Novos',
  contacted: 'Contactados',
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
    completionRate: 0
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

    // Total leads
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    // Completion rate
    const { data: progressData } = await supabase
      .from("progress")
      .select("completed");
    
    const completedLessons = progressData?.filter(p => p.completed).length || 0;
    const totalProgress = progressData?.length || 0;
    const completionRate = totalProgress > 0 ? Math.round((completedLessons / totalProgress) * 100) : 0;

    setStats({
      totalCourses: coursesCount || 0,
      totalStudents: pureStudents.length,
      totalEnrollments: enrollmentsCount || 0,
      recentEnrollments: recentCount || 0,
      totalLeads: leadsCount || 0,
      completionRate
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

      // Initialize periods based on filter
      if (enrollmentPeriod === '7d' || enrollmentPeriod === '30d') {
        // Group by day
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
        // Group by month
        const monthsCount = enrollmentPeriod === '6m' ? 6 : 12;
        for (let i = monthsCount - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const key = `${months[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
          groupedData[key] = 0;
        }

        enrollments.forEach(e => {
          const date = new Date(e.enrolled_at);
          const key = `${months[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
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

    // Get progress data with user info
    const { data: progressData } = await supabase
      .from("progress")
      .select("user_id, completed, updated_at")
      .gte("updated_at", startDate.toISOString());

    if (progressData && progressData.length > 0) {
      // Group by user
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

      // Get top 5 by completed lessons
      const topUserIds = Object.entries(userProgress)
        .sort((a, b) => b[1].completed - a[1].completed)
        .slice(0, 5)
        .map(([userId]) => userId);

      if (topUserIds.length > 0) {
        // Fetch user names
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

    // Recent enrollments
    const { data: recentEnrollments } = await supabase
      .from("enrollments")
      .select(`
        id,
        enrolled_at,
        user_id,
        course_id
      `)
      .order("enrolled_at", { ascending: false })
      .limit(3);

    if (recentEnrollments) {
      // Get course names
      const courseIds = recentEnrollments.map(e => e.course_id);
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      const courseMap = new Map(courses?.map(c => [c.id, c.title]) || []);

      recentEnrollments.forEach(e => {
        activities.push({
          id: e.id,
          type: 'enrollment',
          description: `Nova matrícula em "${courseMap.get(e.course_id) || 'Curso'}"`,
          date: e.enrolled_at
        });
      });
    }

    // Recent leads
    const { data: recentLeads } = await supabase
      .from("leads")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    if (recentLeads) {
      recentLeads.forEach(l => {
        activities.push({
          id: l.id,
          type: 'lead',
          description: `Novo lead: ${l.full_name}`,
          date: l.created_at
        });
      });
    }

    // Sort by date and take top 5
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivities(activities.slice(0, 5));
  };

  const statCards = [
    { icon: BookOpen, label: "Cursos", value: stats.totalCourses, color: "bg-blue-500" },
    { icon: Users, label: "Alunos", value: stats.totalStudents, color: "bg-green-500" },
    { icon: UserCheck, label: "Matrículas", value: stats.totalEnrollments, color: "bg-purple-500" },
    { icon: TrendingUp, label: "Novos (7 dias)", value: stats.recentEnrollments, color: "bg-orange-500" },
    { icon: Target, label: "Leads", value: stats.totalLeads, color: "bg-pink-500" },
    { icon: GraduationCap, label: "Conclusão", value: `${stats.completionRate}%`, color: "bg-teal-500" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserCheck className="w-4 h-4 text-purple-500" />;
      case 'lead': return <Target className="w-4 h-4 text-pink-500" />;
      case 'course': return <BookOpen className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const PeriodSelector = ({ value, onChange }: { value: PeriodFilter; onChange: (v: PeriodFilter) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodFilter)}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
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
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-admin font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-admin">
            Visão geral do seu ecossistema de cursos
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-elegant p-4 lg:p-6"
            >
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-foreground">
                {loading ? "-" : stat.value}
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elegant p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground">
                Matrículas
              </h3>
              <PeriodSelector value={enrollmentPeriod} onChange={setEnrollmentPeriod} />
            </div>
            <div className="h-64">
              {enrollmentTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="period" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="enrollments" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="Matrículas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados de matrículas
                </div>
              )}
            </div>
          </motion.div>

          {/* Leads by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elegant p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground">
                Leads por Status
              </h3>
              <PeriodSelector value={leadsPeriod} onChange={setLeadsPeriod} />
            </div>
            <div className="h-64">
              {leadsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leadsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem leads no período
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Student Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card-elegant p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-foreground">
              Top 5 Alunos Mais Ativos
            </h3>
            <PeriodSelector value={progressPeriod} onChange={setProgressPeriod} />
          </div>
          <div className="h-64">
            {studentProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completed" 
                    fill="#10b981" 
                    name="Concluídas"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="inProgress" 
                    fill="#f59e0b" 
                    name="Em Progresso"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Sem dados de progresso no período
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elegant p-6 lg:col-span-2"
          >
            <h3 className="font-serif font-semibold text-foreground mb-4">
              Atividades Recentes
            </h3>
            {recentActivities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atividade</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <span className="text-sm">{activity.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma atividade recente
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h3 className="font-serif font-semibold text-foreground">
              Ações Rápidas
            </h3>
            <a href="/admin/courses/new" className="card-elegant p-4 hover:border-secondary/50 transition-colors group flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium text-foreground group-hover:text-secondary transition-colors text-sm">
                  Criar Novo Curso
                </p>
                <p className="text-xs text-muted-foreground">
                  Adicione um novo curso
                </p>
              </div>
            </a>
            <a href="/admin/students" className="card-elegant p-4 hover:border-secondary/50 transition-colors group flex items-center gap-3">
              <Users className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium text-foreground group-hover:text-secondary transition-colors text-sm">
                  Gerenciar Alunos
                </p>
                <p className="text-xs text-muted-foreground">
                  Veja todos os alunos
                </p>
              </div>
            </a>
            <a href="/admin/enrollments" className="card-elegant p-4 hover:border-secondary/50 transition-colors group flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium text-foreground group-hover:text-secondary transition-colors text-sm">
                  Adicionar Matrícula
                </p>
                <p className="text-xs text-muted-foreground">
                  Matricule um aluno
                </p>
              </div>
            </a>
            <a href="/admin/leads" className="card-elegant p-4 hover:border-secondary/50 transition-colors group flex items-center gap-3">
              <Target className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium text-foreground group-hover:text-secondary transition-colors text-sm">
                  Gerenciar Leads
                </p>
                <p className="text-xs text-muted-foreground">
                  Acompanhe seus leads
                </p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
