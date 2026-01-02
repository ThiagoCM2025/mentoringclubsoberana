import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MousePointer2, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ClickHeatmapProps {
  startDate: Date;
}

interface ClickData {
  x_percent: number;
  y_px: number;
  element: string;
  page_height: number;
}

interface ElementClick {
  element: string;
  count: number;
}

const PAGE_OPTIONS = [
  { value: "/", label: "Home" },
  { value: "/experience-start", label: "Experience Start" },
  { value: "/operacao-regularizacao", label: "Operação Regularização" },
];

export const ClickHeatmap = ({ startDate }: ClickHeatmapProps) => {
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("/");
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [topElements, setTopElements] = useState<ElementClick[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: events, error } = await supabase
          .from("lead_events")
          .select("event_data, page_url")
          .eq("event_type", "click_position")
          .gte("created_at", startDate.toISOString());

        if (error) throw error;

        // Filter by selected page
        const filtered = events?.filter((e) => {
          try {
            const url = new URL(e.page_url);
            return url.pathname === selectedPage;
          } catch {
            return false;
          }
        }) || [];

        // Extract click data
        const clickData: ClickData[] = [];
        const elementCounts = new Map<string, number>();

        filtered.forEach((event) => {
          const data = event.event_data as unknown as ClickData | null;
          if (data && typeof data.x_percent === "number") {
            clickData.push(data);
            
            const element = data.element || "unknown";
            elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
          }
        });

        setClicks(clickData);

        // Sort elements by count
        const sortedElements: ElementClick[] = Array.from(elementCounts.entries())
          .map(([element, count]) => ({ element, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopElements(sortedElements);
      } catch (error) {
        console.error("Error fetching click data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, selectedPage]);

  // Draw heatmap
  useEffect(() => {
    if (!canvasRef.current || clicks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = "hsl(var(--card))";
    ctx.fillRect(0, 0, width, height);

    // Normalize Y positions
    const maxY = Math.max(...clicks.map(c => c.page_height || 1));
    
    // Create density map
    const gridSize = 20;
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    const density = Array(rows).fill(0).map(() => Array(cols).fill(0));

    clicks.forEach((click) => {
      const x = Math.floor((click.x_percent / 100) * width / gridSize);
      const y = Math.floor((click.y_px / maxY) * height / gridSize);
      
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        // Add to surrounding cells with gaussian falloff
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              density[ny][nx] += Math.exp(-dist * 0.5);
            }
          }
        }
      }
    });

    // Find max density
    const maxDensity = Math.max(...density.flat()) || 1;

    // Draw heatmap
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = density[row][col] / maxDensity;
        if (value > 0.01) {
          // Color gradient: blue -> green -> yellow -> red
          let r, g, b;
          if (value < 0.25) {
            r = 0;
            g = Math.round(value * 4 * 255);
            b = 255;
          } else if (value < 0.5) {
            r = 0;
            g = 255;
            b = Math.round((1 - (value - 0.25) * 4) * 255);
          } else if (value < 0.75) {
            r = Math.round((value - 0.5) * 4 * 255);
            g = 255;
            b = 0;
          } else {
            r = 255;
            g = Math.round((1 - (value - 0.75) * 4) * 255);
            b = 0;
          }

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(value * 1.5, 0.7)})`;
          ctx.beginPath();
          ctx.arc(
            col * gridSize + gridSize / 2,
            row * gridSize + gridSize / 2,
            gridSize * 0.8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }, [clicks]);

  const exportToCSV = () => {
    const csv = [
      ["Elemento", "Cliques"],
      ...topElements.map((e) => [e.element, e.count.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `heatmap-${selectedPage.replace("/", "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MousePointer2 className="h-5 w-5 text-primary" />
              Heatmap de Cliques
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar página" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Carregando...</div>
            </div>
          ) : clicks.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Eye className="h-8 w-8 opacity-50" />
              <p>Nenhum clique registrado nesta página</p>
            </div>
          ) : (
            <>
              {/* Heatmap Canvas */}
              <div className="relative rounded-lg overflow-hidden border border-border/50">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[400px]"
                  style={{ background: "hsl(var(--muted))" }}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs bg-background/80 px-2 py-1 rounded">
                  <span className="text-muted-foreground">Intensidade:</span>
                  <div className="flex h-2 w-20 rounded overflow-hidden">
                    <div className="flex-1 bg-blue-500" />
                    <div className="flex-1 bg-green-500" />
                    <div className="flex-1 bg-yellow-500" />
                    <div className="flex-1 bg-red-500" />
                  </div>
                  <span className="text-muted-foreground">{clicks.length} cliques</span>
                </div>
              </div>

              {/* Top Elements Table */}
              <div>
                <h4 className="text-sm font-medium mb-3">Top Elementos Clicados</h4>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Elemento</TableHead>
                        <TableHead className="text-right w-[100px]">Cliques</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topElements.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-mono text-xs truncate max-w-[300px]">
                            {item.element}
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.count}</TableCell>
                        </TableRow>
                      ))}
                      {topElements.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Nenhum elemento rastreado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
