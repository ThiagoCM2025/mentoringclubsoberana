import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare, Users, UserCheck, Star, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string | null;
  whatsapp_message: string | null;
  target_audience: string;
  icon: string | null;
}

interface WhatsAppTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppTemplatesModal({ open, onOpenChange }: WhatsAppTemplatesModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("id, name, description, whatsapp_message, target_audience, icon")
        .eq("is_active", true)
        .not("whatsapp_message", "is", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (template: Template) => {
    if (!template.whatsapp_message) return;
    
    try {
      await navigator.clipboard.writeText(template.whatsapp_message);
      setCopiedId(template.id);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Erro ao copiar");
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "leads": return Users;
      case "students": return UserCheck;
      case "all": return Star;
      default: return MessageSquare;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "leads": return "Leads";
      case "students": return "Alunas";
      case "all": return "Todos";
      default: return audience;
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            Templates de WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-5 w-32 bg-muted rounded mb-2" />
                  <div className="h-4 w-48 bg-muted rounded mb-3" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {search ? "Nenhum template encontrado" : "Nenhum template disponível"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => {
                const AudienceIcon = getAudienceIcon(template.target_audience);
                const isCopied = copiedId === template.id;

                return (
                  <Card key={template.id} className="border-border hover:border-secondary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <AudienceIcon className="w-3 h-3" />
                            {getAudienceLabel(template.target_audience)}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(template)}
                          className="gap-1 shrink-0"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-500" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                      )}
                      
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground/80 whitespace-pre-wrap">
                        {template.whatsapp_message?.slice(0, 200)}
                        {(template.whatsapp_message?.length || 0) > 200 && "..."}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length} template(s) disponível(is)
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
