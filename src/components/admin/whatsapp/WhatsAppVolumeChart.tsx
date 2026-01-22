import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DayData {
  date: string;
  enviadas: number;
  recebidas: number;
}

export function WhatsAppVolumeChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const days = 7;
        const startDate = startOfDay(subDays(new Date(), days - 1));

        const { data: messages } = await supabase
          .from("whatsapp_messages")
          .select("direction, created_at")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        // Group by date
        const grouped: Record<string, { enviadas: number; recebidas: number }> = {};
        
        // Initialize all days
        for (let i = 0; i < days; i++) {
          const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
          grouped[date] = { enviadas: 0, recebidas: 0 };
        }

        // Count messages
        messages?.forEach((msg) => {
          const date = format(new Date(msg.created_at), "yyyy-MM-dd");
          if (grouped[date]) {
            if (msg.direction === "outgoing") {
              grouped[date].enviadas++;
            } else {
              grouped[date].recebidas++;
            }
          }
        });

        // Convert to array
        const chartData = Object.entries(grouped).map(([date, counts]) => ({
          date: format(new Date(date), "dd/MM", { locale: ptBR }),
          enviadas: counts.enviadas,
          recebidas: counts.recebidas,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Volume de Mensagens (7 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  dataKey="enviadas" 
                  name="Enviadas" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="recebidas" 
                  name="Recebidas" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
