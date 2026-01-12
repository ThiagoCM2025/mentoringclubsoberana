import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Search, Users, Flame, Thermometer, ThermometerSnowflake, Eye, Trash2, Mail, Zap, Clock, MessageCircle, Plus, Upload, Download, Columns, TableIcon, TrendingUp, FileText, History, Loader2, Send, Play, Pause } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";
import { NewLeadDialog } from "@/components/admin/NewLeadDialog";
import { LeadPipelineView } from "@/components/admin/leads/LeadPipelineView";
import { LeadScoreDisplay } from "@/components/admin/leads/LeadScoreDisplay";
import { LeadBehaviorTab } from "@/components/admin/leads/LeadBehaviorTab";
import { LeadNurturingTab } from "@/components/admin/leads/LeadNurturingTab";
import { LeadTemplatesTab } from "@/components/admin/leads/LeadTemplatesTab";
import { LeadHistoryTab } from "@/components/admin/leads/LeadHistoryTab";
import { CampaignSelector } from "@/components/admin/leads/CampaignSelector";
import { useNurturingSequences } from "@/hooks/useNurturingSequences";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus | null;
  temperature: LeadTemperature | null;
  score: number | null;
  behavior_score: number | null;
  notes: string | null;
  created_at: string;
  messages_sent: number | null;
  nurturing_step: number | null;
  nurturing_active: boolean | null;
  last_contact_at: string | null;
}

interface CommunicationHistory {
  id: string;
  channel: string;
  subject: string | null;
  message: string;
  status: string | null;
  sent_at: string;
}

const temperatureConfig = {
  cold: { label: "Frio", icon: ThermometerSnowflake, color: "bg-blue-100 text-blue-700" },
  warm: { label: "Morno", icon: Thermometer, color: "bg-yellow-100 text-yellow-700" },
  hot: { label: "Quente", icon: Flame, color: "bg-red-100 text-red-700" },
};

const statusConfig = {
  new: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contatado", color: "bg-purple-100 text-purple-700" },
  qualified: { label: "Qualificado", color: "bg-green-100 text-green-700" },
  converted: { label: "Convertido", color: "bg-emerald-100 text-emerald-700" },
  lost: { label: "Perdido", color: "bg-gray-100 text-gray-700" },
};

const getNurturingColor = (step: number) => {
  if (step === 0) return "bg-muted text-muted-foreground";
  if (step <= 1) return "bg-blue-100 text-blue-700";
  if (step <= 2) return "bg-yellow-100 text-yellow-700";
  if (step <= 3) return "bg-orange-100 text-orange-700";
  if (step <= 4) return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-700";
};

const AdminLeads = () => {
  const { toast } = useToast();
  const { getCampaignInfo, getSequenceInfo, calculateNextSend } = useNurturingSequences();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTemp, setFilterTemp] = useState<string>("all");
  const [filterNurturing, setFilterNurturing] = useState<string>("all");
  const [filterNurturingStep, setFilterNurturingStep] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newLeadDialogOpen, setNewLeadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [detailTab, setDetailTab] = useState<"info" | "behavior">("info");
  const [mainTab, setMainTab] = useState<"crm" | "automacao" | "templates" | "historico">("crm");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csvContent = [
      ["Nome", "Email", "Telefone", "Fonte", "Status", "Temperatura", "Score", "Notas", "Criado em"].join(","),
      ...leads.map(lead => [
        `"${lead.full_name}"`,
        lead.email,
        lead.phone || "",
        lead.source || "",
        lead.status || "",
        lead.temperature || "",
        lead.score || 0,
        `"${(lead.notes || "").replace(/"/g, '""')}"`,
        new Date(lead.created_at).toLocaleDateString("pt-BR")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "Leads exportados com sucesso!" });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    try {
      if (isExcel) {
        // Process Excel file
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        
        if (rows.length < 2) {
          toast({ title: "Planilha vazia", variant: "destructive" });
          setImporting(false);
          return;
        }

        // Detect columns by header name
        const headers = rows[0].map(h => String(h || "").toLowerCase());
        const nameCol = headers.findIndex(h => h.includes("nome"));
        const emailCol = headers.findIndex(h => h.includes("mail") || h.includes("e-mail"));
        const phoneCol = headers.findIndex(h => h.includes("whatsapp") || h.includes("telefone") || h.includes("celular"));
        
        if (nameCol === -1 || emailCol === -1) {
          toast({ 
            title: "Colunas não encontradas", 
            description: "A planilha precisa ter colunas com 'nome' e 'email' no cabeçalho",
            variant: "destructive" 
          });
          setImporting(false);
          return;
        }

        let imported = 0;
        let duplicates = 0;
        let errors = 0;
        let noEmail = 0;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const full_name = String(row[nameCol] || "").trim();
          const rawEmail = String(row[emailCol] || "").trim().toLowerCase();
          let phone = phoneCol !== -1 ? String(row[phoneCol] || "").replace(/['"]/g, "").trim() : null;
          
          // Normalize phone: keep only numbers
          if (phone) {
            phone = phone.replace(/\D/g, "");
            if (phone.length < 10) phone = null;
          }

          // Validate email format with regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const looksLikePhone = /^[\+\(\)\d\s\-]+$/.test(rawEmail);
          
          // Skip if no valid email or if it looks like a phone number
          if (!rawEmail || !emailRegex.test(rawEmail) || looksLikePhone) {
            if (full_name) {
              noEmail++;
              console.log(`Lead "${full_name}": e-mail inválido ou telefone detectado: "${rawEmail}"`);
            }
            continue;
          }
          
          const email = rawEmail;

          if (full_name) {
            // Use upsert RPC to avoid duplicates
            const { data, error } = await supabase.rpc('upsert_lead_and_return_id', {
              p_full_name: full_name,
              p_email: email,
              p_phone: phone,
              p_source: 'importação_excel'
            });
            
            if (error) {
              console.error("Import error:", error);
              errors++;
            } else {
              imported++;
            }
          }
        }

        const messages = [];
        if (imported > 0) messages.push(`${imported} importados`);
        if (noEmail > 0) messages.push(`${noEmail} ignorados (e-mail inválido)`);
        if (errors > 0) messages.push(`${errors} erros`);

        toast({
          title: "Importação concluída",
          description: messages.join(", ") || "Nenhum lead processado",
        });
        fetchLeads();
      } else {
        // Process CSV file (original logic)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          const lines = text.split("\n").slice(1);
          let imported = 0;
          let errors = 0;

          for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            const cleanParts = parts.map(p => p.replace(/^"|"$/g, "").trim());
            
            const [full_name, email, phone, source] = cleanParts;
            
            if (full_name && email) {
              const { error } = await supabase.from("leads").insert({
                full_name,
                email,
                phone: phone || null,
                source: source || "importação",
                status: "new" as LeadStatus,
                temperature: "cold" as LeadTemperature,
              });
              if (error) errors++;
              else imported++;
            }
          }

          toast({
            title: "Importação concluída",
            description: `${imported} leads importados, ${errors} erros`,
          });
          fetchLeads();
          setImporting(false);
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return; // Exit early, callback handles setImporting
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({ title: "Erro na importação", variant: "destructive" });
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLeads(data);
    if (error) console.error("Error fetching leads:", error);
    setLoading(false);
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const { error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      toast({ title: "Lead atualizado!" });
      fetchLeads();
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, ...updates });
      }
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Excluir este lead?")) return;

    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Lead excluído" });
      setDialogOpen(false);
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesTemp = filterTemp === "all" || lead.temperature === filterTemp;
    const matchesNurturing = filterNurturing === "all" || 
      (filterNurturing === "active" && lead.nurturing_active) || 
      (filterNurturing === "inactive" && !lead.nurturing_active);
    const matchesNurturingStep = filterNurturingStep === "all" || 
      String(lead.nurturing_step || 0) === filterNurturingStep;
    return matchesSearch && matchesStatus && matchesTemp && matchesNurturing && matchesNurturingStep;
  });

  const fetchCommunicationHistory = async (leadId: string) => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("communication_history")
      .select("id, channel, subject, message, status, sent_at")
      .eq("recipient_id", leadId)
      .order("sent_at", { ascending: false })
      .limit(10);
    
    setCommunicationHistory(data || []);
    setLoadingHistory(false);
  };

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
    fetchCommunicationHistory(lead.id);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="w-3 h-3" />;
      case "whatsapp": return <MessageCircle className="w-3 h-3" />;
      default: return <Mail className="w-3 h-3" />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-3 lg:p-6 admin-area">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground title-premium mb-1">
            CRM de Leads
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie leads, automação e comunicação em um só lugar
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="crm" className="text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="automacao" className="text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <History className="w-3.5 h-3.5 mr-1.5" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm" className="space-y-4">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "pipeline" | "table")}>
            <TabsList className="bg-muted border border-border">
              <TabsTrigger 
                value="pipeline" 
                className="text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <Columns className="w-3.5 h-3.5 mr-1.5" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger 
                value="table"
                className="text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                Tabela
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-xs text-muted-foreground">
            {leads.length} leads no total
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={() => setNewLeadDialogOpen(true)} className="h-8 text-sm gap-1.5 bg-secondary hover:bg-secondary/90 text-black btn-glow-gold">
            <Plus className="w-3.5 h-3.5" />
            Novo Lead
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="h-8 text-sm gap-1.5 bg-card border-border text-foreground hover:bg-muted"
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {importing ? "Importando..." : "Importar"}
          </Button>
          <Button onClick={handleExport} variant="outline" className="h-8 text-sm gap-1.5 bg-card border-border text-foreground hover:bg-muted">
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </Button>
          <Button 
            onClick={async () => {
              toast({ title: "Disparando nutrição...", description: "Aguarde o processamento" });
              try {
                const response = await supabase.functions.invoke('send-nurturing-email');
                if (response.error) throw response.error;
                toast({ 
                  title: "Nutrição disparada!", 
                  description: `${response.data?.emailsSent || 0} e-mails enviados`
                });
                fetchLeads();
              } catch (err) {
                console.error("Erro ao disparar nutrição:", err);
                toast({ title: "Erro ao disparar nutrição", variant: "destructive" });
              }
            }}
            variant="outline" 
            className="h-8 text-sm gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          >
            <Send className="w-3.5 h-3.5" />
            Disparar Nutrição
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 text-sm bg-card border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTemp} onValueChange={setFilterTemp}>
            <SelectTrigger className="w-[140px] h-9 text-sm bg-card border-border text-foreground">
              <SelectValue placeholder="Temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas temp.</SelectItem>
              {Object.entries(temperatureConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterNurturing} onValueChange={setFilterNurturing}>
            <SelectTrigger className="w-[130px] h-9 text-sm bg-card border-border text-foreground">
              <SelectValue placeholder="Nurturing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo nurturing</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterNurturingStep} onValueChange={setFilterNurturingStep}>
            <SelectTrigger className="w-[110px] h-9 text-sm bg-card border-border text-foreground">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas etapas</SelectItem>
              <SelectItem value="0">Etapa 0</SelectItem>
              <SelectItem value="1">Etapa 1</SelectItem>
              <SelectItem value="2">Etapa 2</SelectItem>
              <SelectItem value="3">Etapa 3</SelectItem>
              <SelectItem value="4">Etapa 4</SelectItem>
              <SelectItem value="5">Completo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pipeline View */}
        {viewMode === "pipeline" && (
          <LeadPipelineView leads={filteredLeads} onRefresh={fetchLeads} />
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="admin-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead>Lead</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Nurturing</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead>Temperatura</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum lead encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
                    const status = lead.status ? statusConfig[lead.status] : null;
                    const campaign = getCampaignInfo(lead.source);
                    const sequenceInfo = getSequenceInfo(lead.source, lead.nurturing_step || 0);
                    const nextSend = calculateNextSend(lead.source, lead.nurturing_step || 0, lead.last_contact_at);
                    
                    return (
                      <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openLeadDetails(lead)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium text-sm">
                                {lead.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{lead.full_name}</p>
                              <p className="text-xs text-muted-foreground">{lead.source || "Direto"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{lead.email}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone || "-"}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <CampaignSelector
                              leadId={lead.id}
                              currentSource={lead.source}
                              currentStep={lead.nurturing_step || 0}
                              onCampaignChange={fetchLeads}
                              variant="badge"
                            />
                            <span className="text-xs text-foreground">
                              Step {lead.nurturing_step || 0}/{sequenceInfo.maxStep}
                              {(lead.nurturing_step || 0) > 0 && (
                                <span className="text-muted-foreground"> • {sequenceInfo.currentName}</span>
                              )}
                            </span>
                            {lead.nurturing_active && nextSend && (
                              <span className={cn(
                                "text-[10px] flex items-center gap-1",
                                nextSend.isUrgent ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                              )}>
                                <Send className="w-2.5 h-2.5" />
                                {nextSend.text}
                              </span>
                            )}
                            {sequenceInfo.isComplete && (
                              <span className="text-[10px] text-green-600 dark:text-green-400">✓ Completa</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={lead.nurturing_active || false}
                            onCheckedChange={(checked) => {
                              updateLead(lead.id, { nurturing_active: checked });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          {temp && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${temp.color}`}>
                              <temp.icon className="w-3 h-3" />
                              {temp.label}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {status && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openLeadDetails(lead); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Lead Details Dialog - Fullscreen */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setCommunicationHistory([]); }}>
          <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] h-auto overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
              <DialogTitle className="text-lg font-semibold">Detalhes do Lead</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] overflow-hidden min-h-0">
                {/* Left Column - Fixed Lead Info */}
                <div className="border-r border-border p-6 overflow-y-auto bg-muted/30">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl text-primary font-bold">
                        {selectedLead.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold truncate">{selectedLead.full_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{selectedLead.email}</p>
                      {selectedLead.phone && <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-card rounded-lg border border-border mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xl font-bold text-foreground">
                        <Mail className="w-4 h-4 text-primary" />
                        {selectedLead.messages_sent || 0}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Msgs</p>
                    </div>
                    <div className="text-center">
                      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold", getNurturingColor(selectedLead.nurturing_step || 0))}>
                        <Zap className="w-3 h-3" />
                        {selectedLead.nurturing_step || 0}/{getSequenceInfo(selectedLead.source, selectedLead.nurturing_step || 0).maxStep}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Nurturing</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs font-medium text-foreground">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {selectedLead.last_contact_at 
                          ? formatDistanceToNow(new Date(selectedLead.last_contact_at), { addSuffix: false, locale: ptBR })
                          : "--"
                        }
                      </div>
                      <p className="text-[10px] text-muted-foreground">Último</p>
                    </div>
                  </div>

                  {/* Nurturing Status Card */}
                  {(() => {
                    const campaign = getCampaignInfo(selectedLead.source);
                    const sequenceInfo = getSequenceInfo(selectedLead.source, selectedLead.nurturing_step || 0);
                    const nextSend = calculateNextSend(selectedLead.source, selectedLead.nurturing_step || 0, selectedLead.last_contact_at);
                    
                    return (
                      <div className="p-4 bg-card rounded-lg border border-border mb-6">
                        <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
                          <Send className="w-4 h-4 text-primary" />
                          Status de Nutrição
                        </Label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Campanha</span>
                            <CampaignSelector
                              leadId={selectedLead.id}
                              currentSource={selectedLead.source}
                              currentStep={selectedLead.nurturing_step || 0}
                              onCampaignChange={() => {
                                fetchLeads();
                                // Refresh selected lead
                                const updatedLead = leads.find(l => l.id === selectedLead.id);
                                if (updatedLead) setSelectedLead(updatedLead);
                              }}
                              variant="badge"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Step atual</span>
                            <span className="text-sm font-medium">
                              {selectedLead.nurturing_step || 0} de {sequenceInfo.maxStep}
                              {(selectedLead.nurturing_step || 0) > 0 && ` (${sequenceInfo.currentName})`}
                            </span>
                          </div>
                          
                          {selectedLead.last_contact_at && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Último e-mail</span>
                              <span className="text-sm">
                                {format(new Date(selectedLead.last_contact_at), "dd/MM 'às' HH:mm")}
                              </span>
                            </div>
                          )}
                          
                          {selectedLead.nurturing_active && nextSend && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Próximo envio</span>
                              <span className={cn("text-sm font-medium", nextSend.isUrgent ? "text-amber-600" : "")}>
                                {nextSend.text} {nextSend.nextStepName && `(${nextSend.nextStepName})`}
                              </span>
                            </div>
                          )}
                          
                          {sequenceInfo.isComplete && (
                            <div className="text-center py-2 bg-green-50 dark:bg-green-900/20 rounded text-green-600 dark:text-green-400 text-sm font-medium">
                              ✓ Sequência completa
                            </div>
                          )}
                          
                          <Button
                            variant={selectedLead.nurturing_active ? "outline" : "default"}
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => updateLead(selectedLead.id, { nurturing_active: !selectedLead.nurturing_active })}
                          >
                            {selectedLead.nurturing_active ? (
                              <><Pause className="w-3.5 h-3.5 mr-1.5" /> Pausar Nurturing</>
                            ) : (
                              <><Play className="w-3.5 h-3.5 mr-1.5" /> Ativar Nurturing</>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Status & Temperature */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
                      <Select
                        value={selectedLead.status || "new"}
                        onValueChange={(value) => updateLead(selectedLead.id, { status: value as LeadStatus })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Temperatura</Label>
                      <Select
                        value={selectedLead.temperature || "cold"}
                        onValueChange={(value) => updateLead(selectedLead.id, { temperature: value as LeadTemperature })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(temperatureConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Source Info */}
                  <div className="border-t border-border pt-4 mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fonte</span>
                        <span className="font-medium">{selectedLead.source || "Desconhecida"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capturado</span>
                        <span className="font-medium">{format(new Date(selectedLead.created_at), "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <Label className="text-xs text-muted-foreground mb-2 block">Ações Rápidas</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="h-9 text-sm gap-1.5"
                        onClick={() => {
                          window.open(`mailto:${selectedLead.email}`, "_blank");
                        }}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-9 text-sm gap-1.5"
                        onClick={() => {
                          if (selectedLead.phone) {
                            const cleanPhone = selectedLead.phone.replace(/\D/g, "");
                            window.open(`https://wa.me/55${cleanPhone}`, "_blank");
                          }
                        }}
                        disabled={!selectedLead.phone}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => deleteLead(selectedLead.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Excluir Lead
                    </Button>
                  </div>
                </div>

                {/* Right Column - Scrollable Content */}
                <div className="flex flex-col overflow-hidden min-h-0">
                  <Tabs value={detailTab} onValueChange={(v) => setDetailTab(v as "info" | "behavior")} className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-2 shrink-0 mx-6 mt-4 max-w-md">
                      <TabsTrigger value="info">Informações</TabsTrigger>
                      <TabsTrigger value="behavior">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Comportamento
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-6">
                      {detailTab === "info" && (
                        <div className="space-y-6">
                          {/* Lead Engagement Score */}
                          <div className="bg-card rounded-lg border border-border p-4">
                            <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              Engajamento
                            </Label>
                            <LeadScoreDisplay leadId={selectedLead.id} score={selectedLead.score} />
                          </div>

                          {/* Notes */}
                          <div className="bg-card rounded-lg border border-border p-4">
                            <Label className="text-sm font-medium mb-3 block">Notas</Label>
                            <Textarea
                              placeholder="Adicione notas sobre este lead..."
                              value={selectedLead.notes || ""}
                              onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                              onBlur={() => updateLead(selectedLead.id, { notes: selectedLead.notes })}
                              rows={4}
                              className="resize-none"
                            />
                          </div>

                          {/* Communication History */}
                          <div className="bg-card rounded-lg border border-border p-4">
                            <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
                              <MessageCircle className="w-4 h-4 text-primary" />
                              Histórico de Comunicações
                            </Label>
                            {loadingHistory ? (
                              <p className="text-sm text-muted-foreground">Carregando...</p>
                            ) : communicationHistory.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nenhuma comunicação registrada</p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {communicationHistory.map((comm) => (
                                  <div key={comm.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                                    <div className="mt-0.5">{getChannelIcon(comm.channel)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium">{comm.subject || "Sem assunto"}</p>
                                      <p className="text-muted-foreground line-clamp-2 mt-0.5">{comm.message}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                      {format(new Date(comm.sent_at), "dd/MM HH:mm")}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {detailTab === "behavior" && (
                        <LeadBehaviorTab 
                          leadId={selectedLead.id} 
                          behaviorScore={selectedLead.behavior_score || 0} 
                        />
                      )}
                    </div>
                  </Tabs>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Lead Dialog */}
        <NewLeadDialog
          open={newLeadDialogOpen}
          onOpenChange={setNewLeadDialogOpen}
          onSuccess={fetchLeads}
        />
          </TabsContent>

          <TabsContent value="automacao">
            <LeadNurturingTab />
          </TabsContent>

          <TabsContent value="templates">
            <LeadTemplatesTab />
          </TabsContent>

          <TabsContent value="historico">
            <LeadHistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
