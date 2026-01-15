import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScenarioCards } from "@/components/admin/messaging/ScenarioCards";
import { Mail, MessageCircle, Bell, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { replaceTrackingVariable } from "@/lib/trackingUtils";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  email_subject: string | null;
  email_body: string | null;
  whatsapp_message: string | null;
}

interface LeadMessageModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onMessageSent: () => void;
}

type Channel = "email" | "whatsapp" | "notification";

export function LeadMessageModal({ open, onClose, lead, onMessageSent }: LeadMessageModalProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedTemplate(null);
    setChannel("whatsapp");
    setSubject("");
    setMessage("");
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("message_templates")
      .select("*")
      .eq("target_audience", "lead")
      .eq("is_active", true)
      .order("display_order");
    
    setTemplates(data || []);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (channel === "email") {
      setSubject(template.email_subject || "");
      setMessage(template.email_body || "");
    } else {
      setSubject("");
      setMessage(template.whatsapp_message || template.email_body || "");
    }
  };

  const handleChannelChange = (newChannel: Channel) => {
    setChannel(newChannel);
    if (selectedTemplate) {
      if (newChannel === "email") {
        setSubject(selectedTemplate.email_subject || "");
        setMessage(selectedTemplate.email_body || "");
      } else {
        setSubject("");
        setMessage(selectedTemplate.whatsapp_message || selectedTemplate.email_body || "");
      }
    }
  };

  const replaceVariables = (text: string) => {
    if (!lead) return text;
    const firstName = lead.full_name.split(" ")[0];
    return text
      // Três chaves (legados)
      .replace(/\{\{\{nome\}\}\}/g, firstName)
      .replace(/\{\{\{nome_completo\}\}\}/g, lead.full_name)
      .replace(/\{\{\{email\}\}\}/g, lead.email)
      // Duas chaves (padrão)
      .replace(/\{\{nome\}\}/g, firstName)
      .replace(/\{\{nome_completo\}\}/g, lead.full_name)
      .replace(/\{\{email\}\}/g, lead.email)
      // Uma chave (legado)
      .replace(/\{nome\}/g, firstName)
      .replace(/\{nome_completo\}/g, lead.full_name)
      .replace(/\{email\}/g, lead.email);
  };

  const handleSend = async () => {
    if (!lead || !message.trim()) {
      toast({ title: "Digite uma mensagem", variant: "destructive" });
      return;
    }

    if (channel === "email" && !subject.trim()) {
      toast({ title: "Digite um assunto", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      // Primeiro substituir variáveis normais
      let finalMessage = replaceVariables(message);
      let finalSubject = replaceVariables(subject);
      
      // Depois substituir {{link_tracking}} se existir
      finalMessage = await replaceTrackingVariable(finalMessage, lead.id, "/");
      finalSubject = await replaceTrackingVariable(finalSubject, lead.id, "/");

      if (channel === "whatsapp") {
        // Enviar via Evolution API
        const phone = lead.phone?.replace(/\D/g, "") || "";
        if (!phone) {
          toast({ title: "Lead não possui telefone cadastrado", variant: "destructive" });
          setSending(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("send-whatsapp", {
          body: {
            phone: lead.phone,
            message: finalMessage,
            leadId: lead.id,
            leadName: lead.full_name,
            templateId: selectedTemplate?.id || null,
          },
        });

        if (error) {
          console.error("Evolution API error:", error);
          throw new Error("Falha ao enviar mensagem via WhatsApp");
        }

        toast({ title: "Mensagem enviada via WhatsApp!", description: "Enviado com sucesso pela Evolution API" });
      } else if (channel === "email") {
        // Enviar email via edge function
        const { error } = await supabase.functions.invoke("send-bulk-email", {
          body: {
            recipients: [{
              id: lead.id,
              email: lead.email,
              name: lead.full_name,
              type: "lead",
            }],
            subject: finalSubject,
            message: finalMessage,
            channel: "email",
          },
        });

        if (error) throw error;
        toast({ title: "Email enviado!" });
      } else {
        // Notificação - apenas registrar
        await supabase.from("communication_history").insert({
          recipient_id: lead.id,
          recipient_type: "lead",
          recipient_name: lead.full_name,
          recipient_email: lead.email,
          channel: "notification",
          message: finalMessage,
          subject: finalSubject,
          template_id: selectedTemplate?.id || null,
          status: "sent",
        });
        toast({ title: "Notificação registrada!" });
      }

      onMessageSent();
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const channels = [
    { id: "whatsapp" as Channel, label: "WhatsApp", icon: MessageCircle, available: !!lead?.phone },
    { id: "email" as Channel, label: "Email", icon: Mail, available: true },
    { id: "notification" as Channel, label: "Notificação", icon: Bell, available: true },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-secondary" />
            Enviar Mensagem para {lead?.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Escolha um cenário</Label>
              <ScenarioCards
                templates={templates}
                selectedId={selectedTemplate?.id}
                onSelect={handleTemplateSelect}
              />
            </div>
          )}

          {/* Channel Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Canal de envio</Label>
            <div className="flex gap-2">
              {channels.map((ch) => (
                <Button
                  key={ch.id}
                  type="button"
                  variant={channel === ch.id ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    channel === ch.id 
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                      : "bg-card border-border text-foreground hover:bg-muted",
                    !ch.available && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => ch.available && handleChannelChange(ch.id)}
                  disabled={!ch.available}
                >
                  <ch.icon className="w-4 h-4 mr-2" />
                  {ch.label}
                </Button>
              ))}
            </div>
            {channel === "whatsapp" && !lead?.phone && (
              <p className="text-xs text-destructive mt-2">Lead não possui telefone cadastrado</p>
            )}
          </div>

          {/* Subject (email only) */}
          {channel === "email" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Assunto</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do email..."
                className="bg-card border-border"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={6}
              className="bg-card border-border resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Variáveis: {"{{nome}}"}, {"{{nome_completo}}"}, {"{{email}}"}, {"{{link_tracking}}"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} className="bg-card border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
