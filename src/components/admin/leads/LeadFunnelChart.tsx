import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

interface Lead {
  id: string;
  status: LeadStatus | null;
}

interface LeadFunnelChartProps {
  leads: Lead[];
}

const statusOrder: LeadStatus[] = ["new", "contacted", "negotiating", "converted", "lost"];

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "Novos", color: "#3B82F6" },
  contacted: { label: "Contactados", color: "#F97316" },
  negotiating: { label: "Em Tratativa", color: "#8B5CF6" },
  converted: { label: "Clientes", color: "#22C55E" },
  lost: { label: "Descartados", color: "#6B7280" },
};

export function LeadFunnelChart({ leads }: LeadFunnelChartProps) {
  const funnelData = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      negotiating: 0,
      converted: 0,
      lost: 0,
    };

    leads.forEach((lead) => {
      if (lead.status && counts[lead.status] !== undefined) {
        counts[lead.status]++;
      }
    });

    // Calcular funil progressivo (excluindo lost)
    const funnelStatuses: LeadStatus[] = ["new", "contacted", "negotiating", "converted"];
    let runningTotal = leads.length;

    return funnelStatuses.map((status, index) => {
      const count = counts[status];
      const percentage = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
      
      return {
        name: statusConfig[status].label,
        value: count,
        percentage,
        color: statusConfig[status].color,
        status,
      };
    });
  }, [leads]);

  const conversionRate = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter(l => l.status === "converted").length;
    return total > 0 ? ((converted / total) * 100).toFixed(1) : "0";
  }, [leads]);

  return (
    <Card className="admin-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Funil de Conversão</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Taxa de conversão</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 80, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                width={75}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number, name: string) => [
                  `${value} leads`,
                  name
                ]}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                barSize={28}
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="hsl(var(--foreground))"
                  fontSize={12}
                  formatter={(value: number) => `${value}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stages breakdown */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
          {funnelData.map((stage) => (
            <div key={stage.status} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: stage.color }}
              />
              <p className="text-lg font-semibold text-foreground">{stage.value}</p>
              <p className="text-xs text-muted-foreground">{stage.percentage}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
