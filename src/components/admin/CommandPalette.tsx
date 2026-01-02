import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Target,
  Bell,
  Mail,
  Activity,
  FileText,
  ClipboardCheck,
  Search,
  UserPlus,
  GraduationCap,
  Send,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  type: "student" | "lead" | "course" | "post";
  title: string;
  subtitle?: string;
}

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", keywords: ["home", "início", "visão geral"] },
  { icon: BookOpen, label: "Cursos", href: "/admin/courses", keywords: ["programas", "aulas"] },
  { icon: FileText, label: "Blog", href: "/admin/blog", keywords: ["artigos", "posts", "conteúdo"] },
  { icon: Users, label: "Alunos", href: "/admin/students", keywords: ["estudantes", "alunas"] },
  { icon: UserCheck, label: "Matrículas", href: "/admin/enrollments", keywords: ["inscrições"] },
  { icon: Target, label: "Leads", href: "/admin/leads", keywords: ["prospectos", "contatos"] },
  { icon: BookOpen, label: "E-books", href: "/admin/ebooks", keywords: ["materiais", "downloads"] },
  { icon: ClipboardCheck, label: "Revisar Missões", href: "/admin/mission-reviews", keywords: ["tarefas", "avaliação"] },
  { icon: Mail, label: "Comunicação", href: "/admin/messaging", keywords: ["mensagens", "email"] },
  { icon: Activity, label: "Engajamento", href: "/admin/engagement", keywords: ["atividade", "métricas"] },
  { icon: Bell, label: "Notificações", href: "/admin/notifications", keywords: ["alertas", "avisos"] },
  { icon: Users, label: "Comunidade", href: "/admin/community", keywords: ["fórum", "discussões"] },
  { icon: BarChart3, label: "Relatórios", href: "/admin/reports", keywords: ["analytics", "dados"] },
  { icon: Settings, label: "Configurações", href: "/admin/settings", keywords: ["ajustes", "preferências"] },
];

const quickActions = [
  { icon: UserPlus, label: "Criar Nova Aluna", action: "create-student", keywords: ["adicionar", "cadastrar"] },
  { icon: Plus, label: "Criar Novo Lead", action: "create-lead", keywords: ["adicionar", "prospecto"] },
  { icon: GraduationCap, label: "Matricular Aluna", action: "enroll-student", keywords: ["inscrever"] },
  { icon: Send, label: "Enviar Notificação em Massa", action: "bulk-notification", keywords: ["comunicar"] },
  { icon: FileText, label: "Criar Post no Blog", action: "create-post", keywords: ["artigo", "novo"] },
];

interface CommandPaletteProps {
  onQuickAction?: (action: string) => void;
}

export const CommandPalette = ({ onQuickAction }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search entities
  const searchEntities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results: SearchResult[] = [];

      // Search students
      const { data: students } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .ilike("full_name", `%${query}%`)
        .limit(5);

      if (students) {
        students.forEach((s) => {
          results.push({
            id: s.user_id,
            type: "student",
            title: s.full_name || "Aluna sem nome",
            subtitle: "Aluna",
          });
        });
      }

      // Search leads
      const { data: leads } = await supabase
        .from("leads")
        .select("id, full_name, email")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (leads) {
        leads.forEach((l) => {
          results.push({
            id: l.id,
            type: "lead",
            title: l.full_name,
            subtitle: l.email,
          });
        });
      }

      // Search courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .ilike("title", `%${query}%`)
        .limit(5);

      if (courses) {
        courses.forEach((c) => {
          results.push({
            id: c.id,
            type: "course",
            title: c.title,
            subtitle: "Curso",
          });
        });
      }

      // Search blog posts
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, title")
        .ilike("title", `%${query}%`)
        .limit(5);

      if (posts) {
        posts.forEach((p) => {
          results.push({
            id: p.id,
            type: "post",
            title: p.title,
            subtitle: "Post do Blog",
          });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    searchEntities(debouncedSearch);
  }, [debouncedSearch, searchEntities]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setSearch("");
    navigate(href);
  };

  const handleQuickAction = (action: string) => {
    setOpen(false);
    setSearch("");
    
    if (action === "create-post") {
      navigate("/admin/blog/new");
      return;
    }
    
    onQuickAction?.(action);
  };

  const handleResultSelect = (result: SearchResult) => {
    setOpen(false);
    setSearch("");

    switch (result.type) {
      case "student":
        navigate(`/admin/students/${result.id}`);
        break;
      case "lead":
        navigate(`/admin/leads?highlight=${result.id}`);
        break;
      case "course":
        navigate(`/admin/courses/${result.id}`);
        break;
      case "post":
        navigate(`/admin/blog/${result.id}`);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "student":
        return Users;
      case "lead":
        return Target;
      case "course":
        return BookOpen;
      case "post":
        return FileText;
      default:
        return Search;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar alunos, leads, cursos, ou digitar comando..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <CommandGroup heading="Resultados da Busca">
            {searchResults.map((result) => {
              const Icon = getResultIcon(result.type);
              return (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.type}-${result.title}`}
                  onSelect={() => handleResultSelect(result)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Quick Actions */}
        {!search && (
          <>
            <CommandGroup heading="Ações Rápidas">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.action}
                  value={action.label}
                  onSelect={() => handleQuickAction(action.action)}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords.join(" ")}`}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
