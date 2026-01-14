import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Save,
  Bot,
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
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface AgentCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface AgentData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  full_description: string;
  objective: string;
  category_id: string | null;
  icon: string;
  thumbnail_url: string;
  external_url: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
}

const iconOptions = [
  { value: "Bot", label: "Robô", Icon: Bot },
  { value: "Brain", label: "Cérebro", Icon: Brain },
  { value: "PenTool", label: "Caneta", Icon: PenTool },
  { value: "TrendingUp", label: "Gráfico", Icon: TrendingUp },
  { value: "Target", label: "Alvo", Icon: Target },
  { value: "Scale", label: "Balança", Icon: Scale },
  { value: "Clock", label: "Relógio", Icon: Clock },
  { value: "Megaphone", label: "Megafone", Icon: Megaphone },
  { value: "FileText", label: "Documento", Icon: FileText },
  { value: "BookOpen", label: "Livro", Icon: BookOpen },
  { value: "Building", label: "Prédio", Icon: Building },
  { value: "FileCheck", label: "Documento OK", Icon: FileCheck },
  { value: "Sparkles", label: "Brilho", Icon: Sparkles },
];

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function AgentEditor() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = agentId === "new";

  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<AgentData>({
    title: "",
    slug: "",
    description: "",
    full_description: "",
    objective: "",
    category_id: null,
    icon: "Bot",
    thumbnail_url: "",
    external_url: "",
    is_published: false,
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchAgent();
    }
  }, [agentId]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("ai_agent_categories")
      .select("*")
      .order("display_order");

    if (data) {
      setCategories(data);
    }
  };

  const fetchAgent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("id", agentId)
        .single();

      if (error) throw error;

      setAgent({
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description || "",
        full_description: data.full_description || "",
        objective: data.objective || "",
        category_id: data.category_id,
        icon: data.icon || "Bot",
        thumbnail_url: data.thumbnail_url || "",
        external_url: data.external_url,
        is_published: data.is_published,
        is_featured: data.is_featured,
        display_order: data.display_order,
      });
    } catch (error) {
      console.error("Error fetching agent:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar agente",
        description: "Não foi possível carregar os dados do agente.",
      });
      navigate("/admin/agents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setAgent((prev) => ({
      ...prev,
      title: value,
      slug: isNew ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!agent.title.trim()) {
      toast({
        variant: "destructive",
        title: "Título obrigatório",
        description: "Por favor, informe o título do agente.",
      });
      return;
    }

    if (!agent.external_url.trim()) {
      toast({
        variant: "destructive",
        title: "URL obrigatória",
        description: "Por favor, informe a URL do ChatGPT.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const agentData = {
        title: agent.title.trim(),
        slug: agent.slug || generateSlug(agent.title),
        description: agent.description.trim() || null,
        full_description: agent.full_description.trim() || null,
        objective: agent.objective.trim() || null,
        category_id: agent.category_id || null,
        icon: agent.icon,
        thumbnail_url: agent.thumbnail_url.trim() || null,
        external_url: agent.external_url.trim(),
        is_published: agent.is_published,
        is_featured: agent.is_featured,
        display_order: agent.display_order,
      };

      if (isNew) {
        const { error } = await supabase.from("ai_agents").insert(agentData);
        if (error) throw error;
        toast({
          title: "Agente criado",
          description: "O agente foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("ai_agents")
          .update(agentData)
          .eq("id", agentId);
        if (error) throw error;
        toast({
          title: "Agente salvo",
          description: "As alterações foram salvas com sucesso.",
        });
      }

      navigate("/admin/agents");
    } catch (error) {
      console.error("Error saving agent:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o agente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const SelectedIcon = iconOptions.find((i) => i.value === agent.icon)?.Icon || Bot;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/agents")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {isNew ? "Novo Agente" : "Editar Agente"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isNew
                  ? "Configure um novo assistente de IA"
                  : `Editando: ${agent.title}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {agent.external_url && (
              <Button
                variant="outline"
                asChild
              >
                <a href={agent.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Testar no ChatGPT
                </a>
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                    <CardDescription>
                      Dados principais do assistente de IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Assistente de Vendas"
                        value={agent.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        placeholder="assistente-de-vendas"
                        value={agent.slug}
                        onChange={(e) =>
                          setAgent((prev) => ({ ...prev, slug: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="external_url">URL do ChatGPT *</Label>
                      <Input
                        id="external_url"
                        placeholder="https://chatgpt.com/g/g-..."
                        value={agent.external_url}
                        onChange={(e) =>
                          setAgent((prev) => ({
                            ...prev,
                            external_url: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição Curta</Label>
                      <Textarea
                        id="description"
                        placeholder="Uma breve descrição do agente (exibida no card)"
                        value={agent.description}
                        onChange={(e) =>
                          setAgent((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objective">Objetivo Principal</Label>
                      <Textarea
                        id="objective"
                        placeholder="Qual o objetivo principal deste agente?"
                        value={agent.objective}
                        onChange={(e) =>
                          setAgent((prev) => ({
                            ...prev,
                            objective: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_description">Descrição Completa</Label>
                      <Textarea
                        id="full_description"
                        placeholder="Descrição detalhada com instruções de uso..."
                        value={agent.full_description}
                        onChange={(e) =>
                          setAgent((prev) => ({
                            ...prev,
                            full_description: e.target.value,
                          }))
                        }
                        rows={5}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={agent.category_id || "none"}
                      onValueChange={(value) =>
                        setAgent((prev) => ({
                          ...prev,
                          category_id: value === "none" ? null : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Publicação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_published">Publicado</Label>
                      <Switch
                        id="is_published"
                        checked={agent.is_published}
                        onCheckedChange={(checked) =>
                          setAgent((prev) => ({ ...prev, is_published: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_featured" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        Destaque
                      </Label>
                      <Switch
                        id="is_featured"
                        checked={agent.is_featured}
                        onCheckedChange={(checked) =>
                          setAgent((prev) => ({ ...prev, is_featured: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ícone e Visual</CardTitle>
                <CardDescription>
                  Configure a aparência do agente nos cards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {iconOptions.map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setAgent((prev) => ({ ...prev, icon: value }))
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          agent.icon === value
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                        title={label}
                      >
                        <Icon className="w-5 h-5 mx-auto text-foreground" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">URL da Thumbnail (opcional)</Label>
                  <Input
                    id="thumbnail_url"
                    placeholder="https://..."
                    value={agent.thumbnail_url}
                    onChange={(e) =>
                      setAgent((prev) => ({
                        ...prev,
                        thumbnail_url: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Se não informada, será usado o ícone como visual principal
                  </p>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview do Card</Label>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-secondary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                        <SelectedIcon className="w-7 h-7 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {agent.title || "Nome do Agente"}
                        </p>
                        <p className="text-zinc-400 text-sm line-clamp-1">
                          {agent.description || "Descrição do agente..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ordem de Exibição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Posição na lista</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="0"
                    value={agent.display_order}
                    onChange={(e) =>
                      setAgent((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Números menores aparecem primeiro
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
