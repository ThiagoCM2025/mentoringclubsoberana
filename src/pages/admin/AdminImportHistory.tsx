import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileSpreadsheet, Users, RefreshCw, AlertCircle, Eye, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImportLog {
  id: string;
  batch_id: string;
  filename: string | null;
  total_rows: number | null;
  imported: number | null;
  updated: number | null;
  errors: number | null;
  error_details: any;
  created_at: string;
  admin_id: string | null;
}

const AdminImportHistory = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalImports: 0,
    totalImported: 0,
    totalUpdated: 0,
    totalErrors: 0,
  });

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("import_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLogs(data);
      
      // Calculate stats
      const totalImported = data.reduce((acc, log) => acc + (log.imported || 0), 0);
      const totalUpdated = data.reduce((acc, log) => acc + (log.updated || 0), 0);
      const totalErrors = data.reduce((acc, log) => acc + (log.errors || 0), 0);
      
      setStats({
        totalImports: data.length,
        totalImported,
        totalUpdated,
        totalErrors,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleViewLeads = (batchId: string) => {
    navigate(`/admin/leads?batch=${batchId}`);
  };

  const handleExportErrors = (log: ImportLog) => {
    if (!log.error_details) return;
    
    const errors = Array.isArray(log.error_details) ? log.error_details : [];
    if (errors.length === 0) return;

    const csvContent = [
      ["Linha", "Nome", "Email", "Telefone", "Erro"].join(","),
      ...errors.map((e: any) => 
        [e.row || "", e.name || "", e.email || "", e.phone || "", e.error || ""].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `erros_${log.filename || log.batch_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico de Importações</h1>
            <p className="text-muted-foreground">
              Acompanhe todas as importações de leads realizadas
            </p>
          </div>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Importações</p>
                  <p className="text-2xl font-bold">{stats.totalImports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leads Importados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalImported}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leads Atualizados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUpdated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Erros</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalErrors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Importações Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma importação realizada ainda</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Importados</TableHead>
                    <TableHead className="text-center">Atualizados</TableHead>
                    <TableHead className="text-center">Erros</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">
                            {log.filename || "Arquivo sem nome"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{log.total_rows || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          +{log.imported || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                          ↻{log.updated || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {(log.errors || 0) > 0 ? (
                          <Badge variant="destructive">{log.errors}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewLeads(log.batch_id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver leads
                          </Button>
                          {log.error_details && Array.isArray(log.error_details) && log.error_details.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportErrors(log)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Erros
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminImportHistory;
