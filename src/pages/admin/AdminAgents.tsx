import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  Bot,
  ExternalLink,
  RotateCcw,
  Trash,
  Brain,
  PenTool,
  TrendingUp,
  Target,
  Scale,
  Clock,
  Megaphone,
  FileText,
  BookOpen,
  Building,
  FileCheck,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface Agent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  external_url: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  deleted_at: string | null;
  category_id: string | null;
  category?: AgentCategory;
  access_count?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  PenTool,
  TrendingUp,
  Target,
  Scale,
  Clock,
  Megaphone,
  FileText,
  BookOpen,
  Building,
  FileCheck,
  Bot,
  Sparkles,
};

const categoryColors: Record<string, string> = {
  purple: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  amber: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  green: "bg-green-500/20 text-green-600 border-green-500/30",
  blue: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  rose: "bg-rose-500/20 text-rose-600 border-rose-500/30",
  orange: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-600 border-pink-500/30",
  yellow: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
};

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [showDeleted]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("ai_agent_categories")
        .select("*")
        .order("display_order");

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch agents
      let query = supabase
        .from("ai_agents")
        .select("*")
        .order("display_order");

      if (showDeleted) {
        query = query.not("deleted_at", "is", null);
      } else {
        query = query.is("deleted_at", null);
      }

      const { data: agentsData, error } = await query;

      if (error) throw error;

      // Map categories to agents
      const agentsWithCategories = (agentsData || []).map((agent) => ({
        ...agent,
        category: categoriesData?.find((c) => c.id === agent.category_id),
      }));

      setAgents(agentsWithCategories);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar agentes",
        description: "Não foi possível carregar a lista de agentes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({ is_published: !agent.is_published })
        .eq("id", agent.id);

      if (error) throw error;

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, is_published: !a.is_published } : a
        )
      );

      toast({
        title: agent.is_published ? "Agente despublicado" : "Agente publicado",
        description: `O agente "${agent.title}" foi ${
          agent.is_published ? "despublicado" : "publicado"
        } com sucesso.`,
      });
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status do agente.",
      });
    }
  };

  const moveToBin = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", agent.id);

      if (error) throw error;

      setAgents((prev) => prev.filter((a) => a.id !== agent.id));

      toast({
        title: "Agente movido para lixeira",
        description: `O agente "${agent.title}" foi movido para a lixeira.`,
      });
    } catch (error) {
      console.error("Error moving to bin:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível mover o agente para a lixeira.",
      });
    }
  };

  const restoreAgent = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({ deleted_at: null })
        .eq("id", agent.id);

      if (error) throw error;

      setAgents((prev) => prev.filter((a) => a.id !== agent.id));

      toast({
        title: "Agente restaurado",
        description: `O agente "${agent.title}" foi restaurado com sucesso.`,
      });
    } catch (error) {
      console.error("Error restoring agent:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível restaurar o agente.",
      });
    }
  };

  const permanentlyDelete = async (agent: Agent) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente "${agent.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("ai_agents")
        .delete()
        .eq("id", agent.id);

      if (error) throw error;

      setAgents((prev) => prev.filter((a) => a.id !== agent.id));

      toast({
        title: "Agente excluído",
        description: `O agente "${agent.title}" foi excluído permanentemente.`,
      });
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o agente.",
      });
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Bot;
    return IconComponent;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Bot className="w-7 h-7 text-secondary" />
              Agentes de IA
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os assistentes de IA da plataforma
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/agents/new")}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agente
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
              id="show-deleted"
            />
            <label htmlFor="show-deleted" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1">
              <Trash className="w-4 h-4" />
              Lixeira
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50%]">Agente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Bot className="w-5 h-5 animate-pulse" />
                      Carregando agentes...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Bot className="w-8 h-8 opacity-50" />
                      <p>{showDeleted ? "Nenhum agente na lixeira" : "Nenhum agente encontrado"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => {
                  const IconComponent = getCategoryIcon(agent.icon);
                  return (
                    <TableRow key={agent.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                            <IconComponent className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground flex items-center gap-2">
                              {agent.title}
                              {agent.is_featured && (
                                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                              )}
                            </p>
                            {agent.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                                {agent.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.category ? (
                          <Badge
                            variant="outline"
                            className={categoryColors[agent.category.color] || ""}
                          >
                            {agent.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {showDeleted ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                            Excluído
                          </Badge>
                        ) : agent.is_published ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                            Publicado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Rascunho
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {showDeleted ? (
                              <>
                                <DropdownMenuItem onClick={() => restoreAgent(agent)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Restaurar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => permanentlyDelete(agent)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir Permanentemente
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/admin/agents/${agent.id}`)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={agent.external_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Abrir no ChatGPT
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => togglePublish(agent)}>
                                  {agent.is_published ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Despublicar
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Publicar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => moveToBin(agent)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Mover para Lixeira
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
}
