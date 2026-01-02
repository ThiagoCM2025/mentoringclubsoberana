import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { StatsCardSkeleton, ChartSkeleton, PieChartSkeleton, ActivityTimelineSkeleton } from "@/components/admin/skeletons/AdminSkeletons";
import { LeadFunnelChart } from "@/components/admin/leads/LeadFunnelChart";
import { ActiveAlertsPanel } from "@/components/admin/alerts/ActiveAlertsPanel";
import { TagManager } from "@/components/admin/tags/TagManager";
import { WidgetSelector, useWidgetLayout } from "@/components/admin/widgets/WidgetSelector";
import { Button } from "@/components/ui/button";
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
  BarChart3,
  MessageSquare,
  Award,
  Trophy,
  Star,
  FileText,
  Zap,
  Crown,
  Flame,
  Heart,
  ThumbsUp,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Clock,
  Tag,
  Settings,
  LayoutGrid
} from "lucide-react";
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
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from "recharts";
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
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

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
  // New metrics
  totalRevenue: number;
  totalCertificates: number;
  totalCommunityPosts: number;
  totalComments: number;
  totalXP: number;
  totalBadges: number;
  earnedBadgesCount: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalLikes: number;
  avgStreak: number;
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
  type: 'enrollment' | 'lead' | 'course' | 'certificate' | 'community' | 'badge';
  description: string;
  date: string;
  userName?: string;
}

interface TopStudent {
  user_id: string;
  full_name: string;
  xp: number;
  level: number;
  streak_days: number;
}

interface CommunityEngagement {
  period: string;
  posts: number;
  comments: number;
  likes: number;
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

// Animated counter hook
const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

// Premium Stat Card Component
const PremiumStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp, 
  gradient, 
  delay = 0,
  tooltip,
  suffix = '',
  prefix = ''
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string; 
  trend?: number; 
  trendUp?: boolean; 
  gradient: string;
  delay?: number;
  tooltip?: string;
  suffix?: string;
  prefix?: string;
}) => {
  const numValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(numValue);
  const displayValue = typeof value === 'string' ? value : `${prefix}${animatedValue.toLocaleString('pt-BR')}${suffix}`;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <div className="relative p-3 rounded-xl bg-card border border-border/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-secondary/40 hover:bg-card/80">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Decorative glow */}
        <div className={cn(
          "absolute -top-10 -right-10 w-20 h-20 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40",
          gradient
        )} />
        
        {/* Icon container with glow */}
        <div className={cn(
          "relative w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-md transition-transform duration-300 group-hover:scale-110",
          `bg-gradient-to-br ${gradient}`
        )}>
          <Icon className="w-4 h-4 text-white" />
          <div className={cn(
            "absolute inset-0 rounded-lg blur-lg opacity-50",
            `bg-gradient-to-br ${gradient}`
          )} />
        </div>
        
        {/* Value and trend */}
        <div className="flex items-end gap-2 mb-0.5">
          <motion.p 
            className="text-lg lg:text-xl font-bold text-foreground tracking-tight"
            key={displayValue}
          >
            {displayValue}
          </motion.p>
          {trend !== undefined && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={cn(
                "text-xs font-semibold flex items-center px-1.5 py-0.5 rounded-full mb-1",
                trendUp ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'
              )}
            >
              {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </motion.span>
          )}
        </div>
        
        {/* Label */}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </motion.div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Section Header Component
const SectionHeader = ({ 
  title, 
  icon: Icon,
  iconColor = "text-secondary"
}: { 
  title: string; 
  icon: React.ElementType;
  iconColor?: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 mb-3"
  >
    <div className="p-1 rounded-md bg-secondary/10">
      <Icon className={cn("w-3.5 h-3.5", iconColor)} />
    </div>
    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
  </motion.div>
);

// Chart Card Component
const ChartCard = ({ 
  title, 
  icon: Icon,
  iconColor = "text-secondary",
  children,
  period,
  onPeriodChange,
  delay = 0
}: { 
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  period?: PeriodFilter;
  onPeriodChange?: (v: PeriodFilter) => void;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none" />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
          {title}
        </CardTitle>
        {period && onPeriodChange && (
          <Select value={period} onValueChange={(v) => onPeriodChange(v as PeriodFilter)}>
            <SelectTrigger className="w-[110px] h-7 text-xs border-border/50 bg-background/50 text-foreground backdrop-blur-sm">
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
        )}
      </CardHeader>
      <CardContent className="relative">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

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
    growthRate: 0,
    totalRevenue: 0,
    totalCertificates: 0,
    totalCommunityPosts: 0,
    totalComments: 0,
    totalXP: 0,
    totalBadges: 0,
    earnedBadgesCount: 0,
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    totalLikes: 0,
    avgStreak: 0
  });
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<LeadByStatus[]>([]);
  const [allLeads, setAllLeads] = useState<{ id: string; status: LeadStatus | null }[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [communityEngagement, setCommunityEngagement] = useState<CommunityEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentPeriod, setEnrollmentPeriod] = useState<PeriodFilter>('6m');
  const [leadsPeriod, setLeadsPeriod] = useState<PeriodFilter>('30d');
  const [progressPeriod, setProgressPeriod] = useState<PeriodFilter>('30d');
  const [communityPeriod, setCommunityPeriod] = useState<PeriodFilter>('30d');
  const [showTagManager, setShowTagManager] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const { layout, saveLayout } = useWidgetLayout();

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
    fetchAllLeads();
    fetchTopStudents();
    fetchCommunityEngagement();
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
    fetchCommunityEngagement();
  }, [communityPeriod]);

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

    // NEW METRICS
    // Total Revenue from lead_conversions
    const { data: conversions } = await supabase
      .from("lead_conversions")
      .select("revenue");
    const totalRevenue = conversions?.reduce((sum, c) => sum + (c.revenue || 0), 0) || 0;

    // Total Certificates
    const { count: certificatesCount } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true });

    // Community Posts
    const { count: postsCount } = await supabase
      .from("community_posts")
      .select("*", { count: "exact", head: true });

    // Community Comments
    const { count: commentsCount } = await supabase
      .from("community_comments")
      .select("*", { count: "exact", head: true });

    // Community Likes
    const { count: likesCount } = await supabase
      .from("community_likes")
      .select("*", { count: "exact", head: true });

    // Total XP
    const { data: gamificationData } = await supabase
      .from("user_gamification")
      .select("xp, streak_days");
    const totalXP = gamificationData?.reduce((sum, g) => sum + (g.xp || 0), 0) || 0;
    const avgStreak = gamificationData && gamificationData.length > 0
      ? Math.round(gamificationData.reduce((sum, g) => sum + (g.streak_days || 0), 0) / gamificationData.length)
      : 0;

    // Total Badges
    const { count: badgesCount } = await supabase
      .from("badges")
      .select("*", { count: "exact", head: true });

    // Earned Badges
    const { count: earnedBadgesCount } = await supabase
      .from("user_badges")
      .select("*", { count: "exact", head: true });

    // Blog Posts
    const { count: blogPostsCount } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true });

    const { count: publishedBlogCount } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    setStats({
      totalCourses: coursesCount || 0,
      totalStudents: pureStudents.length,
      totalEnrollments: enrollmentsCount || 0,
      recentEnrollments: recentCount || 0,
      totalLeads: leadsCount || 0,
      completionRate,
      conversionRate,
      estimatedRevenue,
      growthRate,
      totalRevenue,
      totalCertificates: certificatesCount || 0,
      totalCommunityPosts: postsCount || 0,
      totalComments: commentsCount || 0,
      totalXP,
      totalBadges: badgesCount || 0,
      earnedBadgesCount: earnedBadgesCount || 0,
      totalBlogPosts: blogPostsCount || 0,
      publishedBlogPosts: publishedBlogCount || 0,
      totalLikes: likesCount || 0,
      avgStreak
    });
  };

  const fetchTopStudents = async () => {
    const { data } = await supabase
      .from("user_gamification")
      .select("user_id, xp, level, streak_days")
      .order("xp", { ascending: false })
      .limit(5);

    if (data && data.length > 0) {
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      setTopStudents(data.map(d => ({
        ...d,
        full_name: nameMap.get(d.user_id) || 'Aluno'
      })));
    }
  };

  const fetchCommunityEngagement = async () => {
    const startDate = getDateFromPeriod(communityPeriod);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Fetch posts
    const { data: posts } = await supabase
      .from("community_posts")
      .select("created_at")
      .gte("created_at", startDate.toISOString());

    // Fetch comments
    const { data: comments } = await supabase
      .from("community_comments")
      .select("created_at")
      .gte("created_at", startDate.toISOString());

    // Fetch likes
    const { data: likes } = await supabase
      .from("community_likes")
      .select("created_at")
      .gte("created_at", startDate.toISOString());

    const groupedData: Record<string, { posts: number; comments: number; likes: number }> = {};

    if (communityPeriod === '7d' || communityPeriod === '30d') {
      const days = communityPeriod === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;
        groupedData[key] = { posts: 0, comments: 0, likes: 0 };
      }

      posts?.forEach(p => {
        const date = new Date(p.created_at);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;
        if (key in groupedData) groupedData[key].posts++;
      });

      comments?.forEach(c => {
        const date = new Date(c.created_at!);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;
        if (key in groupedData) groupedData[key].comments++;
      });

      likes?.forEach(l => {
        const date = new Date(l.created_at!);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;
        if (key in groupedData) groupedData[key].likes++;
      });
    } else {
      const monthsCount = communityPeriod === '6m' ? 6 : 12;
      for (let i = monthsCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = months[date.getMonth()];
        groupedData[key] = { posts: 0, comments: 0, likes: 0 };
      }

      posts?.forEach(p => {
        const date = new Date(p.created_at);
        const key = months[date.getMonth()];
        if (key in groupedData) groupedData[key].posts++;
      });

      comments?.forEach(c => {
        const date = new Date(c.created_at!);
        const key = months[date.getMonth()];
        if (key in groupedData) groupedData[key].comments++;
      });

      likes?.forEach(l => {
        const date = new Date(l.created_at!);
        const key = months[date.getMonth()];
        if (key in groupedData) groupedData[key].likes++;
      });
    }

    setCommunityEngagement(
      Object.entries(groupedData).map(([period, data]) => ({
        period,
        ...data
      }))
    );
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
      .limit(3);

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
      .limit(3);

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

    // Recent certificates
    const { data: recentCerts } = await supabase
      .from("certificates")
      .select("id, student_name, course_title, issued_at")
      .order("issued_at", { ascending: false })
      .limit(2);

    if (recentCerts) {
      recentCerts.forEach(c => {
        activities.push({
          id: c.id,
          type: 'certificate',
          description: `Certificado emitido: ${c.course_title}`,
          date: c.issued_at,
          userName: c.student_name
        });
      });
    }

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivities(activities.slice(0, 8));
  };

  const fetchAllLeads = async () => {
    const { data } = await supabase
      .from("leads")
      .select("id, status")
      .order("created_at", { ascending: false });
    
    if (data) {
      setAllLeads(data);
    }
  };

  // Health Status
  const healthStatus = useMemo(() => {
    const score = 
      (stats.conversionRate >= 10 ? 30 : stats.conversionRate >= 5 ? 15 : 0) +
      (stats.completionRate >= 50 ? 30 : stats.completionRate >= 25 ? 15 : 0) +
      (stats.growthRate >= 0 ? 20 : 0) +
      (stats.totalStudents >= 10 ? 20 : stats.totalStudents >= 5 ? 10 : 0);

    if (score >= 70) return { label: 'Saudável', color: 'text-emerald-600 bg-emerald-100', icon: '🟢' };
    if (score >= 40) return { label: 'Atenção', color: 'text-amber-600 bg-amber-100', icon: '🟡' };
    return { label: 'Crítico', color: 'text-red-600 bg-red-100', icon: '🔴' };
  }, [stats]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserCheck className="w-4 h-4" />;
      case 'lead': return <Target className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'certificate': return <Award className="w-4 h-4" />;
      case 'community': return <MessageSquare className="w-4 h-4" />;
      case 'badge': return <Trophy className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': return 'bg-violet-100 text-violet-600';
      case 'lead': return 'bg-pink-100 text-pink-600';
      case 'course': return 'bg-blue-100 text-blue-600';
      case 'certificate': return 'bg-emerald-100 text-emerald-600';
      case 'community': return 'bg-amber-100 text-amber-600';
      case 'badge': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <AdminLayout>
      <div className="p-3 lg:p-6 admin-area space-y-6">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-secondary/20 p-4 lg:p-6"
        >
          <div className="absolute inset-0 bg-[url('/src/assets/brand/pattern-gold.png')] bg-repeat opacity-5" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl -translate-y-24 translate-x-24" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-6 h-6 text-secondary" />
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Dashboard Premium
                </h1>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                Visão completa do seu ecossistema de cursos, alunos e comunidade
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm",
                  healthStatus.color
                )}
              >
                <span>{healthStatus.icon}</span>
                <span>Status: {healthStatus.label}</span>
              </motion.div>
              
              <div className="text-right text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                <p>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Grid - 12 Premium Cards */}
        <div>
          <SectionHeader title="Visão Geral" icon={Sparkles} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
                >
                  <StatsCardSkeleton count={12} />
                </motion.div>
              ) : (
                <>
                  <PremiumStatCard
                    icon={BookOpen}
                    label="Cursos Ativos"
                    value={stats.totalCourses}
                    gradient="from-secondary to-secondary/70"
                    delay={0}
                    tooltip="Total de cursos publicados na plataforma"
                  />
                  <PremiumStatCard
                    icon={Users}
                    label="Alunos"
                    value={stats.totalStudents}
                    gradient="from-emerald-500 to-emerald-600"
                    delay={0.05}
                    tooltip="Total de alunos cadastrados (excluindo admins)"
                  />
                  <PremiumStatCard
                    icon={UserCheck}
                    label="Matrículas"
                    value={stats.totalEnrollments}
                    gradient="from-violet-500 to-violet-600"
                    delay={0.1}
                    tooltip="Total de matrículas realizadas"
                  />
                  <PremiumStatCard
                    icon={TrendingUp}
                    label="Novos (7d)"
                    value={stats.recentEnrollments}
                    trend={stats.growthRate}
                    trendUp={stats.growthRate >= 0}
                    gradient="from-amber-500 to-orange-500"
                    delay={0.15}
                    tooltip="Matrículas nos últimos 7 dias vs período anterior"
                  />
                  <PremiumStatCard
                    icon={Target}
                    label="Leads"
                    value={stats.totalLeads}
                    gradient="from-pink-500 to-rose-500"
                    delay={0.2}
                    tooltip="Total de leads capturados"
                  />
                  <PremiumStatCard
                    icon={Percent}
                    label="Conversão"
                    value={`${stats.conversionRate}%`}
                    gradient="from-teal-500 to-cyan-500"
                    delay={0.25}
                    tooltip="Taxa de conversão de leads para clientes"
                  />
                  <PremiumStatCard
                    icon={DollarSign}
                    label="Receita Total"
                    value={stats.totalRevenue}
                    gradient="from-green-500 to-emerald-600"
                    delay={0.3}
                    prefix="R$ "
                    tooltip="Receita total de conversões registradas"
                  />
                  <PremiumStatCard
                    icon={Award}
                    label="Certificados"
                    value={stats.totalCertificates}
                    gradient="from-indigo-500 to-blue-600"
                    delay={0.35}
                    tooltip="Total de certificados emitidos"
                  />
                  <PremiumStatCard
                    icon={MessageSquare}
                    label="Posts"
                    value={stats.totalCommunityPosts}
                    gradient="from-fuchsia-500 to-pink-500"
                    delay={0.4}
                    tooltip="Total de posts na comunidade"
                  />
                  <PremiumStatCard
                    icon={Zap}
                    label="XP Total"
                    value={stats.totalXP}
                    gradient="from-yellow-500 to-amber-500"
                    delay={0.45}
                    tooltip="Total de XP gerado pelos alunos"
                  />
                  <PremiumStatCard
                    icon={Trophy}
                    label="Badges"
                    value={stats.earnedBadgesCount}
                    gradient="from-purple-500 to-violet-600"
                    delay={0.5}
                    tooltip="Total de badges conquistados"
                  />
                  <PremiumStatCard
                    icon={FileText}
                    label="Blog Posts"
                    value={stats.publishedBlogPosts}
                    gradient="from-slate-500 to-slate-600"
                    delay={0.55}
                    tooltip="Posts do blog publicados"
                  />
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Growth Section */}
        <div>
          <SectionHeader title="Crescimento" icon={TrendingUp} iconColor="text-emerald-500" />
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Enrollment Trends */}
            <ChartCard
              title="Evolução de Matrículas"
              icon={BarChart3}
              period={enrollmentPeriod}
              onPeriodChange={setEnrollmentPeriod}
              delay={0.3}
            >
              <div className="h-52">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <ChartSkeleton height={256} />
                  ) : enrollmentTrends.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={enrollmentTrends}>
                          <defs>
                            <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="enrollments" 
                            stroke="hsl(var(--secondary))" 
                            strokeWidth={3}
                            fill="url(#colorEnrollments)"
                            name="Matrículas"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sem dados de matrículas
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ChartCard>

            {/* Leads Funnel */}
            <ChartCard
              title="Leads por Status"
              icon={Target}
              iconColor="text-pink-500"
              period={leadsPeriod}
              onPeriodChange={setLeadsPeriod}
              delay={0.4}
            >
              <div className="h-52">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <PieChartSkeleton size={150} />
                    </div>
                  ) : leadsByStatus.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leadsByStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
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
                              border: '1px solid hsl(var(--border))',
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
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sem leads no período
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Engagement Section */}
        <div>
          <SectionHeader title="Engajamento" icon={Heart} iconColor="text-rose-500" />
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Community Engagement Chart */}
            <ChartCard
              title="Engajamento da Comunidade"
              icon={MessageSquare}
              iconColor="text-fuchsia-500"
              period={communityPeriod}
              onPeriodChange={setCommunityPeriod}
              delay={0.45}
            >
              <div className="h-52">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <ChartSkeleton height={208} />
                  ) : communityEngagement.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={communityEngagement}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px'
                            }}
                          />
                          <Legend 
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                          />
                          <Bar dataKey="posts" name="Posts" fill="#d946ef" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="comments" name="Comentários" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="likes" name="Likes" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sem dados de engajamento
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ChartCard>

            {/* Top Students - Gamification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    Top 5 Alunos (XP)
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                          </div>
                          <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : topStudents.length > 0 ? (
                    topStudents.map((student, index) => (
                      <motion.div
                        key={student.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-slate-100 text-slate-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {student.full_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Nível {student.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {student.streak_days}d
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-0">
                          {student.xp.toLocaleString()} XP
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhum aluno com XP ainda
                    </div>
                  )}
                  
                  {/* Summary Stats */}
                  <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">{stats.avgStreak}d</p>
                      <p className="text-xs text-muted-foreground">Média Streak</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">{stats.earnedBadgesCount}</p>
                      <p className="text-xs text-muted-foreground">Badges Ganhos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                    <Activity className="w-4 h-4 text-violet-500" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  {loading ? (
                    <ActivityTimelineSkeleton count={6} />
                  ) : recentActivities.length > 0 ? (
                    recentActivities.slice(0, 6).map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + index * 0.08 }}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          getActivityColor(activity.type)
                        )}>
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
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimeAgo(activity.date)}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhuma atividade recente
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Performance Section */}
        <div>
          <SectionHeader title="Performance" icon={GraduationCap} iconColor="text-indigo-500" />
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Student Progress */}
            <ChartCard
              title="Top 5 Alunos Mais Ativos"
              icon={GraduationCap}
              iconColor="text-emerald-500"
              period={progressPeriod}
              onPeriodChange={setProgressPeriod}
              delay={0.6}
            >
              <div className="h-64">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <ChartSkeleton height={256} />
                  ) : studentProgress.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studentProgress} layout="vertical" barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
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
                              border: '1px solid hsl(var(--border))',
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
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Sem dados de progresso
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ChartCard>

            {/* Lead Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <LeadFunnelChart leads={allLeads} />
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="relative overflow-hidden border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Zap className="w-4 h-4 text-amber-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { to: "/admin/courses", icon: BookOpen, label: "Cursos", color: "from-secondary to-secondary/70" },
                  { to: "/admin/students", icon: Users, label: "Alunos", color: "from-emerald-500 to-emerald-600" },
                  { to: "/admin/leads", icon: Target, label: "Leads", color: "from-pink-500 to-rose-500" },
                  { to: "/admin/enrollments", icon: UserCheck, label: "Matrículas", color: "from-violet-500 to-violet-600" },
                  { to: "/admin/community", icon: MessageSquare, label: "Comunidade", color: "from-fuchsia-500 to-pink-500" },
                  { to: "/admin/blog", icon: FileText, label: "Blog", color: "from-slate-500 to-slate-600" },
                ].map((action, index) => (
                  <motion.div
                    key={action.to}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                  >
                    <Link
                      to={action.to}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-secondary/40 hover:shadow-md transition-all duration-300 group bg-background/50"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                        `bg-gradient-to-br ${action.color}`
                      )}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Modals */}
      <TagManager open={showTagManager} onOpenChange={setShowTagManager} />
      <WidgetSelector
        open={showWidgetSelector}
        onOpenChange={setShowWidgetSelector}
        selectedWidgets={layout}
        onSave={saveLayout}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
