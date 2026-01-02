import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TimeOnPageChartProps {
  startDate: Date;
}

interface PageTimeData {
  page: string;
  avg_time: number;
  sessions: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))"];

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

export const TimeOnPageChart = ({ startDate }: TimeOnPageChartProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageTimeData[]>([]);
  const [avgGlobal, setAvgGlobal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: events, error } = await supabase
          .from("lead_events")
          .select("page_url, event_data")
          .eq("event_type", "page_exit")
          .gte("created_at", startDate.toISOString());

        if (error) throw error;

        // Group by page and calculate averages
        const pageMap = new Map<string, { times: number[]; count: number }>();
        
        events?.forEach((event) => {
          try {
            const url = new URL(event.page_url);
            const path = url.pathname || "/";
            const eventData = event.event_data as { time_on_page_seconds?: number } | null;
            const time = eventData?.time_on_page_seconds || 0;
            
            if (time > 0 && time < 3600) { // Ignore unrealistic values
              const existing = pageMap.get(path) || { times: [], count: 0 };
              existing.times.push(time);
              existing.count++;
              pageMap.set(path, existing);
            }
          } catch {
            // Skip invalid URLs
          }
        });

        // Calculate averages and sort
        const pageData: PageTimeData[] = [];
        let totalTime = 0;
        let totalSessions = 0;

        pageMap.forEach((value, key) => {
          const avg = value.times.reduce((a, b) => a + b, 0) / value.times.length;
          pageData.push({
            page: key.length > 25 ? key.slice(0, 25) + "..." : key,
            avg_time: Math.round(avg),
            sessions: value.count,
          });
          totalTime += value.times.reduce((a, b) => a + b, 0);
          totalSessions += value.count;
        });

        pageData.sort((a, b) => b.avg_time - a.avg_time);
        setData(pageData.slice(0, 8));
        setAvgGlobal(totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0);
      } catch (error) {
        console.error("Error fetching time data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate]);

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Tempo Médio por Página
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Tempo Médio por Página
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Média Global: <span className="font-semibold text-foreground">{formatTime(avgGlobal)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground">
              Nenhum dado de tempo registrado ainda
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => formatTime(v)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="page" 
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatTime(value), "Tempo Médio"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="avg_time" radius={[0, 4, 4, 0]}>
                    {data.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={1 - index * 0.08}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
