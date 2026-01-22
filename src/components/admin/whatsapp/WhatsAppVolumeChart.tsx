import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { getBrazilNow, getBrazilToday, formatBrazilDateISO } from "@/lib/dateUtils";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

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
        
        // Usar horário de Brasília para calcular a data de início
        const startDate = getBrazilToday();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        const { data: messages } = await supabase
          .from("whatsapp_messages")
          .select("direction, created_at")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        // Group by date - inicializar todos os dias no horário de Brasília
        const grouped: Record<string, { enviadas: number; recebidas: number }> = {};
        
        // Initialize all days using Brazil timezone
        for (let i = 0; i < days; i++) {
          const d = getBrazilToday();
          d.setDate(d.getDate() - (days - 1 - i));
          const dateKey = formatBrazilDateISO(d);
          grouped[dateKey] = { enviadas: 0, recebidas: 0 };
        }

        // Count messages - converter cada mensagem para o timezone de Brasília
        messages?.forEach((msg) => {
          // Converter created_at para data no formato yyyy-MM-dd em Brasília
          const msgDate = new Date(msg.created_at);
          const brazilDateStr = msgDate.toLocaleDateString('en-CA', { 
            timeZone: 'America/Sao_Paulo' 
          }); // en-CA dá formato yyyy-MM-dd
          
          if (grouped[brazilDateStr]) {
            if (msg.direction === "outgoing") {
              grouped[brazilDateStr].enviadas++;
            } else {
              grouped[brazilDateStr].recebidas++;
            }
          }
        });

        // Convert to array with formatted display dates
        const chartData = Object.entries(grouped).map(([date, counts]) => ({
          date: format(new Date(date + "T12:00:00"), "dd/MM", { locale: ptBR }),
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
