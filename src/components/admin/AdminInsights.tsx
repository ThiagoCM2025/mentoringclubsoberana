import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users,
  BookOpen,
  X,
  Lightbulb,
  Bell,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  insight_type: string;
  severity: string;
  title: string;
  description: string;
  metadata: any;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

const INSIGHT_ICONS: Record<string, typeof AlertTriangle> = {
  churn_risk: AlertTriangle,
  engagement_drop: TrendingDown,
  course_issue: BookOpen,
  growth: TrendingUp,
  user_milestone: Users
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/10 border-blue-500/30 text-blue-500",
  warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
  critical: "bg-red-500/10 border-red-500/30 text-red-500"
};

export function AdminInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    generateInsights();
  }, []);

  const fetchInsights = async () => {
    const { data } = await supabase
      .from("admin_insights")
      .select("*")
      .eq("is_dismissed", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setInsights(data);
    setLoading(false);
  };

  const generateInsights = async () => {
    // Check for students at risk of churning (no activity in 7+ days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: inactiveStudents } = await supabase
      .from("user_gamification")
      .select("user_id, last_activity_date")
      .lt("last_activity_date", sevenDaysAgo.toISOString().split('T')[0])
      .limit(10);

    if (inactiveStudents && inactiveStudents.length >= 5) {
      // Check if this insight already exists today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from("admin_insights")
        .select("id")
        .eq("insight_type", "churn_risk")
        .gte("created_at", today)
        .maybeSingle();

      if (!existing) {
        await supabase.from("admin_insights").insert({
          insight_type: "churn_risk",
          severity: "warning",
          title: `${inactiveStudents.length} alunas inativas`,
          description: `Há ${inactiveStudents.length} alunas que não acessam a plataforma há mais de 7 dias. Considere enviar uma mensagem de reengajamento.`,
          metadata: { count: inactiveStudents.length }
        });
      }
    }

    // Check for growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { count: recentEnrollments } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .gte("enrolled_at", thirtyDaysAgo.toISOString());

    const { count: previousEnrollments } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .gte("enrolled_at", sixtyDaysAgo.toISOString())
      .lt("enrolled_at", thirtyDaysAgo.toISOString());

    if (recentEnrollments && previousEnrollments && recentEnrollments > previousEnrollments * 1.2) {
      const growthRate = Math.round(((recentEnrollments - previousEnrollments) / previousEnrollments) * 100);
      
      const { data: existingGrowth } = await supabase
        .from("admin_insights")
        .select("id")
        .eq("insight_type", "growth")
        .gte("created_at", new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (!existingGrowth) {
        await supabase.from("admin_insights").insert({
          insight_type: "growth",
          severity: "info",
          title: `Crescimento de ${growthRate}% em matrículas`,
          description: `As matrículas cresceram ${growthRate}% nos últimos 30 dias comparado ao período anterior. Ótimo trabalho!`,
          metadata: { growthRate, recentEnrollments, previousEnrollments }
        });
      }
    }

    fetchInsights();
  };

  const dismissInsight = async (id: string) => {
    await supabase
      .from("admin_insights")
      .update({ is_dismissed: true })
      .eq("id", id);

    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("admin_insights")
      .update({ is_read: true })
      .eq("id", id);

    setInsights(prev => prev.map(i => 
      i.id === id ? { ...i, is_read: true } : i
    ));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-xl border border-border">
        <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Nenhum insight no momento</p>
        <p className="text-sm text-muted-foreground/70">Novos insights aparecerão aqui automaticamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-secondary" />
          Insights Inteligentes
        </h3>
        <Badge variant="secondary" className="bg-secondary/10 text-secondary">
          {insights.filter(i => !i.is_read).length} novos
        </Badge>
      </div>

      <AnimatePresence>
        {insights.map((insight, i) => {
          const Icon = INSIGHT_ICONS[insight.insight_type] || Bell;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "p-4 rounded-xl border transition-all relative",
                SEVERITY_COLORS[insight.severity],
                !insight.is_read && "ring-1 ring-secondary/50"
              )}
              onClick={() => !insight.is_read && markAsRead(insight.id)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  insight.severity === "critical" ? "bg-red-500/20" :
                  insight.severity === "warning" ? "bg-yellow-500/20" : "bg-blue-500/20"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                    {!insight.is_read && (
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(insight.created_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); dismissInsight(insight.id); }}
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
