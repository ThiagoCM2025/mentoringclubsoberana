import { useState, useEffect } from "react";
import { X, Search, MessageSquare, Mail, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    return preview.length > 120 ? preview.slice(0, 120) + "..." : preview;
  };

  // Shared content for both mobile and desktop
  const templateContent = (
    <>
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
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
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {search ? "Nenhum template encontrado" : "Nenhum template disponível"}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "p-3 cursor-pointer transition-all active:scale-[0.98]",
                  "hover:bg-muted/50 hover:border-primary/50"
                )}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    {getIcon(template.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {template.name}
                      </h4>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">
                        {template.target_audience === "leads" ? "Lead" : "Aluna"}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {template.description}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-muted-foreground/80 italic line-clamp-2">
                      "{previewMessage(template.whatsapp_message)}"
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );

  // Mobile: Use bottom sheet Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[75vh]">
          <DrawerHeader className="border-b border-border pb-3">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Templates de Mensagem
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            {templateContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Side drawer
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-card border-l border-border shadow-xl z-30 flex flex-col animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Templates</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {templateContent}

      {/* Footer hint */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Clique em um template para inserir
        </p>
      </div>
    </div>
  );
}
