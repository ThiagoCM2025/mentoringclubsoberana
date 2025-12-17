import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  TrendingUp,
  Eye,
  Clock
} from "lucide-react";

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  recentEnrollments: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    recentEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Total courses
    const { count: coursesCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    // Total students (users with student role)
    const { count: studentsCount } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

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

    setStats({
      totalCourses: coursesCount || 0,
      totalStudents: studentsCount || 0,
      totalEnrollments: enrollmentsCount || 0,
      recentEnrollments: recentCount || 0
    });
    setLoading(false);
  };

  const statCards = [
    { icon: BookOpen, label: "Cursos", value: stats.totalCourses, color: "bg-blue-500" },
    { icon: Users, label: "Alunos", value: stats.totalStudents, color: "bg-green-500" },
    { icon: UserCheck, label: "Matrículas", value: stats.totalEnrollments, color: "bg-purple-500" },
    { icon: TrendingUp, label: "Novos (7 dias)", value: stats.recentEnrollments, color: "bg-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do seu ecossistema de cursos
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-elegant p-6"
            >
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {loading ? "-" : stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <a href="/admin/courses/new" className="card-elegant p-6 hover:border-secondary/50 transition-colors group">
            <BookOpen className="w-8 h-8 text-secondary mb-3" />
            <h3 className="font-serif font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
              Criar Novo Curso
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione um novo curso à plataforma
            </p>
          </a>
          <a href="/admin/students" className="card-elegant p-6 hover:border-secondary/50 transition-colors group">
            <Users className="w-8 h-8 text-secondary mb-3" />
            <h3 className="font-serif font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
              Gerenciar Alunos
            </h3>
            <p className="text-sm text-muted-foreground">
              Veja e gerencie todos os alunos
            </p>
          </a>
          <a href="/admin/enrollments" className="card-elegant p-6 hover:border-secondary/50 transition-colors group">
            <UserCheck className="w-8 h-8 text-secondary mb-3" />
            <h3 className="font-serif font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
              Adicionar Matrícula
            </h3>
            <p className="text-sm text-muted-foreground">
              Matricule um aluno manualmente
            </p>
          </a>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;