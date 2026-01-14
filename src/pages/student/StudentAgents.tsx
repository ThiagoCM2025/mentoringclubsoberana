import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PremiumBackground } from "@/components/ui/premium-background";
import { AgentVisualCard } from "@/components/student/AgentVisualCard";
import { AgentAccessModal } from "@/components/student/AgentAccessModal";
import { MobileBottomNav } from "@/components/student/MobileBottomNav";
import agentHeroImage from "@/assets/agents/agent-hero.png";
import {
  Bot,
  Search,
  Sparkles,
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
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";

interface AgentCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  display_order: number;
}

interface Agent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  full_description: string | null;
  objective: string | null;
  icon: string;
  thumbnail_url: string | null;
  external_url: string;
  is_featured: boolean;
  category_id: string | null;
  category?: AgentCategory;
  has_access?: boolean;
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function StudentAgents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [userAccess, setUserAccess] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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

      // Fetch published agents
      const { data: agentsData } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("is_published", true)
        .is("deleted_at", null)
        .order("display_order");

      if (agentsData) {
        // Map categories to agents
        const agentsWithCategories = agentsData.map((agent) => ({
          ...agent,
          category: categoriesData?.find((c) => c.id === agent.category_id),
        }));
        setAgents(agentsWithCategories);
      }

      // Fetch user access
      if (user) {
        const { data: accessData } = await supabase
          .from("ai_agent_access")
          .select("agent_id")
          .eq("user_id", user.id);

        if (accessData) {
          setUserAccess(new Set(accessData.map((a) => a.agent_id)));
        }
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredAgents = filteredAgents.filter((a) => a.is_featured);
  
  const agentsByCategory = categories
    .map((category) => ({
      category,
      agents: filteredAgents.filter((a) => a.category_id === category.id),
    }))
    .filter((group) => group.agents.length > 0);

  const totalAgents = agents.length;
  const accessibleAgents = agents.filter((a) => userAccess.has(a.id)).length;

  return (
    <div className="min-h-screen bg-zinc-900 pb-20 lg:pb-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(166,144,97,0.08)_0%,transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-secondary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/student")}
                className="text-cream/70 hover:text-cream"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <Bot className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-cream">
                    Assistentes Soberanas
                  </h1>
                  <p className="text-cream/60 text-sm">
                    Seus agentes de IA especializados
                  </p>
                </div>
              </div>
            </div>
            <img
              src={isotipoGold}
              alt="Soberana"
              className="w-10 h-10 hidden sm:block"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section with Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border border-secondary/20"
        >
          <div className="relative h-48 sm:h-64 md:h-80">
            <img
              src={agentHeroImage}
              alt="Assistentes Soberanas"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-secondary text-zinc-900 border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA Exclusiva
                </Badge>
                <Badge className="bg-emerald-500/90 text-white border-0">
                  {accessibleAgents} Liberados
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-cream mb-2">
                Central de Agentes
              </h2>
              <p className="text-cream/70 text-sm md:text-base max-w-lg">
                Seus assistentes de IA especializados para potencializar sua advocacia imobiliária
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <Input
            placeholder="Buscar assistentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 focus:border-secondary"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Bot className="w-8 h-8 text-secondary animate-pulse" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bot className="w-12 h-12 text-cream/30 mb-4" />
            <p className="text-cream/60">Nenhum assistente encontrado</p>
          </div>
        ) : (
          <>
            {/* Featured Agents */}
            {featuredAgents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h2 className="text-lg font-semibold text-cream">Destaques</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredAgents.map((agent) => (
                    <AgentVisualCard
                      key={agent.id}
                      agent={agent}
                      hasAccess={userAccess.has(agent.id)}
                      onClick={() => setSelectedAgent(agent)}
                    />
                ))}
                </div>
              </section>
            )}

            {/* Agents by Category */}
            {agentsByCategory.map(({ category, agents: categoryAgents }) => {
              const CategoryIcon = iconMap[category.icon] || Bot;
              return (
                <section key={category.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <CategoryIcon className="w-5 h-5 text-secondary" />
                    <h2 className="text-lg font-semibold text-cream">
                      {category.name}
                    </h2>
                    <Badge variant="outline" className="text-cream/60 border-cream/20 text-xs">
                      {categoryAgents.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAgents.map((agent) => (
                      <AgentVisualCard
                        key={agent.id}
                        agent={agent}
                        hasAccess={userAccess.has(agent.id)}
                        onClick={() => setSelectedAgent(agent)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>

      {/* Agent Access Modal */}
      {selectedAgent && (
        <AgentAccessModal
          agent={selectedAgent}
          hasAccess={userAccess.has(selectedAgent.id)}
          onClose={() => setSelectedAgent(null)}
          iconMap={iconMap}
        />
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
