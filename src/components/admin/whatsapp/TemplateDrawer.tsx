import { useState, useEffect } from "react";
import { X, Search, MessageSquare, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  whatsapp_message: string | null;
  email_subject: string | null;
  email_body: string | null;
  target_audience: string;
}

interface TemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (message: string) => void;
  contactName?: string;
}

export function TemplateDrawer({
  isOpen,
  onClose,
  onSelectTemplate,
  contactName,
}: TemplateDrawerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("is_active", true)
        .not("whatsapp_message", "is", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const searchLower = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower) ||
      t.whatsapp_message?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectTemplate = (template: Template) => {
    let message = template.whatsapp_message || "";
    
    // Replace variables
    if (contactName) {
      message = message.replace(/\{\{nome\}\}/gi, contactName.split(" ")[0]);
      message = message.replace(/\{\{nome_completo\}\}/gi, contactName);
    }

    onSelectTemplate(message);
    onClose();
  };

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case "mail":
        return <Mail className="h-4 w-4" />;
      case "sparkles":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const previewMessage = (message: string | null) => {
    if (!message) return "";
    let preview = message;
    if (contactName) {
      preview = preview.replace(/\{\{nome\}\}/gi, contactName.split(" ")[0]);
      preview = preview.replace(/\{\{nome_completo\}\}/gi, contactName);
    }
    return preview.length > 150 ? preview.slice(0, 150) + "..." : preview;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-card border-l border-border shadow-xl z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Templates</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Templates list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3 mt-1" />
                </Card>
              ))}
            </>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {search ? "Nenhum template encontrado" : "Nenhum template disponível"}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/50"
                )}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    {getIcon(template.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {template.name}
                      </h4>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {template.target_audience === "leads" ? "Lead" : "Aluna"}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {template.description}
                      </p>
                    )}
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {previewMessage(template.whatsapp_message)}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Clique em um template para inserir na mensagem
        </p>
      </div>
    </div>
  );
}
