import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Search, 
  Download, 
  RefreshCw, 
  FileDown, 
  Users, 
  MessageCircle, 
  CheckCircle,
  Flame,
  Pause,
  Zap,
  Mail,
  Phone,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EbookDownload {
  id: string;
  email: string;
  ebook_name: string;
  downloaded_at: string;
  lead_id: string | null;
  lead?: {
    id: string;
    full_name: string;
    phone: string | null;
    status: string | null;
    temperature: string | null;
    messages_sent: number | null;
    nurturing_step: number | null;
    nurturing_active: boolean | null;
    last_contact_at: string | null;
  } | null;
}

const getNurturingColor = (step: number) => {
  if (step === 0) return "bg-muted text-muted-foreground";
  if (step <= 1) return "bg-blue-100 text-blue-700";
  if (step <= 2) return "bg-yellow-100 text-yellow-700";
  if (step <= 3) return "bg-orange-100 text-orange-700";
  if (step <= 4) return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-700";
};

const statusConfig = {
  new: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contatado", color: "bg-purple-100 text-purple-700" },
  qualified: { label: "Qualificado", color: "bg-green-100 text-green-700" },
  converted: { label: "Convertido", color: "bg-emerald-100 text-emerald-700" },
  lost: { label: "Perdido", color: "bg-gray-100 text-gray-700" },
};

const AdminEbooks = () => {
  const { toast } = useToast();
  const [downloads, setDownloads] = useState<EbookDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterNurturing, setFilterNurturing] = useState<string>("all");

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    
    // Fetch ebook downloads with lead data
    const { data: ebookData, error } = await supabase
      .from("ebook_downloads")
      .select(`
        id,
        email,
        ebook_name,
        downloaded_at,
        lead_id
      `)
      .order("downloaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching downloads:", error);
      setLoading(false);
      return;
    }

    // Fetch leads data for each download - ONLY by lead_id, no email fallback
    if (ebookData) {
      // Get all lead_ids that are not null
      const leadIds = ebookData.map(d => d.lead_id).filter((id): id is string => id !== null);
      
      // Define lead type
      type LeadData = {
        id: string;
        full_name: string;
        email: string;
        phone: string | null;
        status: string | null;
        temperature: string | null;
        messages_sent: number | null;
        nurturing_step: number | null;
        nurturing_active: boolean | null;
        last_contact_at: string | null;
      };

      // Fetch leads ONLY by their IDs (no email fallback to avoid wrong associations)
      const leadsData: LeadData[] = [];
      if (leadIds.length > 0) {
        const { data } = await supabase
          .from("leads")
          .select("id, full_name, email, phone, status, temperature, messages_sent, nurturing_step, nurturing_active, last_contact_at")
          .in("id", leadIds);
        if (data) leadsData.push(...(data as LeadData[]));
      }

      // Create map by lead ID only
      const leadsById = new Map<string, LeadData>(leadsData.map(l => [l.id, l]));

      const enrichedDownloads: EbookDownload[] = ebookData.map(d => ({
        ...d,
        // ONLY use lead_id - no email fallback (prevents showing wrong names)
        lead: d.lead_id ? leadsById.get(d.lead_id) || null : null
      }));

      setDownloads(enrichedDownloads);
    }
    
    setLoading(false);
  };

  const deleteEbookDownload = async (downloadId: string, leadId: string | null) => {
    // Delete ebook download record
    const { error: downloadError } = await supabase
      .from("ebook_downloads")
      .delete()
      .eq("id", downloadId);

    if (downloadError) {
      toast({ title: "Erro ao excluir download", variant: "destructive" });
      return;
    }

    // Optionally delete associated lead if it exists
    if (leadId) {
      const { error: leadError } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (leadError) {
        toast({ 
          title: "Download excluído", 
          description: "Mas houve erro ao excluir o lead associado."
        });
      } else {
        toast({ title: "Download e lead excluídos com sucesso" });
      }
    } else {
      toast({ title: "Download excluído com sucesso" });
    }

    fetchDownloads();
  };

  const deleteDownloadOnly = async (downloadId: string) => {
    const { error } = await supabase
      .from("ebook_downloads")
      .delete()
      .eq("id", downloadId);

    if (error) {
      toast({ title: "Erro ao excluir download", variant: "destructive" });
    } else {
      toast({ title: "Download excluído com sucesso" });
      fetchDownloads();
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Nome", "Email", "Telefone", "E-book", "Nurturing", "Status", "Data"],
      ...downloads.map(d => [
        d.lead?.full_name || "-",
        d.email,
        d.lead?.phone || "-",
        d.ebook_name,
        `${d.lead?.nurturing_step || 0}/5`,
        d.lead?.status || "-",
        format(new Date(d.downloaded_at), "dd/MM/yyyy HH:mm")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ebook-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const filteredDownloads = downloads.filter((d) => {
    const matchesSearch =
      (d.lead?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.lead?.phone || "").includes(search);
    
    if (filterNurturing === "all") return matchesSearch;
    if (filterNurturing === "active") return matchesSearch && d.lead?.nurturing_active;
    if (filterNurturing === "paused") return matchesSearch && d.lead && !d.lead.nurturing_active;
    if (filterNurturing === "completed") return matchesSearch && (d.lead?.nurturing_step || 0) >= 5;
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: downloads.length,
    new: downloads.filter(d => d.lead?.status === "new").length,
    contacted: downloads.filter(d => d.lead?.status === "contacted").length,
    converted: downloads.filter(d => d.lead?.status === "converted").length,
    nurturingActive: downloads.filter(d => d.lead?.nurturing_active).length,
    paused: downloads.filter(d => d.lead && !d.lead.nurturing_active).length,
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground title-premium mb-2">
                📚 Leads E-book
              </h1>
              <p className="text-muted-foreground">
                Gestão dos downloads do e-book e sistema de nurturing
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="premium" size="sm" onClick={fetchDownloads}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="premium" size="sm" onClick={exportCSV}>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="admin-stat-card p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Downloads</p>
          </div>
          <div className="admin-stat-card p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.new}</p>
            <p className="text-xs text-muted-foreground">Novos</p>
          </div>
          <div className="admin-stat-card p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.contacted}</p>
            <p className="text-xs text-muted-foreground">Contatados</p>
          </div>
          <div className="admin-stat-card p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.converted}</p>
            <p className="text-xs text-muted-foreground">Convertidos</p>
          </div>
          <div className="admin-stat-card p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.nurturingActive}</p>
            <p className="text-xs text-muted-foreground">Nurturing Ativo</p>
          </div>
          <div className="admin-stat-card p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-400 flex items-center justify-center">
              <Pause className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.paused}</p>
            <p className="text-xs text-muted-foreground">Pausados</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 admin-input"
            />
          </div>
          <Select value={filterNurturing} onValueChange={setFilterNurturing}>
            <SelectTrigger className="w-[180px] admin-input">
              <SelectValue placeholder="Nurturing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Nurturing Ativo</SelectItem>
              <SelectItem value="paused">Pausados</SelectItem>
              <SelectItem value="completed">Concluídos (5/5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>E-book</TableHead>
                <TableHead className="text-center">Nurturing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredDownloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Download className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum download encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDownloads.map((download) => {
                  const nurturingStep = download.lead?.nurturing_step || 0;
                  const status = download.lead?.status 
                    ? statusConfig[download.lead.status as keyof typeof statusConfig] 
                    : null;

                  return (
                    <TableRow key={download.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            download.lead 
                              ? "bg-gradient-to-br from-secondary to-secondary-light" 
                              : "bg-muted"
                          }`}>
                            <span className={download.lead ? "text-black font-semibold" : "text-muted-foreground font-medium"}>
                              {download.lead?.full_name 
                                ? download.lead.full_name.charAt(0).toUpperCase() 
                                : "?"}
                            </span>
                          </div>
                          <div>
                            <p className={`font-medium ${download.lead ? "text-foreground" : "text-muted-foreground italic"}`}>
                              {download.lead?.full_name || "Sem lead vinculado"}
                            </p>
                            {download.lead?.messages_sent && download.lead.messages_sent > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {download.lead.messages_sent} mensagens
                              </p>
                            )}
                            {!download.lead && (
                              <p className="text-xs text-orange-500">lead_id não associado</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{download.email}</p>
                        {download.lead?.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {download.lead.phone}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground truncate max-w-[200px] block">
                          {download.ebook_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getNurturingColor(nurturingStep)}>
                          <Zap className="w-3 h-3 mr-1" />
                          {nurturingStep}/5
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(download.downloaded_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir registro</AlertDialogTitle>
                              <AlertDialogDescription>
                                {download.lead 
                                  ? "Deseja excluir apenas o download ou também o lead associado?"
                                  : "Tem certeza que deseja excluir este registro de download?"
                                }
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              {download.lead ? (
                                <>
                                  <AlertDialogAction
                                    onClick={() => deleteDownloadOnly(download.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Só o Download
                                  </AlertDialogAction>
                                  <AlertDialogAction
                                    onClick={() => deleteEbookDownload(download.id, download.lead?.id || null)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Download + Lead
                                  </AlertDialogAction>
                                </>
                              ) : (
                                <AlertDialogAction
                                  onClick={() => deleteDownloadOnly(download.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              )}
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEbooks;
