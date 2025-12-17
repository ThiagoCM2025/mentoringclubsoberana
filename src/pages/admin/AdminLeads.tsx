import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Search, Users, Flame, Thermometer, ThermometerSnowflake, Eye, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

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
  notes: string | null;
  created_at: string;
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

const AdminLeads = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTemp, setFilterTemp] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    return matchesSearch && matchesStatus && matchesTemp;
  });

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Leads
          </h1>
          <p className="text-muted-foreground">
            Gerencie os leads capturados pela landing page
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card-elegant p-4">
            <p className="text-2xl font-bold text-foreground">{leads.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="card-elegant p-4">
            <p className="text-2xl font-bold text-blue-600">
              {leads.filter((l) => l.status === "new").length}
            </p>
            <p className="text-sm text-muted-foreground">Novos</p>
          </div>
          <div className="card-elegant p-4">
            <p className="text-2xl font-bold text-red-600">
              {leads.filter((l) => l.temperature === "hot").length}
            </p>
            <p className="text-sm text-muted-foreground">Quentes</p>
          </div>
          <div className="card-elegant p-4">
            <p className="text-2xl font-bold text-green-600">
              {leads.filter((l) => l.status === "converted").length}
            </p>
            <p className="text-sm text-muted-foreground">Convertidos</p>
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
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
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
        </div>

        {/* Table */}
        <div className="card-elegant overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum lead encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const temp = lead.temperature ? temperatureConfig[lead.temperature] : null;
                  const status = lead.status ? statusConfig[lead.status] : null;
                  return (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openLeadDetails(lead)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {lead.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{lead.full_name}</p>
                            <p className="text-xs text-muted-foreground">{lead.source || "Direto"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{lead.email}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone || "-"}</p>
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
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openLeadDetails(lead); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Lead Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Lead</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl text-primary font-bold">
                      {selectedLead.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedLead.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                    {selectedLead.phone && <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedLead.status || "new"}
                      onValueChange={(value) => updateLead(selectedLead.id, { status: value as LeadStatus })}
                    >
                      <SelectTrigger>
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
                    <Label>Temperatura</Label>
                    <Select
                      value={selectedLead.temperature || "cold"}
                      onValueChange={(value) => updateLead(selectedLead.id, { temperature: value as LeadTemperature })}
                    >
                      <SelectTrigger>
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

                <div>
                  <Label>Notas</Label>
                  <Textarea
                    placeholder="Adicione notas sobre este lead..."
                    value={selectedLead.notes || ""}
                    onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                    onBlur={() => updateLead(selectedLead.id, { notes: selectedLead.notes })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Capturado em {new Date(selectedLead.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteLead(selectedLead.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminLeads;
