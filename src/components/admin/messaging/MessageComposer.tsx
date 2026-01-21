import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Send, 
  Loader2,
  ExternalLink,
  AlertTriangle,
  Clock
} from "lucide-react";
import { ScenarioCards } from "./ScenarioCards";

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "student" | "lead";
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

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Recipient[];
  audienceType: "student" | "lead";
}

type Channel = "email" | "whatsapp" | "notification";

export function MessageComposer({
  isOpen,
  onClose,
  recipients,
  audienceType,
}: MessageComposerProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [channel, setChannel] = useState<Channel>("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      // Reset form
      setSelectedTemplate(null);
      setSubject("");
      setMessage("");
      setChannel("email");
    }
  }, [isOpen, audienceType]);

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("target_audience", audienceType)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (channel === "email") {
      setSubject(template.email_subject || "");
      setMessage(template.email_body || "");
    } else if (channel === "whatsapp") {
      setMessage(template.whatsapp_message || "");
    } else {
      setSubject(template.email_subject || "");
      setMessage(template.email_body || "");
    }
  };

  const handleChannelChange = (newChannel: Channel) => {
    setChannel(newChannel);
    if (selectedTemplate) {
      if (newChannel === "email" || newChannel === "notification") {
        setSubject(selectedTemplate.email_subject || "");
        setMessage(selectedTemplate.email_body || "");
      } else if (newChannel === "whatsapp") {
        setSubject("");
        setMessage(selectedTemplate.whatsapp_message || "");
      }
    }
  };

  // Substituição de variáveis APENAS para WhatsApp (local)
  // Para email/notification, a substituição acontece na edge function
  const replaceVariablesForWhatsApp = (text: string, recipient: Recipient) => {
    return text
      .replace(/\{\{nome\}\}/g, recipient.name)
      .replace(/\{\{email\}\}/g, recipient.email)
      .replace(/\{\{telefone\}\}/g, recipient.phone || "")
      // Fallback para formato antigo com 1 chave
      .replace(/\{nome\}/g, recipient.name)
      .replace(/\{email\}/g, recipient.email)
      .replace(/\{telefone\}/g, recipient.phone || "");
  };

  async function handleSend() {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "A mensagem não pode estar vazia",
        variant: "destructive",
      });
      return;
    }

    if (channel === "email" && !subject.trim()) {
      toast({
        title: "Erro",
        description: "O assunto é obrigatório para emails",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      if (channel === "whatsapp") {
        // Send via Evolution API
        const recipientsWithPhone = recipients
          .filter(r => r.phone)
          .map(r => ({
            id: r.id,
            name: r.name,
            phone: r.phone!,
            type: r.type,
          }));

        if (recipientsWithPhone.length === 0) {
          toast({
            title: "Erro",
            description: "Nenhum destinatário possui telefone",
            variant: "destructive",
          });
          setSending(false);
          return;
        }

        const { data: result, error } = await supabase.functions.invoke("send-bulk-whatsapp", {
          body: {
            recipients: recipientsWithPhone,
            message,
            templateId: selectedTemplate?.id,
          },
        });

        if (error) {
          throw new Error(error.message || "Erro ao enviar WhatsApp");
        }

        toast({
          title: "WhatsApp enviado!",
          description: `${result.sent} mensagem(ns) enviada(s)${result.failed > 0 ? `, ${result.failed} falha(s)` : ""}`,
        });


      } else {
        // Send via edge function (email or notification)
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke("send-bulk-email", {
          body: {
            recipients,
            subject,
            message,
            templateId: selectedTemplate?.id,
            channel,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const result = response.data;

        toast({
          title: "Enviado com sucesso!",
          description: `${result.sent} mensagem(ns) enviada(s)${result.failed > 0 ? `, ${result.failed} falha(s)` : ""}`,
        });
      }

      onClose();

    } catch (error: any) {
      console.error("Error sending:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  const channelOptions = [
    { id: "email" as Channel, label: "Email", icon: Mail, available: true },
    { id: "whatsapp" as Channel, label: "WhatsApp", icon: MessageSquare, available: recipients.some(r => r.phone) },
    { id: "notification" as Channel, label: "Notificação", icon: Bell, available: audienceType === "student" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Nova Mensagem - {recipients.length} destinatário(s)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scenario/Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-3">
              <Label className="text-muted-foreground">
                Escolha um cenário (ou escreva manualmente)
              </Label>
              <ScenarioCards
                templates={templates}
                selectedId={selectedTemplate?.id}
                onSelect={handleTemplateSelect}
              />
            </div>
          )}

          {/* Channel Selection */}
          <div className="space-y-3">
            <Label className="text-foreground">Canal de envio</Label>
            <div className="flex gap-2">
              {channelOptions.map((opt) => (
                <Button
                  key={opt.id}
                  variant={channel === opt.id ? "gold" : "outline"}
                  onClick={() => handleChannelChange(opt.id)}
                  disabled={!opt.available}
                  className={`flex-1 ${channel !== opt.id ? 'bg-card border-border text-foreground hover:bg-muted' : ''}`}
                >
                  <opt.icon className="h-4 w-4 mr-2" />
                  {opt.label}
                  {!opt.available && opt.id === "whatsapp" && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-muted text-muted-foreground">
                      Sem telefone
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Subject (for email/notification) */}
          {(channel === "email" || channel === "notification") && (
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Digite o assunto..."
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={8}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis disponíveis: <code className="text-secondary">{"{{nome}}"}</code>, <code className="text-secondary">{"{{email}}"}</code>, <code className="text-secondary">{"{{telefone}}"}</code>
            </p>
          </div>

          {/* WhatsApp info and anti-spam warnings */}
          {channel === "whatsapp" && (
            <div className="space-y-3">
              {/* Risk alert for large volumes */}
              {recipients.filter(r => r.phone).length > 20 && (
                <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-600 dark:text-amber-400">Atenção: Volume Alto</AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground">
                    Enviar {recipients.filter(r => r.phone).length} mensagens pode demorar aproximadamente{" "}
                    <strong>{Math.ceil(recipients.filter(r => r.phone).length * 7.5 / 60)} minutos</strong>.
                    O sistema usará delays de 5-10s entre mensagens para evitar bloqueio.
                  </AlertDescription>
                </Alert>
              )}

              {/* Estimated time */}
              {recipients.filter(r => r.phone).length > 5 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-border">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Tempo estimado: <strong>{Math.ceil(recipients.filter(r => r.phone).length * 7.5 / 60)} min</strong>
                    {" "}• Limite: 25/hora
                  </span>
                </div>
              )}

              <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground flex items-start gap-2 border border-border">
                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>
                  Mensagens serão enviadas automaticamente via Evolution API com proteção anti-spam ativa.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} disabled={sending} className="bg-card border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button variant="gold" onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar para {recipients.length} pessoa(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
