import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

interface Lead {
  id: string;
  status: LeadStatus | null;
  created_at: string;
}

interface Conversion {
  id: string;
  lead_id: string;
  revenue: number | null;
  converted_at: string;
  product_name: string | null;
  course_id: string | null;
}

interface LeadMetricsProps {
  leads: Lead[];
}

export function LeadMetrics({ leads }: LeadMetricsProps) {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = async () => {
    const { data } = await supabase
      .from("lead_conversions")
      .select("*")
      .order("converted_at", { ascending: false });
    
    setConversions(data || []);
    setLoading(false);
  };

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.revenue || 0), 0);
  
  // Calcular tempo médio de conversão
  const avgConversionDays = conversions.length > 0 
    ? Math.round(
        conversions.reduce((sum, c) => {
          const lead = leads.find(l => l.id === c.lead_id);
          if (!lead) return sum;
          const days = Math.floor((new Date(c.converted_at).getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / conversions.length
      )
    : 0;

  const metrics = [
    {
      label: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Leads Convertidos",
      value: convertedLeads.toString(),
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Receita Total",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Tempo Médio Conv.",
      value: `${avgConversionDays} dias`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-stat-card p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-6 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="admin-stat-card p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
